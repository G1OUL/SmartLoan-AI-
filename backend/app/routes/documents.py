import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.database import db
from app.models import Document, LoanApplication

documents_bp = Blueprint('documents', __name__, url_prefix='/api/v1/documents')

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@documents_bp.route('/checklist', methods=['GET'])
def get_document_checklist():
    emp_type = request.args.get('employment_type', 'Salaried')
    loan_cat = request.args.get('loan_category', 'Personal')
    
    checklist = [
        {
            "doc_type": "Identity Proof (Aadhaar / Passport / Voter ID)",
            "mandatory": True,
            "description": "Government issued photo identity with clear address match.",
            "category": "KYC"
        },
        {
            "doc_type": "PAN Card",
            "mandatory": True,
            "description": "Permanent Account Number for credit bureau verification.",
            "category": "KYC"
        }
    ]
    
    if emp_type == 'Salaried':
        checklist.extend([
            {
                "doc_type": "Latest 3 Months Salary Slips",
                "mandatory": True,
                "description": "Demonstrating net salary credits and allowances.",
                "category": "Income"
            },
            {
                "doc_type": "Latest 6 Months Bank Account Statement",
                "mandatory": True,
                "description": "Salary account statement reflecting regular monthly salary credits.",
                "category": "Banking"
            },
            {
                "doc_type": "Form 16 / ITR (Last 2 Years)",
                "mandatory": True,
                "description": "Employer tax deduction certificate and annual gross income proof.",
                "category": "Tax"
            }
        ])
    else: # Self-Employed or Business
        checklist.extend([
            {
                "doc_type": "Last 2-3 Years ITR with Computation of Income",
                "mandatory": True,
                "description": "Income Tax returns certified by Chartered Accountant.",
                "category": "Tax"
            },
            {
                "doc_type": "Audited Profit & Loss Account & Balance Sheet",
                "mandatory": True,
                "description": "Audited financial statements for previous 2 financial years.",
                "category": "Financials"
            },
            {
                "doc_type": "Last 12 Months Current Account Statement",
                "mandatory": True,
                "description": "Business primary operating account showing cash flows and turnovers.",
                "category": "Banking"
            },
            {
                "doc_type": "Business Proof / GST Registration Certificate",
                "mandatory": True,
                "description": "Shop Act license, GST registration or Udyam MSME certificate.",
                "category": "Business"
            }
        ])
        
    if loan_cat == 'Home':
        checklist.extend([
            {
                "doc_type": "Property Agreement / Allotment Letter",
                "mandatory": True,
                "description": "Registered agreement for sale or allotment letter from builder.",
                "category": "Property"
            },
            {
                "doc_type": "Approved Building Plan & NOC",
                "mandatory": True,
                "description": "Municipal approval layout and builder no-objection certificate.",
                "category": "Property"
            }
        ])
    elif loan_cat == 'Education':
        checklist.extend([
            {
                "doc_type": "Admission Letter / Offer Letter",
                "mandatory": True,
                "description": "Formal admission offer from recognized university/institution.",
                "category": "Academic"
            },
            {
                "doc_type": "Course Fee Schedule & Estimate",
                "mandatory": True,
                "description": "Breakdown of tuition, hostel, and exam fees issued by institution.",
                "category": "Academic"
            }
        ])
    elif loan_cat == 'Vehicle':
        checklist.extend([
            {
                "doc_type": "Dealer Proforma Invoice / Price Quotation",
                "mandatory": True,
                "description": "Official on-road quotation issued by authorized vehicle dealership.",
                "category": "Vehicle"
            }
        ])
        
    return jsonify({
        'employment_type': emp_type,
        'loan_category': loan_cat,
        'checklist': checklist
    }), 200

@documents_bp.route('/upload', methods=['POST'])
def upload_document():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400
        
    file = request.files['file']
    doc_type = request.form.get('doc_type', 'General Document')
    application_id = request.form.get('application_id')
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
        
    if not allowed_file(file.filename):
        return jsonify({'error': f'File format not allowed. Allowed: {current_app.config["ALLOWED_EXTENSIONS"]}'}), 400
        
    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity:
            user_id = int(identity)
    except Exception:
        user_id = None
        
    upload_folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)
    
    filename = secure_filename(file.filename)
    unique_name = f"{doc_type.replace(' ', '_').lower()}_{int(os.path.getmtime(upload_folder) if os.path.exists(upload_folder) else 0)}_{filename}"
    file_path = os.path.join(upload_folder, unique_name)
    file.save(file_path)
    
    file_size_kb = round(os.path.getsize(file_path) / 1024, 2)
    
    doc = Document(
        application_id=int(application_id) if application_id else None,
        user_id=user_id,
        doc_type=doc_type,
        file_name=filename,
        file_path=unique_name,
        file_size_kb=file_size_kb,
        status='Uploaded'
    )
    db.session.add(doc)
    db.session.commit()
    
    return jsonify({
        'message': 'Document uploaded successfully and queued for verification',
        'document': doc.to_dict()
    }), 201

@documents_bp.route('/my', methods=['GET'])
def get_documents():
    app_id = request.args.get('application_id')
    query = Document.query
    if app_id:
        query = query.filter_by(application_id=int(app_id))
    docs = query.order_by(Document.uploaded_at.desc()).all()
    return jsonify({'documents': [d.to_dict() for d in docs]}), 200
