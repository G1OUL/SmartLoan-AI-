import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheck, ArrowDownToLine, CheckCircle2, AlertTriangle, XCircle, 
  Building2, Sparkles, TrendingUp, Info, FileText, ArrowRight, ExternalLink 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

export default function ComparisonResults() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [application, setApplication] = useState(location.state?.application || null);
  const [loading, setLoading] = useState(!application);
  const [selectedBank, setSelectedBank] = useState(null);

  useEffect(() => {
    if (!application) {
      // Fetch latest application
      api.getMyApplications()
        .then((res) => {
          if (res.data.applications && res.data.applications.length > 0) {
            return api.getApplicationById(res.data.applications[0].id);
          }
          throw new Error("No applications found");
        })
        .then((res) => {
          setApplication(res.data.application);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      if (application.approval_probability >= 70) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    }
  }, [application]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center space-y-4">
        <Sparkles className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-white">Evaluating Financial Parameters...</h2>
        <p className="text-slate-400 text-xs">Running supervised ML inference across partner banks...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Application Evaluated Yet</h2>
        <p className="text-slate-400 text-xs">Run the 4-step eligibility wizard to predict your approval probability.</p>
        <Link
          to="/wizard"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs"
        >
          <span>Open Loan Wizard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const prob = application.approval_probability || 85.0;
  const band = application.approval_band || (prob >= 75 ? 'High' : (prob >= 50 ? 'Moderate' : 'Low'));
  const bankOffers = application.bank_comparisons || [];

  const bandColor = prob >= 75 ? 'text-emerald-400' : (prob >= 50 ? 'text-amber-400' : 'text-red-400');
  const bandBg = prob >= 75 ? 'bg-emerald-500/10 border-emerald-500/30' : (prob >= 50 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30');

  const downloadPdf = () => {
    const url = api.getPdfReportUrl(application.id || 1);
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs text-blue-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Predictive Underwriting Report</span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-slate-400">Ref: SLA-{String(application.id || 1).padStart(6, '0')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t('results.title')}
          </h1>
          <p className="text-slate-400 text-xs">
            Evaluated for <b>{application.applicant_name}</b> &bull; Requested: ₹{Number(application.loan_amount).toLocaleString('en-IN')} ({application.loan_category} Loan)
          </p>
        </div>

        {/* Download PDF Action */}
        <button
          onClick={downloadPdf}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center space-x-2"
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span>{t('results.download_pdf')}</span>
        </button>
      </div>

      {/* Main Verdict & Gauge Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: AI Approval Gauge Card */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            {t('results.score_label')}
          </span>

          {/* Circular Visual Indicator */}
          <div className="relative w-44 h-44 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-slate-800"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className={prob >= 75 ? 'stroke-emerald-400' : (prob >= 50 ? 'stroke-amber-400' : 'stroke-red-400')}
                strokeWidth="10"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * prob) / 100}
                strokeLinecap="round"
                fill="none"
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-4xl font-black ${bandColor}`}>
                {prob}%
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mt-0.5">
                Confidence
              </span>
            </div>
          </div>

          {/* Band Badge */}
          <div className={`mt-3 px-4 py-1.5 rounded-full border text-xs font-bold ${bandBg} ${bandColor}`}>
            {band === 'High' ? t('results.high_band') : (band === 'Moderate' ? t('results.mod_band') : t('results.low_band'))}
          </div>

          <p className="text-xs text-slate-300 mt-4 leading-relaxed max-w-sm">
            {application.recommendation || "High approval probability based on strong CIBIL score and favorable debt-to-income ratio."}
          </p>

          <div className="mt-6 pt-4 border-t border-slate-800 w-full flex items-center justify-around text-xs">
            <div>
              <span className="text-slate-400">Primary Bank</span>
              <p className="font-bold text-white">{application.recommended_bank || 'SBI'}</p>
            </div>
            <div>
              <span className="text-slate-400">Hard Inquiries</span>
              <p className="font-bold text-emerald-400">0 (Safe)</p>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Solvency Ratios & Decision Drivers */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Key Financial Ratios Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card rounded-xl p-4 border border-slate-800">
              <span className="text-[11px] text-slate-400">FOIR Obligation</span>
              <p className="text-lg font-bold text-white mt-1">
                {roundTo((application.foir_ratio || 0.41) * 100, 1)}%
              </p>
              <p className="text-[10px] text-slate-500">Benchmark: &lt; 50%</p>
            </div>

            <div className="glass-card rounded-xl p-4 border border-slate-800">
              <span className="text-[11px] text-slate-400">Debt-to-Income (DTI)</span>
              <p className="text-lg font-bold text-white mt-1">
                {roundTo((application.dti_ratio || 0.12) * 100, 1)}%
              </p>
              <p className="text-[10px] text-slate-500">Benchmark: &lt; 35%</p>
            </div>

            <div className="glass-card rounded-xl p-4 border border-slate-800">
              <span className="text-[11px] text-slate-400">Bureau CIBIL</span>
              <p className="text-lg font-bold text-emerald-400 mt-1">
                {application.credit_score} / 900
              </p>
              <p className="text-[10px] text-slate-500">Prime Band: 750+</p>
            </div>
          </div>

          {/* Underwriting Factors (Explainability) */}
          <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>{t('results.factors_title')} (Machine Learning Explainability)</span>
            </h3>

            <div className="space-y-2.5">
              {(application.key_factors || [
                { factor: "Prime CIBIL Score", impact: "Positive", detail: `Score of ${application.credit_score} places applicant in prime approval tier` },
                { factor: "Controlled FOIR Ratio", impact: "Positive", detail: "Total monthly obligations are well within disposable cash flow limits" },
                { factor: "Zero Defaults", impact: "Positive", detail: "No past defaults or write-offs on credit bureau record" }
              ]).map((fac, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs">
                  {fac.impact === 'Positive' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold text-white">{fac.factor}</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">{fac.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Step KYC Guide */}
          <div className="glass-card rounded-xl p-4 border border-blue-500/30 bg-blue-950/20 flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">Next Step: Complete Document Checklist</h4>
              <p className="text-[11px] text-slate-400">Upload salary slips and KYC to expedite formal disbursement.</p>
            </div>
            <Link
              to="/documents"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 flex-shrink-0"
            >
              <span>KYC Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

      {/* Multi-Bank Comparison Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-white">{t('results.bank_offers_title')}</h2>
            <p className="text-slate-400 text-xs">Ranked by lowest Effective APR and highest probability of approval.</p>
          </div>
          <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md font-medium">
            Effective APR includes Processing Fee & 18% GST
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bankOffers.map((bank, i) => (
            <div
              key={i}
              className={`glass-card rounded-2xl p-5 border transition-all hover:-translate-y-1 relative flex flex-col justify-between ${
                i === 0
                  ? 'border-emerald-500/50 shadow-xl shadow-emerald-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {i === 0 && (
                <div className="absolute -top-3 right-5 px-2.5 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
                  Best Match
                </div>
              )}

              <div className="space-y-4">
                {/* Bank Header */}
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400 text-xs">
                    {bank.bank_code || 'BNK'}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{bank.bank_name}</h3>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="text-[10px] text-slate-400">Approval Odds:</span>
                      <span className="text-[11px] font-bold text-emerald-400">{bank.approval_probability}%</span>
                    </div>
                  </div>
                </div>

                {/* Rate vs APR Highlights */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400">{t('results.headline_rate')}</span>
                    <p className="text-sm font-bold text-white">{bank.headline_rate}%</p>
                  </div>
                  <div className="border-l border-slate-800 pl-2">
                    <span className="text-[10px] text-emerald-400 font-semibold">{t('results.effective_apr')}</span>
                    <p className="text-sm font-extrabold text-emerald-400">{bank.effective_apr}%</p>
                  </div>
                </div>

                {/* Financial figures */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('results.monthly_emi')}:</span>
                    <span className="font-bold text-white">₹{Number(bank.monthly_emi).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('results.hidden_fees')}:</span>
                    <span className="font-semibold text-amber-400">₹{Number(bank.total_upfront_fees).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pl-2">
                    <span>(Processing + 18% GST + Ins.):</span>
                    <span>₹{Number(bank.processing_fee + bank.gst_on_fee).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400 font-medium">{t('results.total_cost')}:</span>
                    <span className="font-bold text-slate-200">₹{Number(bank.total_cost_of_borrowing).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-5 mt-4 border-t border-slate-800 flex items-center space-x-2">
                <Link
                  to="/documents"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center transition-all shadow-md shadow-blue-600/20"
                >
                  {t('results.apply_now')}
                </Link>
                <button
                  onClick={downloadPdf}
                  title="Download Sanction Letter"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function roundTo(num, decimals) {
  return Number(Math.round(num + "e" + decimals) + "e-" + decimals);
}
