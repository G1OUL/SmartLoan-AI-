import os
import json
import numpy as np
import pandas as pd
import joblib

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CURRENT_DIR, 'loan_model.pkl')
METADATA_PATH = os.path.join(CURRENT_DIR, 'model_metadata.json')

_model = None
_metadata = None

def get_model():
    global _model, _metadata
    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
        else:
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Run train_model.py first.")
    if _metadata is None and os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, 'r') as f:
            _metadata = json.load(f)
    return _model, _metadata

def calculate_financial_ratios(monthly_income, coapplicant_income, existing_emi, loan_amount, loan_tenure_months, annual_rate=0.10):
    total_income = max(monthly_income + coapplicant_income, 1.0)
    
    # Calculate estimated monthly EMI for new loan
    r = (annual_rate / 12)
    n = max(loan_tenure_months, 1)
    if r > 0:
        est_emi = (loan_amount * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1)
    else:
        est_emi = loan_amount / n
        
    dti_ratio = round(existing_emi / total_income, 4)
    lti_ratio = round(loan_amount / (total_income * 12), 4)
    foir_ratio = round((existing_emi + est_emi) / total_income, 4)
    
    return {
        'dti_ratio': dti_ratio,
        'lti_ratio': lti_ratio,
        'foir_ratio': foir_ratio,
        'estimated_new_emi': round(est_emi, 2)
    }

