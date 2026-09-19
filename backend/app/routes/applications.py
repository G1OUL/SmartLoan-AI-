import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app.database import db
from app.models import LoanApplication
from app.ml.predictor import predict_loan_approval

applications_bp = Blueprint('applications', __name__, url_prefix='/api/v1/applications')

@applications_bp.route('', methods=['POST'])
def submit_application():
    data = request.get_json() or {}
    
    # Try to extract user ID if authenticated
    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity:
            user_id = int(identity)
    except Exception:
        user_id = None
        
    # Calculate prediction and ratios
    try:
        pred_result = predict_loan_approval(data)
    except Exception as e:
        return jsonify({'error': f"Prediction failed: {str(e)}"}), 400
        
    application = LoanApplication(
        user_id=user_id,
        applicant_name=data.get('applicant_name', 'Applicant'),
        age=int(data.get('age', 30)),
        marital_status=data.get('marital_status', 'Married'),
        dependents=int(data.get('dependents', 0)),
        education=data.get('education', 'Graduate'),
        employment_type=data.get('employment_type', 'Salaried'),
        monthly_income=float(data.get('monthly_income', 50000)),
        coapplicant_income=float(data.get('coapplicant_income', 0)),
        existing_emi=float(data.get('existing_emi', 0)),
        credit_score=int(data.get('credit_score', 750)),
        past_defaults=int(data.get('past_defaults', 0)),
        loan_category=data.get('loan_category', 'Personal'),
        loan_amount=float(data.get('loan_amount', 500000)),
        loan_tenure_months=int(data.get('loan_tenure_months', 60)),
        loan_purpose=data.get('loan_purpose', 'Personal use'),
        dti_ratio=pred_result['ratios']['dti_ratio'],
        lti_ratio=pred_result['ratios']['lti_ratio'],
        foir_ratio=pred_result['ratios']['foir_ratio'],
        approval_probability=pred_result['approval_probability'],
        approval_band=pred_result['approval_band'],
        recommended_bank=pred_result['recommended_bank'],
        status='Pre-Approved' if pred_result['approval_probability'] >= 50 else 'Under Review',
        key_factors_json=json.dumps(pred_result['key_factors'])
    )
    
    db.session.add(application)
    db.session.commit()
    
    resp_data = application.to_dict()
    resp_data['bank_comparisons'] = pred_result.get('bank_comparisons', [])
    resp_data['recommendation'] = pred_result.get('recommendation', '')
    
    return jsonify({
        'message': 'Loan application submitted and scored successfully',
        'application': resp_data
    }), 201

@applications_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_applications():
    user_id = int(get_jwt_identity())
    apps = LoanApplication.query.filter_by(user_id=user_id).order_by(LoanApplication.created_at.desc()).all()
    return jsonify({'applications': [a.to_dict() for a in apps]}), 200

@applications_bp.route('/<int:app_id>', methods=['GET'])
def get_application_by_id(app_id):
    app = LoanApplication.query.get(app_id)
    if not app:
        return jsonify({'error': 'Application not found'}), 404
        
    # Recalculate bank comparison dynamically for the report/view
    data = {
        'age': app.age,
        'marital_status': app.marital_status,
        'dependents': app.dependents,
        'education': app.education,
        'employment_type': app.employment_type,
        'monthly_income': app.monthly_income,
        'coapplicant_income': app.coapplicant_income,
        'existing_emi': app.existing_emi,
        'credit_score': app.credit_score,
        'past_defaults': app.past_defaults,
        'loan_category': app.loan_category,
        'loan_amount': app.loan_amount,
        'loan_tenure_months': app.loan_tenure_months
    }
    pred_result = predict_loan_approval(data)
    
    resp_data = app.to_dict()
    resp_data['bank_comparisons'] = pred_result.get('bank_comparisons', [])
    resp_data['recommendation'] = pred_result.get('recommendation', '')
    
    return jsonify({'application': resp_data}), 200
