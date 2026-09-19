# SmartLoan AI: AI-Powered Loan Advisory & Transparent Multi-Bank Comparison Platform

> **Academic Capstone / Major Project (2025 – 2026)**  
> Built strictly according to the specifications in `SmartLoanAI_Synopsis_Final.docx`.

---

## 🌟 Executive Overview

In the contemporary Indian financial ecosystem, retail borrowers face opaque loan comparison, hidden ancillary fees (processing fees + 18% GST, insurance riders, document charges), redundant application forms, and lack of pre-application approval transparency. Applying blindly to multiple lenders triggers multiple hard inquiries that degrade CIBIL credit scores.

**SmartLoan AI** is a full-stack, 3-tier intelligent financial web application designed to solve these systemic problems:
1. **Supervised ML Approval Engine**: Predicts continuous loan approval confidence scores (0–100%) prior to official bank submission with **zero hard credit inquiries**.
2. **True Cost & APR Transparency**: Exposes all upfront charges, computes the Effective Annual Percentage Rate (APR), and renders interactive amortization curves.
3. **Dynamic KYC Document Assistant**: Tailored document checklist for salaried vs. self-employed applicants across Home, Personal, Education, and Vehicle loans.
4. **Regional Vernacular Inclusivity**: Real-time client-side switching across **5 languages**: English, Hindi (हिन्दी), Marathi (मराठी), Gujarati (ગુજરાતી), and Tamil (தமிழ்).
5. **ReportLab Automated Sanction Summary**: Generates downloadable PDF Loan Advisory & In-Principle Sanction Summary reports.
6. **Zero Spam Guarantee**: Privacy-first design with Bcrypt encryption and zero commercial lead monetization.

---

## 🏗️ Architecture & Technology Stack

```
SmartLoan AI
├── Client Tier (Frontend)
│   ├── React.js (v19) + Vite
│   ├── Tailwind CSS (Glassmorphic dark fintech theme)
│   ├── Recharts (Interactive Donut & Amortization Area Charts)
│   ├── React-i18next (5-language localization)
│   └── Lucide React (Fintech iconography)
│
├── Application Tier (Backend REST API)
│   ├── Python Flask (v3.0.3)
│   ├── Flask-SQLAlchemy (ORM) & SQLite (`smartloan.db`)
│   ├── Flask-JWT-Extended & Bcrypt (Auth & Route Guards)
│   ├── ReportLab (Automated PDF Report Generator)
│   └── Flask-CORS (Cross-Origin Resource Sharing)
│
└── AI / Machine Learning Engine
    ├── Scikit-learn (Random Forest Classifier, 150 Decision Trees)
    ├── Pandas & NumPy (Data processing & feature engineering)
    ├── Joblib (Serialized model pipeline: `loan_model.pkl`)
    └── Dual-engine Underwriting (ML Probability + Bank Policy Heuristics)
```

---

## 📊 Machine Learning Model Benchmarks

Trained on 12,000 retail loan records with 5-Fold Stratified Cross-Validation:
- **Test Accuracy**: **94.79%** (Synopsis Target: >85%)
- **ROC-AUC Score**: **0.9911** (Synopsis Target: >0.88)
- **Precision**: **89.71%**
- **Recall**: **95.57%**
- **F1-Score**: **0.9255**
- **Top Predictive Features**: Credit Score (28.4%), FOIR Ratio (24.1%), Monthly Income (16.5%), DTI Ratio (11.2%), Past Defaults (8.7%).

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.10+** (Tested on Python 3.13)
- **Node.js 18+** & npm

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run ML training (already trained and serialized into app/ml/)
python -m app.ml.train_model

# Run tests
python test_backend.py

# Start Flask Server (port 5000)
python run.py
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite Development Server (port 5173)
npm run dev
```

Open your browser at **`http://localhost:5173/`**.

---

## 🔑 Pre-Seeded Demo Accounts

For fast evaluation and project demonstration, use one-click buttons on the Sign In page:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Borrower** | `borrower@smartloan.ai` | `Borrower@123` | Multi-step wizard, saved applications, document upload, PDF download |
| **Admin** | `admin@smartloan.ai` | `Admin@123` | Analytics dashboard, ML evaluation telemetry, bank rates editor, application review |

---

## 📱 Key Application Modules

1. **Landing & Instant EMI Simulator** (`/`): Quick slider-based loan calculator with real-time interest vs principal preview and gap analysis matrix.
2. **4-Stage Loan Application Wizard** (`/wizard`): Progress-tracked intake form with local autosave and regex validation for PAN, masked Aadhaar, and IFSC.
3. **AI Approval & Bank Comparison Results** (`/results`): Visual 0–100% confidence gauge, explainable underwriting factors, and side-by-side bank cards (Headline rate vs. Effective APR).
4. **True Cost & Hidden Fee Calculator** (`/calculator`): Sliders for principal, tenure, rate, processing fee %, insurance %, and doc charges with Recharts visual charts.
5. **Smart KYC Document Assistant** (`/documents`): Role-based dynamic checklist with drag-and-drop file upload.
6. **AI Financial Coach Widget**: Floating conversational assistant providing advice on reducing rates, prepayments, and CIBIL score improvements.
7. **Admin & Lender Portal** (`/admin`): Live platform KPIs, model evaluation metrics, and bank product CRUD.
