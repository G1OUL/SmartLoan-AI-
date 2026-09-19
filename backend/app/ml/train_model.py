import os
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

def generate_synthetic_loan_dataset(n_samples=12000, random_state=42):
    """
    Generates realistic synthetic retail loan data (12,000 records)
    modeled after Indian retail banking underwriting guidelines.
    """
    np.random.seed(random_state)
    
    age = np.random.randint(21, 62, size=n_samples)
    marital_status = np.random.choice(['Single', 'Married'], size=n_samples, p=[0.35, 0.65])
    dependents = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.35, 0.30, 0.25, 0.10])
    education = np.random.choice(['Graduate', 'Post-Graduate', 'Undergraduate'], size=n_samples, p=[0.55, 0.30, 0.15])
    employment_type = np.random.choice(['Salaried', 'Self-Employed', 'Business'], size=n_samples, p=[0.65, 0.22, 0.13])
    
    # Monthly income in INR (log-normal distribution)
    base_income = np.random.lognormal(mean=10.6, sigma=0.6, size=n_samples) # Mean ~45,000 - 80,000
    monthly_income = np.clip(base_income, 18000, 500000).round(-2)
    
    # Coapplicant income (40% have coapplicant)
    has_coapplicant = np.random.choice([0, 1], size=n_samples, p=[0.60, 0.40])
    coapplicant_income = np.where(
        has_coapplicant == 1,
        np.random.lognormal(mean=10.2, sigma=0.5, size=n_samples).round(-2),
        0.0
    )
    
    # Existing EMI obligations
    total_income = monthly_income + coapplicant_income
    existing_emi = (np.random.beta(2, 5, size=n_samples) * total_income * 0.4).round(-2)
    
    # Loan category & amounts
    loan_category = np.random.choice(['Personal', 'Home', 'Education', 'Vehicle'], size=n_samples, p=[0.35, 0.35, 0.15, 0.15])
    
    loan_amount = np.zeros(n_samples)
    loan_tenure_months = np.zeros(n_samples, dtype=int)
    
    for i in range(n_samples):
        cat = loan_category[i]
        if cat == 'Personal':
            loan_amount[i] = np.random.uniform(50000, 1500000)
            loan_tenure_months[i] = int(np.random.choice([12, 24, 36, 48, 60]))
        elif cat == 'Home':
            loan_amount[i] = np.random.uniform(1500000, 12000000)
            loan_tenure_months[i] = int(np.random.choice([120, 180, 240, 300, 360]))
        elif cat == 'Education':
            loan_amount[i] = np.random.uniform(200000, 3500000)
            loan_tenure_months[i] = int(np.random.choice([36, 60, 84, 120]))
        else: # Vehicle
            loan_amount[i] = np.random.uniform(200000, 2500000)
            loan_tenure_months[i] = int(np.random.choice([24, 36, 48, 60, 84]))
            
    loan_amount = loan_amount.round(-3)
    
    # Credit bureau CIBIL Score (300 to 900)
    # Mixture of prime (750+), near-prime (680-749), subprime (<680)
    cibil_comp = np.random.choice([0, 1, 2], size=n_samples, p=[0.55, 0.30, 0.15])
    cibil_score = np.where(
        cibil_comp == 0,
        np.random.normal(780, 45, n_samples),
        np.where(cibil_comp == 1, np.random.normal(680, 50, n_samples), np.random.normal(570, 70, n_samples))
    ).clip(300, 900).round().astype(int)
    
    # Past defaults & inquiries
    past_defaults = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.78, 0.14, 0.06, 0.02])
    credit_inquiries = np.random.choice([0, 1, 2, 3, 4, 5], size=n_samples, p=[0.40, 0.25, 0.18, 0.10, 0.05, 0.02])
    
    # Financial Ratios
    # Estimated monthly interest rate ~10% annual
    r = (0.10 / 12)
    est_new_emi = (loan_amount * r * ((1 + r) ** loan_tenure_months)) / (((1 + r) ** loan_tenure_months) - 1)
    
    total_obligations = existing_emi + est_new_emi
    foir = (total_obligations / total_income).clip(0.05, 2.0)
    dti = (existing_emi / total_income).clip(0.0, 1.0)
    lti = (loan_amount / (total_income * 12)).clip(0.1, 15.0)
    
    # Deterministic underwriting scoring function + stochastic market factor
    # Target approval calculation
    z = (
        0.015 * (cibil_score - 650)
        - 4.5 * (foir - 0.45)
        - 2.8 * (dti - 0.25)
        - 1.5 * past_defaults
        - 0.3 * credit_inquiries
        + 0.000008 * (monthly_income - 50000)
        + 0.5 * (education == 'Post-Graduate').astype(int)
        + 0.3 * (employment_type == 'Salaried').astype(int)
        - 0.4 * (dependents >= 3).astype(int)
        + np.random.normal(0, 0.35, size=n_samples) # stochastic variance
    )
    
    # Soft constraints: instant reject conditions
    hard_reject = (cibil_score < 560) | (past_defaults >= 3) | (foir > 0.85)
    hard_approve = (cibil_score >= 800) & (foir < 0.35) & (past_defaults == 0)
    
    prob = 1 / (1 + np.exp(-z))
    prob[hard_reject] = np.clip(prob[hard_reject] * 0.15, 0.01, 0.20)
    prob[hard_approve] = np.clip(prob[hard_approve] * 1.25 + 0.1, 0.88, 0.99)
    
    loan_approved = (prob >= 0.50).astype(int)
    
    df = pd.DataFrame({
        'age': age,
        'marital_status': marital_status,
        'dependents': dependents,
        'education': education,
        'employment_type': employment_type,
        'monthly_income': monthly_income,
        'coapplicant_income': coapplicant_income,
        'existing_emi': existing_emi,
        'loan_category': loan_category,
        'loan_amount': loan_amount,
        'loan_tenure_months': loan_tenure_months,
        'credit_score': cibil_score,
        'past_defaults': past_defaults,
        'credit_inquiries': credit_inquiries,
        'dti_ratio': np.round(dti, 4),
        'lti_ratio': np.round(lti, 4),
        'foir_ratio': np.round(foir, 4),
        'loan_approved': loan_approved
    })
    
    return df

