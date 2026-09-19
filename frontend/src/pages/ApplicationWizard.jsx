import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  User, Briefcase, CreditCard, Landmark, ArrowRight, ArrowLeft, 
  Sparkles, CheckCircle2, AlertCircle, ShieldAlert, FileText 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const INITIAL_STATE = {
  // Step 1: Personal
  applicant_name: '',
  age: 32,
  marital_status: 'Married',
  dependents: 1,
  education: 'Graduate',
  
  // Step 2: Income & Employment
  employment_type: 'Salaried',
  monthly_income: 75000,
  coapplicant_income: 30000,
  existing_emi: 12000,
  
  // Step 3: Credit Health
  credit_score: 750,
  past_defaults: 0,
  credit_inquiries: 1,
  pan_number: 'ABCDE1234F',
  aadhaar_masked: 'XXXX-XXXX-8921',
  
  // Step 4: Loan Details
  loan_category: 'Home',
  loan_amount: 3500000,
  loan_tenure_months: 240,
  loan_purpose: 'Purchase of residential flat'
};

export default function ApplicationWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('smartloan_wizard_draft');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !formData.applicant_name) {
      setFormData((prev) => ({ ...prev, applicant_name: user.full_name }));
    }
  }, [user]);

  // Autosave to localStorage
  useEffect(() => {
    localStorage.setItem('smartloan_wizard_draft', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = (currentStep) => {
    const errs = {};
    if (currentStep === 1) {
      if (!formData.applicant_name?.trim()) errs.applicant_name = "Legal name is required";
      if (!formData.age || formData.age < 21 || formData.age > 70) errs.age = "Age must be between 21 and 70";
    } else if (currentStep === 2) {
      if (!formData.monthly_income || formData.monthly_income < 10000) {
        errs.monthly_income = "Monthly income must be at least ₹10,000";
      }
    } else if (currentStep === 3) {
      // Regex check for PAN card
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
      if (formData.pan_number && !panRegex.test(formData.pan_number.toUpperCase())) {
        errs.pan_number = "Invalid PAN format (e.g. ABCDE1234F)";
      }
    } else if (currentStep === 4) {
      if (!formData.loan_amount || formData.loan_amount < 50000) {
        errs.loan_amount = "Minimum loan amount is ₹50,000";
      }
      if (!formData.loan_tenure_months || formData.loan_tenure_months < 6) {
        errs.loan_tenure_months = "Minimum tenure is 6 months";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setLoading(true);
    try {
      const res = await api.submitApplication(formData);
      localStorage.removeItem('smartloan_wizard_draft');
      // Navigate to results page with scored data
      navigate('/results', { state: { application: res.data.application } });
    } catch (err) {
      console.error("Submission failed", err);
      // Fallback: run predict API directly
      try {
        const predRes = await api.predictApproval(formData);
        const dummyApp = {
          ...formData,
          ...predRes.data,
          id: 999,
          status: 'Pre-Approved'
        };
        navigate('/results', { state: { application: dummyApp } });
      } catch (err2) {
        alert("Failed to score application. Please verify backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const stepsMeta = [
    { num: 1, label: t('wizard.step1'), icon: User },
    { num: 2, label: t('wizard.step2'), icon: Briefcase },
    { num: 3, label: t('wizard.step3'), icon: CreditCard },
    { num: 4, label: t('wizard.step4'), icon: Landmark },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      
      {/* Title Header */}
      <div className="text-center space-y-2 mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Dual-Engine Underwriting</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{t('wizard.title')}</h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">{t('wizard.subtitle')}</p>
      </div>

      {/* Step Indicator Bar */}
      <div className="mb-8">
        <div className="grid grid-cols-4 gap-2">
          {stepsMeta.map((s) => {
            const Icon = s.icon;
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div
                key={s.num}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3 transition-all ${
                  isCurrent
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : isDone
                    ? 'bg-slate-900/80 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 hidden sm:block">Step {s.num}</p>
                  <p className="text-xs font-bold truncate">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Container */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-800 relative">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* STEP 1: Personal Profile */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-base font-bold text-white flex items-center space-x-2 pb-3 border-b border-slate-800">
                <User className="w-4 h-4 text-blue-400" />
                <span>1. Personal & Demographic Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">{t('wizard.full_name')} *</label>
                  <input
                    type="text"
                    value={formData.applicant_name}
                    onChange={(e) => handleChange('applicant_name', e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none ${errors.applicant_name ? 'border-red-500' : ''}`}
                  />
                  {errors.applicant_name && <p className="text-[10px] text-red-400">{errors.applicant_name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">{t('wizard.age')} (21 - 70) *</label>
                  <input
                    type="number"
                    min="21"
                    max="70"
                    value={formData.age}
                    onChange={(e) => handleChange('age', Number(e.target.value))}
                    className={`w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none ${errors.age ? 'border-red-500' : ''}`}
                  />
                  {errors.age && <p className="text-[10px] text-red-400">{errors.age}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">{t('wizard.marital_status')}</label>
                  <select
                    value={formData.marital_status}
                    onChange={(e) => handleChange('marital_status', e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none bg-slate-900"
                  >
                    <option value="Married">{t('wizard.married')}</option>
                    <option value="Single">{t('wizard.single')}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">{t('wizard.dependents')}</label>
                  <select
                    value={formData.dependents}
                    onChange={(e) => handleChange('dependents', Number(e.target.value))}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none bg-slate-900"
                  >
                    <option value={0}>0 Dependents</option>
                    <option value={1}>1 Dependent</option>
                    <option value={2}>2 Dependents</option>
                    <option value={3}>3+ Dependents</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">{t('wizard.education')}</label>
                  <select
                    value={formData.education}
                    onChange={(e) => handleChange('education', e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none bg-slate-900"
                  >
                    <option value="Graduate">{t('wizard.graduate')}</option>
                    <option value="Post-Graduate">{t('wizard.post_graduate')}</option>
                    <option value="Undergraduate">{t('wizard.undergraduate')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Income & Employment */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-base font-bold text-white flex items-center space-x-2 pb-3 border-b border-slate-800">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>2. Income & Employment Profile</span>
              </h2>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">{t('wizard.emp_type')}</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: 'Salaried', label: t('wizard.salaried') },
                      { val: 'Self-Employed', label: t('wizard.self_employed') },
                      { val: 'Business', label: t('wizard.business') }
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.val}
                        onClick={() => handleChange('employment_type', item.val)}
                        className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                          formData.employment_type === item.val
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">{t('wizard.monthly_income')} *</label>
                    <input
                      type="number"
                      step="1000"
                      value={formData.monthly_income}
                      onChange={(e) => handleChange('monthly_income', Number(e.target.value))}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400">Net in-hand take-home salary after deductions</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">{t('wizard.coapplicant_income')}</label>
                    <input
                      type="number"
                      step="1000"
                      value={formData.coapplicant_income}
                      onChange={(e) => handleChange('coapplicant_income', Number(e.target.value))}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400">Spouse or parent income boosts loan capacity</p>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">{t('wizard.existing_emi')}</label>
                    <input
                      type="number"
                      step="500"
                      value={formData.existing_emi}
                      onChange={(e) => handleChange('existing_emi', Number(e.target.value))}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400">Total existing vehicle, personal, or credit card EMIs</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Credit Health */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-base font-bold text-white flex items-center space-x-2 pb-3 border-b border-slate-800">
                <CreditCard className="w-4 h-4 text-purple-400" />
                <span>3. Credit Bureau Health & KYC</span>
              </h2>

              <div className="space-y-5">
                {/* CIBIL Score Slider */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">{t('wizard.cibil_score')}</span>
                    <span className={`text-base font-extrabold px-2.5 py-0.5 rounded-lg ${
                      formData.credit_score >= 750
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : formData.credit_score >= 680
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {formData.credit_score} / 900
                    </span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="900"
                    step="5"
                    value={formData.credit_score}
                    onChange={(e) => handleChange('credit_score', Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Poor (&lt;650)</span>
                    <span>Average (650–749)</span>
                    <span className="text-emerald-400 font-semibold">Prime (750+)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">{t('wizard.defaults')}</label>
                    <select
                      value={formData.past_defaults}
                      onChange={(e) => handleChange('past_defaults', Number(e.target.value))}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none bg-slate-900"
                    >
                      <option value={0}>0 Defaults (Clean Record)</option>
                      <option value={1}>1 Default (Minor)</option>
                      <option value={2}>2 Defaults</option>
                      <option value={3}>3+ Defaults</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">{t('wizard.inquiries')}</label>
                    <select
                      value={formData.credit_inquiries}
                      onChange={(e) => handleChange('credit_inquiries', Number(e.target.value))}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none bg-slate-900"
                    >
                      <option value={0}>0 Inquiries</option>
                      <option value={1}>1 Inquiry</option>
                      <option value={2}>2 Inquiries</option>
                      <option value={3}>3–4 Inquiries</option>
                      <option value={5}>5+ Inquiries</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">{t('wizard.pan_number')}</label>
                    <input
                      type="text"
                      maxLength="10"
                      value={formData.pan_number}
                      onChange={(e) => handleChange('pan_number', e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className={`w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white uppercase focus:outline-none ${errors.pan_number ? 'border-red-500' : ''}`}
                    />
                    {errors.pan_number && <p className="text-[10px] text-red-400">{errors.pan_number}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">{t('wizard.aadhaar_number')}</label>
                    <input
                      type="text"
                      value={formData.aadhaar_masked}
                      onChange={(e) => handleChange('aadhaar_masked', e.target.value)}
                      placeholder="XXXX-XXXX-8921"
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400">Masked for privacy compliance</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Loan Requirements */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-base font-bold text-white flex items-center space-x-2 pb-3 border-b border-slate-800">
                <Landmark className="w-4 h-4 text-blue-400" />
                <span>4. Loan Parameters & Purpose</span>
              </h2>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">{t('wizard.loan_cat')}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { val: 'Home', label: t('wizard.home_loan') },
                      { val: 'Personal', label: t('wizard.personal_loan') },
                      { val: 'Education', label: t('wizard.education_loan') },
                      { val: 'Vehicle', label: t('wizard.vehicle_loan') }
                    ].map((c) => (
                      <button
                        type="button"
                        key={c.val}
                        onClick={() => handleChange('loan_category', c.val)}
                        className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                          formData.loan_category === c.val
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">{t('wizard.loan_amount')} *</label>
                    <input
                      type="number"
                      step="50000"
                      value={formData.loan_amount}
                      onChange={(e) => handleChange('loan_amount', Number(e.target.value))}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400">₹{formData.loan_amount.toLocaleString('en-IN')}</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">{t('wizard.tenure_months')} *</label>
                    <input
                      type="number"
                      step="12"
                      value={formData.loan_tenure_months}
                      onChange={(e) => handleChange('loan_tenure_months', Number(e.target.value))}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400">{Math.round(formData.loan_tenure_months / 12 * 10) / 10} Years</p>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">{t('wizard.loan_purpose')}</label>
                    <input
                      type="text"
                      value={formData.loan_purpose}
                      onChange={(e) => handleChange('loan_purpose', e.target.value)}
                      placeholder="e.g. 2BHK flat purchase in Pune, higher education fees, etc."
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Soft pull privacy statement */}
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-emerald-300 leading-relaxed">
                    <b>Zero Hard Credit Inquiries:</b> SmartLoan AI executes predictive machine learning inference locally. Your official CIBIL score is completely protected from hard inquiries.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Action Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition-all flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('wizard.back')}</span>
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center space-x-1.5"
              >
                <span>{t('wizard.next')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-emerald-600/30 flex items-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>{t('wizard.saving')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t('wizard.submit')}</span>
                  </>
                )}
              </button>
            )}
          </div>

        </form>
      </div>

    </div>
  );
}
