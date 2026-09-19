from datetime import datetime
from app.database import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    full_name = db.Column(db.String(120), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='borrower')  # 'borrower' or 'admin'
    phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    applications = db.relationship('LoanApplication', backref='user', lazy=True, cascade="all, delete-orphan")
    documents = db.relationship('Document', backref='user', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'phone': self.phone,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class LoanApplication(db.Model):
    __tablename__ = 'loan_applications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    applicant_name = db.Column(db.String(120), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    marital_status = db.Column(db.String(20), nullable=False)
    dependents = db.Column(db.Integer, default=0)
    education = db.Column(db.String(50), nullable=False)
    employment_type = db.Column(db.String(50), nullable=False) # Salaried, Self-Employed, Business
    
    monthly_income = db.Column(db.Float, nullable=False)
    coapplicant_income = db.Column(db.Float, default=0.0)
    existing_emi = db.Column(db.Float, default=0.0)
    credit_score = db.Column(db.Integer, nullable=False)
    past_defaults = db.Column(db.Integer, default=0)
    
    loan_category = db.Column(db.String(50), nullable=False) # Home, Personal, Education, Vehicle
    loan_amount = db.Column(db.Float, nullable=False)
    loan_tenure_months = db.Column(db.Integer, nullable=False)
    loan_purpose = db.Column(db.String(200), nullable=True)
    
    # Financial Ratios
    dti_ratio = db.Column(db.Float, nullable=True)
    lti_ratio = db.Column(db.Float, nullable=True)
    foir_ratio = db.Column(db.Float, nullable=True)
    
    # ML Prediction outputs
    approval_probability = db.Column(db.Float, nullable=False) # 0.0 to 100.0%
    approval_band = db.Column(db.String(20), nullable=False) # High, Moderate, Low
    recommended_bank = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(50), default='Pre-Approved')
    key_factors_json = db.Column(db.Text, nullable=True) # JSON of explainability factors
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    documents = db.relationship('Document', backref='application', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'user_id': self.user_id,
            'applicant_name': self.applicant_name,
            'age': self.age,
            'marital_status': self.marital_status,
            'dependents': self.dependents,
            'education': self.education,
            'employment_type': self.employment_type,
            'monthly_income': self.monthly_income,
            'coapplicant_income': self.coapplicant_income,
            'existing_emi': self.existing_emi,
            'credit_score': self.credit_score,
            'past_defaults': self.past_defaults,
            'loan_category': self.loan_category,
            'loan_amount': self.loan_amount,
            'loan_tenure_months': self.loan_tenure_months,
            'loan_purpose': self.loan_purpose,
            'dti_ratio': self.dti_ratio,
            'lti_ratio': self.lti_ratio,
            'foir_ratio': self.foir_ratio,
            'approval_probability': self.approval_probability,
            'approval_band': self.approval_band,
            'recommended_bank': self.recommended_bank,
            'status': self.status,
            'key_factors': json.loads(self.key_factors_json) if self.key_factors_json else [],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class BankProduct(db.Model):
    __tablename__ = 'bank_products'
    
    id = db.Column(db.Integer, primary_key=True)
    bank_name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), nullable=False)
    logo_url = db.Column(db.String(255), nullable=True)
    loan_category = db.Column(db.String(50), nullable=False) # Home, Personal, Education, Vehicle
    min_interest_rate = db.Column(db.Float, nullable=False)
    max_interest_rate = db.Column(db.Float, nullable=False)
    processing_fee_pct = db.Column(db.Float, nullable=False) # e.g. 1.0%
    min_processing_fee = db.Column(db.Float, default=1000.0)
    max_processing_fee = db.Column(db.Float, default=15000.0)
    min_cibil = db.Column(db.Integer, default=650)
    max_tenure_years = db.Column(db.Integer, default=30)
    min_income = db.Column(db.Float, default=25000.0)
    insurance_rate_pct = db.Column(db.Float, default=0.5) # % of loan amount
    doc_charges = db.Column(db.Float, default=1500.0)
    prepayment_penalty = db.Column(db.String(100), default='Nil on floating rate')
    rating = db.Column(db.Float, default=4.5)
    special_features = db.Column(db.Text, nullable=True) # JSON list or string

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'bank_name': self.bank_name,
            'code': self.code,
            'logo_url': self.logo_url,
            'loan_category': self.loan_category,
            'min_interest_rate': self.min_interest_rate,
            'max_interest_rate': self.max_interest_rate,
            'processing_fee_pct': self.processing_fee_pct,
            'min_processing_fee': self.min_processing_fee,
            'max_processing_fee': self.max_processing_fee,
            'min_cibil': self.min_cibil,
            'max_tenure_years': self.max_tenure_years,
            'min_income': self.min_income,
            'insurance_rate_pct': self.insurance_rate_pct,
            'doc_charges': self.doc_charges,
            'prepayment_penalty': self.prepayment_penalty,
            'rating': self.rating,
            'special_features': json.loads(self.special_features) if self.special_features and self.special_features.startswith('[') else self.special_features
        }

class Document(db.Model):
    __tablename__ = 'documents'
    
    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey('loan_applications.id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    doc_type = db.Column(db.String(100), nullable=False) # e.g. "Salary Slip", "Form 16", "ITR", "Bank Statement", "Aadhaar Card", "PAN Card"
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size_kb = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(50), default='Uploaded') # Uploaded, Verified, Rejected
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'application_id': self.application_id,
            'user_id': self.user_id,
            'doc_type': self.doc_type,
            'file_name': self.file_name,
            'file_size_kb': self.file_size_kb,
            'status': self.status,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }

class SystemMetric(db.Model):
    __tablename__ = 'system_metrics'
    
    id = db.Column(db.Integer, primary_key=True)
    metric_key = db.Column(db.String(100), unique=True, nullable=False)
    metric_value = db.Column(db.Text, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'metric_key': self.metric_key,
            'metric_value': self.metric_value,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
