import os
import json
from app import create_app
from app.database import db
from app.models import User, BankProduct, LoanApplication

def test_full_pipeline():
    app = create_app()
    client = app.test_client()
    
    # 1. Test Health
    res = client.get('/health')
    assert res.status_code == 200
    assert res.json['status'] == 'healthy'
    print("[PASS] Health Check Passed")
    
    # 2. Test Auth Login (Demo Borrower)
    login_res = client.post('/api/v1/auth/login', json={
        'email': 'borrower@smartloan.ai',
        'password': 'Borrower@123'
    })
    assert login_res.status_code == 200
    token = login_res.json['access_token']
    assert token is not None
    headers = {'Authorization': f'Bearer {token}'}
    print("[PASS] Auth Login Passed")
    
    # 3. Test Bank Listing
    banks_res = client.get('/api/v1/banks')
    assert banks_res.status_code == 200
    assert len(banks_res.json['banks']) > 0
    print(f"[PASS] Bank Listing Passed: {len(banks_res.json['banks'])} banks")
    
    # 4. Test ML Approval Prediction
    pred_res = client.post('/api/v1/predict/approval', json={
        'age': 32,
        'marital_status': 'Married',
        'dependents': 1,
        'education': 'Graduate',
        'employment_type': 'Salaried',
        'monthly_income': 75000,
        'coapplicant_income': 30000,
        'existing_emi': 12000,
        'loan_category': 'Home',
        'loan_amount': 3500000,
        'loan_tenure_months': 240,
        'credit_score': 760,
        'past_defaults': 0,
        'credit_inquiries': 1
    })
    assert pred_res.status_code == 200
    assert 'approval_probability' in pred_res.json
    assert 'bank_comparisons' in pred_res.json
    print(f"[PASS] ML Prediction Passed: Probability={pred_res.json['approval_probability']}%, Band={pred_res.json['approval_band']}")
    
    # 5. Test Calculator Cost Breakdown
    calc_res = client.post('/api/v1/calculator/cost-breakdown', json={
        'loan_amount': 2500000,
        'annual_interest_rate': 8.5,
        'tenure_months': 180,
        'processing_fee_pct': 1.0,
        'insurance_rate_pct': 0.5,
        'doc_charges': 1500
    })
    assert calc_res.status_code == 200
    assert 'monthly_emi' in calc_res.json
    assert 'effective_apr' in calc_res.json
    assert 'pie_breakdown' in calc_res.json
    print(f"[PASS] True Cost Calculator Passed: EMI={calc_res.json['monthly_emi']}, APR={calc_res.json['effective_apr']}%")
    
    # 6. Test Document Checklist
    doc_res = client.get('/api/v1/documents/checklist?employment_type=Salaried&loan_category=Home')
    assert doc_res.status_code == 200
    assert len(doc_res.json['checklist']) > 0
    print(f"[PASS] Document Checklist Passed: {len(doc_res.json['checklist'])} items")
    
    # 7. Test Application Submission & PDF Report
    app_res = client.post('/api/v1/applications', headers=headers, json={
        'applicant_name': 'Rahul Sharma',
        'age': 32,
        'marital_status': 'Married',
        'dependents': 1,
        'education': 'Graduate',
        'employment_type': 'Salaried',
        'monthly_income': 85000,
        'coapplicant_income': 40000,
        'existing_emi': 12000,
        'loan_category': 'Home',
        'loan_amount': 4500000,
        'loan_tenure_months': 240,
        'credit_score': 780,
        'past_defaults': 0,
        'credit_inquiries': 1
    })
    assert app_res.status_code == 201
    created_id = app_res.json['application']['id']
    print(f"[PASS] Loan Application Submitted: ID={created_id}")
    
    pdf_res = client.get(f'/api/v1/applications/{created_id}/report')
    assert pdf_res.status_code == 200
    assert pdf_res.headers['Content-Type'] == 'application/pdf'
    assert len(pdf_res.data) > 1000
    print(f"[PASS] PDF Advisory Report Generated: {len(pdf_res.data)} bytes")
    
    # 8. Test AI Financial Advisor Chat
    chat_res = client.post('/api/v1/chat/advisor', json={
        'message': 'What is the difference between flat and reducing interest rates?'
    })
    assert chat_res.status_code == 200
    assert 'reply' in chat_res.json
    assert 'reducing' in chat_res.json['reply'].lower()
    print("[PASS] AI Financial Advisor Chat Passed")
    
    # 9. Test Admin Analytics
    admin_res = client.get('/api/v1/admin/analytics')
    assert admin_res.status_code == 200
    assert 'overview' in admin_res.json
    assert 'model_metrics' in admin_res.json
    print(f"[PASS] Admin Analytics Passed: Total Apps={admin_res.json['overview']['total_applications']}")
    
    print("\nSUCCESS: ALL BACKEND API ENDPOINTS & ML PIPELINES VERIFIED SUCCESSFULLY!")

if __name__ == '__main__':
    test_full_pipeline()