def predict_loan_approval(data):
    """
    data: dict containing:
      age, marital_status, dependents, education, employment_type,
      monthly_income, coapplicant_income, existing_emi, loan_category,
      loan_amount, loan_tenure_months, credit_score, past_defaults, credit_inquiries
    """
    model, metadata = get_model()
    
    monthly_income = float(data.get('monthly_income', 50000))
    coapplicant_income = float(data.get('coapplicant_income', 0))
    existing_emi = float(data.get('existing_emi', 0))
    loan_amount = float(data.get('loan_amount', 500000))
    loan_tenure_months = int(data.get('loan_tenure_months', 60))
    credit_score = int(data.get('credit_score', 750))
    past_defaults = int(data.get('past_defaults', 0))
    credit_inquiries = int(data.get('credit_inquiries', 1))
    
    ratios = calculate_financial_ratios(
        monthly_income, coapplicant_income, existing_emi,
        loan_amount, loan_tenure_months
    )
    
    input_df = pd.DataFrame([{
        'age': int(data.get('age', 30)),
        'marital_status': str(data.get('marital_status', 'Married')),
        'dependents': int(data.get('dependents', 1)),
        'education': str(data.get('education', 'Graduate')),
        'employment_type': str(data.get('employment_type', 'Salaried')),
        'monthly_income': monthly_income,
        'coapplicant_income': coapplicant_income,
        'existing_emi': existing_emi,
        'loan_category': str(data.get('loan_category', 'Personal')),
        'loan_amount': loan_amount,
        'loan_tenure_months': loan_tenure_months,
        'credit_score': credit_score,
        'past_defaults': past_defaults,
        'credit_inquiries': credit_inquiries,
        'dti_ratio': ratios['dti_ratio'],
        'lti_ratio': ratios['lti_ratio'],
        'foir_ratio': ratios['foir_ratio']
    }])
    
    # Model inference
    proba = model.predict_proba(input_df)[0][1] # Probability of approval
    raw_score = round(proba * 100, 1)
    
    # Deterministic guardrails based on credit policy
    if credit_score < 550 or past_defaults >= 3 or ratios['foir_ratio'] > 0.85:
        adjusted_score = min(raw_score, 18.0)
    elif credit_score >= 780 and ratios['foir_ratio'] <= 0.40 and past_defaults == 0:
        adjusted_score = max(raw_score, 88.0)
    else:
        adjusted_score = raw_score
        
    adjusted_score = max(1.0, min(99.0, adjusted_score))
    
    if adjusted_score >= 75.0:
        approval_band = "High"
        recommendation = "Excellent approval likelihood across prime commercial banks."
    elif adjusted_score >= 50.0:
        approval_band = "Moderate"
        recommendation = "Moderate approval odds. Adding a co-applicant or opting for a longer tenure improves sanction chances."
    else:
        approval_band = "Low"
        recommendation = "High rejection risk. Consider improving CIBIL score, reducing existing debt obligations, or lowering requested loan amount."
        
    # Explainability factors (Top 4 contributing drivers)
    factors = []
    if credit_score >= 750:
        factors.append({"factor": "High Credit Score", "impact": "Positive", "detail": f"CIBIL {credit_score} is in the prime band (>750)"})
    elif credit_score < 650:
        factors.append({"factor": "Subprime Credit Score", "impact": "Negative", "detail": f"CIBIL {credit_score} is below preferred threshold (680+)"})
        
    if ratios['foir_ratio'] <= 0.40:
        factors.append({"factor": "Healthy FOIR Ratio", "impact": "Positive", "detail": f"Obligations are {round(ratios['foir_ratio']*100)}% of income (Ideal < 45%)"})
    elif ratios['foir_ratio'] > 0.60:
        factors.append({"factor": "Elevated Debt Burden (FOIR)", "impact": "Negative", "detail": f"Fixed obligations consume {round(ratios['foir_ratio']*100)}% of income"})
        
    if past_defaults == 0:
        factors.append({"factor": "Clean Repayment History", "impact": "Positive", "detail": "Zero recorded defaults on credit record"})
    else:
        factors.append({"factor": "Past Defaults Recorded", "impact": "Negative", "detail": f"{past_defaults} default instance(s) detected"})
        
    if monthly_income >= 60000:
        factors.append({"factor": "Adequate Income Solvency", "impact": "Positive", "detail": f"Net income of ₹{int(monthly_income):,} exceeds benchmark"})
    elif monthly_income < 25000:
        factors.append({"factor": "Low Monthly Cash Flow", "impact": "Negative", "detail": f"Net income of ₹{int(monthly_income):,} may limit eligibility"})
        
    if coapplicant_income > 0:
        factors.append({"factor": "Co-Applicant Income Added", "impact": "Positive", "detail": f"Boosts borrowing capacity with additional ₹{int(coapplicant_income):,}"})
        
    # Partner Banks specific approval probabilities and tailored offers
    partner_banks = [
        {"name": "State Bank of India (SBI)", "code": "SBI", "base_rate": 8.50, "min_cibil": 650, "fee_pct": 0.50, "max_amt": 15000000, "weight": 1.0},
        {"name": "HDFC Bank", "code": "HDFC", "base_rate": 8.70, "min_cibil": 700, "fee_pct": 1.00, "max_amt": 10000000, "weight": 0.96},
        {"name": "ICICI Bank", "code": "ICICI", "base_rate": 8.75, "min_cibil": 680, "fee_pct": 0.75, "max_amt": 10000000, "weight": 0.98},
        {"name": "Axis Bank", "code": "AXIS", "base_rate": 8.90, "min_cibil": 675, "fee_pct": 1.00, "max_amt": 8000000, "weight": 0.95},
        {"name": "Kotak Mahindra Bank", "code": "KOTAK", "base_rate": 8.85, "min_cibil": 710, "fee_pct": 0.85, "max_amt": 7500000, "weight": 0.92},
        {"name": "Bank of Baroda", "code": "BOB", "base_rate": 8.40, "min_cibil": 650, "fee_pct": 0.50, "max_amt": 12000000, "weight": 1.02},
        {"name": "Punjab National Bank", "code": "PNB", "base_rate": 8.45, "min_cibil": 660, "fee_pct": 0.40, "max_amt": 10000000, "weight": 1.01}
    ]
    
    bank_odds = []
    for bank in partner_banks:
        # Bank specific policy adjustment
        bank_p = adjusted_score * bank['weight']
        if credit_score < bank['min_cibil']:
            bank_p *= 0.65
        if monthly_income < 30000 and bank['code'] in ['HDFC', 'KOTAK']:
            bank_p *= 0.80
        bank_p = round(max(2.0, min(99.0, bank_p)), 1)
        
        # Calculate true costs for this bank
        r_b = (bank['base_rate'] / 100) / 12
        emi_b = (loan_amount * r_b * ((1 + r_b) ** loan_tenure_months)) / (((1 + r_b) ** loan_tenure_months) - 1)
        proc_fee = round(loan_amount * (bank['fee_pct'] / 100), 2)
        proc_gst = round(proc_fee * 0.18, 2)
        ins_charge = round(loan_amount * 0.005, 2)
        doc_charges = 1500.0
        total_upfront = proc_fee + proc_gst + ins_charge + doc_charges
        total_repayment = (emi_b * loan_tenure_months) + total_upfront
        total_interest = (emi_b * loan_tenure_months) - loan_amount
        
        # Effective APR approx: annualized internal rate considering upfront fees
        effective_apr = round(bank['base_rate'] + ((total_upfront / loan_amount) / (loan_tenure_months / 12)) * 100 * 0.65, 2)
        
        bank_odds.append({
            "bank_name": bank['name'],
            "bank_code": bank['code'],
            "approval_probability": bank_p,
            "headline_rate": bank['base_rate'],
            "effective_apr": effective_apr,
            "monthly_emi": round(emi_b, 2),
            "processing_fee": proc_fee,
            "gst_on_fee": proc_gst,
            "insurance_charge": ins_charge,
            "doc_charges": doc_charges,
            "total_upfront_fees": round(total_upfront, 2),
            "total_interest": round(total_interest, 2),
            "total_cost_of_borrowing": round(total_repayment, 2)
        })
        
    bank_odds = sorted(bank_odds, key=lambda x: (-x['approval_probability'], x['effective_apr']))
    best_bank = bank_odds[0]['bank_name'] if bank_odds else "SBI"
    
    return {
        "approval_probability": adjusted_score,
        "approval_band": approval_band,
        "recommendation": recommendation,
        "ratios": ratios,
        "key_factors": factors,
        "recommended_bank": best_bank,
        "bank_comparisons": bank_odds
    }