def train_and_evaluate_model():
    print("Generating synthetic retail loan dataset (12,000 records)...")
    df = generate_synthetic_loan_dataset(n_samples=12000, random_state=42)
    print(f"Dataset generated. Shape: {df.shape}. Approval distribution:\n{df['loan_approved'].value_counts(normalize=True)}")
    
    feature_cols = [
        'age', 'marital_status', 'dependents', 'education', 'employment_type',
        'monthly_income', 'coapplicant_income', 'existing_emi', 'loan_category',
        'loan_amount', 'loan_tenure_months', 'credit_score', 'past_defaults',
        'credit_inquiries', 'dti_ratio', 'lti_ratio', 'foir_ratio'
    ]
    target_col = 'loan_approved'
    
    X = df[feature_cols]
    y = df[target_col]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    numeric_features = [
        'age', 'dependents', 'monthly_income', 'coapplicant_income',
        'existing_emi', 'loan_amount', 'loan_tenure_months', 'credit_score',
        'past_defaults', 'credit_inquiries', 'dti_ratio', 'lti_ratio', 'foir_ratio'
    ]
    categorical_features = ['marital_status', 'education', 'employment_type', 'loan_category']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ]
    )
    
    # Benchmark Models
    lr_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', LogisticRegression(max_iter=1000, random_state=42))
    ])
    
    rf_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(
            n_estimators=150,
            max_depth=14,
            min_samples_split=6,
            min_samples_leaf=2,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        ))
    ])
    
    print("\n--- 5-Fold Stratified Cross-Validation on Random Forest ---")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_results = cross_validate(
        rf_pipeline, X_train, y_train, cv=cv,
        scoring=['accuracy', 'precision', 'recall', 'f1', 'roc_auc']
    )
    print(f"CV Accuracy: {cv_results['test_accuracy'].mean():.4f} (+/- {cv_results['test_accuracy'].std():.4f})")
    print(f"CV ROC-AUC:  {cv_results['test_roc_auc'].mean():.4f} (+/- {cv_results['test_roc_auc'].std():.4f})")
    print(f"CV F1-Score: {cv_results['test_f1'].mean():.4f} (+/- {cv_results['test_f1'].std():.4f})")
    
    # Train Best Model on full training set
    print("\nFitting final Random Forest pipeline...")
    rf_pipeline.fit(X_train, y_train)
    
    # Test set evaluation
    y_pred = rf_pipeline.predict(X_test)
    y_proba = rf_pipeline.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    print(f"\nFinal Test Evaluation Metrics:")
    print(f"Accuracy:  {acc * 100:.2f}% (Target: >85%)")
    print(f"ROC-AUC:   {auc:.4f} (Target: >0.88)")
    print(f"Precision: {prec * 100:.2f}%")
    print(f"Recall:    {rec * 100:.2f}%")
    print(f"F1-Score:  {f1:.4f}")
    print(f"Confusion Matrix: {cm}")
    
    # Extract Feature Importances
    classifier = rf_pipeline.named_steps['classifier']
    encoder = rf_pipeline.named_steps['preprocessor'].named_transformers_['cat']
    cat_feature_names = encoder.get_feature_names_out(categorical_features).tolist()
    all_feature_names = numeric_features + cat_feature_names
    importances = classifier.feature_importances_.tolist()
    
    feature_importance_dict = sorted(
        [{"feature": f, "importance": round(imp * 100, 2)} for f, imp in zip(all_feature_names, importances)],
        key=lambda x: x['importance'],
        reverse=True
    )
    
    # Save Pipeline and Metadata
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, 'loan_model.pkl')
    metadata_path = os.path.join(current_dir, 'model_metadata.json')
    
    joblib.dump(rf_pipeline, model_path)
    print(f"\nModel saved successfully to: {model_path}")
    
    metadata = {
        "model_name": "Random Forest Ensemble (150 Trees)",
        "accuracy": round(acc * 100, 2),
        "roc_auc": round(auc, 4),
        "precision": round(prec * 100, 2),
        "recall": round(rec * 100, 2),
        "f1_score": round(f1, 4),
        "confusion_matrix": cm,
        "n_samples": len(df),
        "feature_importances": feature_importance_dict[:10],
        "all_features": all_feature_names,
        "categorical_features": categorical_features,
        "numeric_features": numeric_features
    }
    
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=4)
    print(f"Metadata saved to: {metadata_path}")
    
    return metadata

if __name__ == '__main__':
    train_and_evaluate_model()
