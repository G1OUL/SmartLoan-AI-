import json
import bcrypt
from app.database import db
from app.models import User, BankProduct, LoanApplication, SystemMetric

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_database():
    db.create_all()
    
    # 1. Seed Users
    if not User.query.filter_by(email='admin@smartloan.ai').first():
        admin = User(
            email='admin@smartloan.ai',
            full_name='System Administrator',
            password_hash=hash_password('Admin@123'),
            role='admin',
            phone='+91 98765 43210'
        )
        db.session.add(admin)
        
    if not User.query.filter_by(email='borrower@smartloan.ai').first():
        borrower = User(
            email='borrower@smartloan.ai',
            full_name='Rahul Sharma',
            password_hash=hash_password('Borrower@123'),
            role='borrower',
            phone='+91 98123 45678'
        )
        db.session.add(borrower)
        
    db.session.commit()
    
    # 2. Seed Bank Products
    if BankProduct.query.count() == 0:
        banks = [
            # Home Loans
            {
                "bank_name": "State Bank of India (SBI)",
                "code": "SBI",
                "logo_url": "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&auto=format&fit=crop&q=60",
                "loan_category": "Home",
                "min_interest_rate": 8.50,
                "max_interest_rate": 9.25,
                "processing_fee_pct": 0.35,
                "min_processing_fee": 2000.0,
                "max_processing_fee": 10000.0,
                "min_cibil": 650,
                "max_tenure_years": 30,
                "min_income": 25000.0,
                "insurance_rate_pct": 0.40,
                "doc_charges": 1500.0,
                "prepayment_penalty": "Zero charges on floating rate home loans",
                "rating": 4.8,
                "special_features": json.dumps(["Special 0.05% concession for women borrowers", "Overdraft facility with SBI Maxgain", "No hidden prepayment charges"])
            },
            {
                "bank_name": "HDFC Bank",
                "code": "HDFC",
                "logo_url": "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=100&auto=format&fit=crop&q=60",
                "loan_category": "Home",
                "min_interest_rate": 8.70,
                "max_interest_rate": 9.40,
                "processing_fee_pct": 0.50,
                "min_processing_fee": 3000.0,
                "max_processing_fee": 15000.0,
                "min_cibil": 700,
                "max_tenure_years": 30,
                "min_income": 30000.0,
                "insurance_rate_pct": 0.45,
                "doc_charges": 2000.0,
                "prepayment_penalty": "Nil on floating rates",
                "rating": 4.7,
                "special_features": json.dumps(["Instant digital sanction in 10 minutes", "Doorstep document pickup", "Custom step-up repayment facility"])
            },
            {
                "bank_name": "ICICI Bank",
                "code": "ICICI",
                "logo_url": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=60",
                "loan_category": "Home",
                "min_interest_rate": 8.75,
                "max_interest_rate": 9.50,
                "processing_fee_pct": 0.50,
                "min_processing_fee": 2500.0,
                "max_processing_fee": 12000.0,
                "min_cibil": 680,
                "max_tenure_years": 30,
                "min_income": 25000.0,
                "insurance_rate_pct": 0.50,
                "doc_charges": 1800.0,
                "prepayment_penalty": "Nil on floating rate",
                "rating": 4.6,
                "special_features": json.dumps(["Extra 1% discount on pre-approved property", "Paperless e-KYC sanction", "Flexi EMI options"])
            },
            {
                "bank_name": "Bank of Baroda",
                "code": "BOB",
                "logo_url": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=60",
                "loan_category": "Home",
                "min_interest_rate": 8.40,
                "max_interest_rate": 9.15,
                "processing_fee_pct": 0.25,
                "min_processing_fee": 1500.0,
                "max_processing_fee": 8500.0,
                "min_cibil": 650,
                "max_tenure_years": 30,
                "min_income": 20000.0,
                "insurance_rate_pct": 0.35,
                "doc_charges": 1200.0,
                "prepayment_penalty": "Zero penalty on floating loans",
                "rating": 4.5,
                "special_features": json.dumps(["Lowest processing fee in public sector", "Baroda Home Loan Advantage", "Quick branch turnaround"])
            },
            # Personal Loans
            {
                "bank_name": "HDFC Bank",
                "code": "HDFC",
                "logo_url": "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=100&auto=format&fit=crop&q=60",
                "loan_category": "Personal",
                "min_interest_rate": 10.50,
                "max_interest_rate": 14.50,
                "processing_fee_pct": 1.50,
                "min_processing_fee": 1999.0,
                "max_processing_fee": 15000.0,
                "min_cibil": 720,
                "max_tenure_years": 5,
                "min_income": 35000.0,
                "insurance_rate_pct": 0.60,
                "doc_charges": 1000.0,
                "prepayment_penalty": "4% of principal after 12 months",
                "rating": 4.7,
                "special_features": json.dumps(["Funds disbursed in 10 seconds for pre-approved", "Loan up to ₹40 Lakhs", "Flexible tenure 12-60 months"])
            },
            {
                "bank_name": "Axis Bank",
                "code": "AXIS",
                "logo_url": "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=100&auto=format&fit=crop&q=60",
                "loan_category": "Personal",
                "min_interest_rate": 10.75,
                "max_interest_rate": 15.00,
                "processing_fee_pct": 1.25,
                "min_processing_fee": 1500.0,
                "max_processing_fee": 12500.0,
                "min_cibil": 680,
                "max_tenure_years": 5,
                "min_income": 25000.0,
                "insurance_rate_pct": 0.50,
                "doc_charges": 1200.0,
                "prepayment_penalty": "Nil foreclosure charges after 18 EMIs",
                "rating": 4.5,
                "special_features": json.dumps(["Competitive rates for existing salary accounts", "End-to-end 24x7 digital process", "No security or guarantor required"])
            },
            {
                "bank_name": "Kotak Mahindra Bank",
                "code": "KOTAK",
                "logo_url": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=60",
                "loan_category": "Personal",
                "min_interest_rate": 10.90,
                "max_interest_rate": 15.50,
                "processing_fee_pct": 1.50,
                "min_processing_fee": 2000.0,
                "max_processing_fee": 14000.0,
                "min_cibil": 700,
                "max_tenure_years": 5,
                "min_income": 30000.0,
                "insurance_rate_pct": 0.55,
                "doc_charges": 1000.0,
                "prepayment_penalty": "3% foreclosure charges after 12 months",
                "rating": 4.4,
                "special_features": json.dumps(["Instant in-principle sanction", "Repayment flexibility", "Special corporate employee rates"])
            },
            # Education Loans
            {
                "bank_name": "State Bank of India (SBI)",
                "code": "SBI",
                "logo_url": "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&auto=format&fit=crop&q=60",
                "loan_category": "Education",
                "min_interest_rate": 8.15,
                "max_interest_rate": 10.20,
                "processing_fee_pct": 0.00,
                "min_processing_fee": 0.0,
                "max_processing_fee": 5000.0,
                "min_cibil": 650,
                "max_tenure_years": 15,
                "min_income": 20000.0,
                "insurance_rate_pct": 0.30,
                "doc_charges": 500.0,
                "prepayment_penalty": "Nil throughout tenure",
                "rating": 4.9,
                "special_features": json.dumps(["Zero processing fee for studies in India", "0.50% concession for female students", "Tax exemption under Section 80E"])
            },
            # Vehicle Loans
            {
                "bank_name": "Punjab National Bank",
                "code": "PNB",
                "logo_url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=100&auto=format&fit=crop&q=60",
                "loan_category": "Vehicle",
                "min_interest_rate": 8.65,
                "max_interest_rate": 9.80,
                "processing_fee_pct": 0.50,
                "min_processing_fee": 1000.0,
                "max_processing_fee": 5000.0,
                "min_cibil": 670,
                "max_tenure_years": 7,
                "min_income": 22000.0,
                "insurance_rate_pct": 0.40,
                "doc_charges": 1000.0,
                "prepayment_penalty": "Nil on floating rates",
                "rating": 4.5,
                "special_features": json.dumps(["Up to 90% on-road car financing", "Electric vehicle special concession", "Quick verification"])
            }
        ]
        for b in banks:
            db.session.add(BankProduct(**b))
            
    # 3. Seed Sample Applications if empty
    if LoanApplication.query.count() == 0:
        demo_borrower = User.query.filter_by(email='borrower@smartloan.ai').first()
        b_id = demo_borrower.id if demo_borrower else None
        
        sample_apps = [
            {
                "user_id": b_id,
                "applicant_name": "Rahul Sharma",
                "age": 32,
                "marital_status": "Married",
                "dependents": 1,
                "education": "Graduate",
                "employment_type": "Salaried",
                "monthly_income": 85000.0,
                "coapplicant_income": 40000.0,
                "existing_emi": 12000.0,
                "credit_score": 780,
                "past_defaults": 0,
                "loan_category": "Home",
                "loan_amount": 4500000.0,
                "loan_tenure_months": 240,
                "loan_purpose": "Purchase 2BHK Apartment in Pune",
                "dti_ratio": 0.096,
                "lti_ratio": 3.0,
                "foir_ratio": 0.41,
                "approval_probability": 94.2,
                "approval_band": "High",
                "recommended_bank": "State Bank of India (SBI)",
                "status": "Pre-Approved",
                "key_factors_json": json.dumps([
                    {"factor": "High Credit Score", "impact": "Positive", "detail": "CIBIL 780 is in the prime band (>750)"},
                    {"factor": "Healthy FOIR Ratio", "impact": "Positive", "detail": "Fixed obligations are 41% of income"},
                    {"factor": "Co-Applicant Income", "impact": "Positive", "detail": "Added ₹40,000 monthly cash flow"}
                ])
            },
            {
                "user_id": b_id,
                "applicant_name": "Pooja Kulkarni",
                "age": 28,
                "marital_status": "Single",
                "dependents": 0,
                "education": "Post-Graduate",
                "employment_type": "Salaried",
                "monthly_income": 65000.0,
                "coapplicant_income": 0.0,
                "existing_emi": 8000.0,
                "credit_score": 735,
                "past_defaults": 0,
                "loan_category": "Personal",
                "loan_amount": 500000.0,
                "loan_tenure_months": 36,
                "loan_purpose": "Home Renovation",
                "dti_ratio": 0.123,
                "lti_ratio": 0.64,
                "foir_ratio": 0.37,
                "approval_probability": 88.5,
                "approval_band": "High",
                "recommended_bank": "HDFC Bank",
                "status": "Pre-Approved",
                "key_factors_json": json.dumps([
                    {"factor": "Prime Credit History", "impact": "Positive", "detail": "CIBIL 735 demonstrates strong reliability"},
                    {"factor": "Low Debt Ratio", "impact": "Positive", "detail": "Total obligation well under 40%"}
                ])
            },
            {
                "user_id": b_id,
                "applicant_name": "Vikram Patil",
                "age": 41,
                "marital_status": "Married",
                "dependents": 2,
                "education": "Graduate",
                "employment_type": "Self-Employed",
                "monthly_income": 45000.0,
                "coapplicant_income": 0.0,
                "existing_emi": 22000.0,
                "credit_score": 630,
                "past_defaults": 1,
                "loan_category": "Personal",
                "loan_amount": 800000.0,
                "loan_tenure_months": 48,
                "loan_purpose": "Business Working Capital",
                "dti_ratio": 0.488,
                "lti_ratio": 1.48,
                "foir_ratio": 0.72,
                "approval_probability": 38.4,
                "approval_band": "Low",
                "recommended_bank": "Bank of Baroda",
                "status": "Under Review",
                "key_factors_json": json.dumps([
                    {"factor": "Subprime CIBIL Score", "impact": "Negative", "detail": "Score of 630 requires collateral or guarantor"},
                    {"factor": "High Debt Burden (FOIR)", "impact": "Negative", "detail": "Existing EMIs consume 49% of net income"}
                ])
            }
        ]
        for app in sample_apps:
            db.session.add(LoanApplication(**app))
            
    db.session.commit()
    print("Database seeded successfully with Users, Bank Products, and Sample Applications.")
