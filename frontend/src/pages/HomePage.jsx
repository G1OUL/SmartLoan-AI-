import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheck, BrainCircuit, Percent, FileCheck, ArrowRight, 
  CheckCircle2, XCircle, AlertCircle, Sparkles, Building2, TrendingUp, Lock 
} from 'lucide-react';

export default function HomePage() {
  const { t } = useTranslation();

  // Quick Mini-Simulator state
  const [quickAmount, setQuickAmount] = useState(1000000);
  const [quickTenure, setQuickTenure] = useState(60);
  const [quickRate, setQuickRate] = useState(8.75);

  const r = (quickRate / 100) / 12;
  const emi = Math.round((quickAmount * r * Math.pow(1 + r, quickTenure)) / (Math.pow(1 + r, quickTenure) - 1));
  const totalRepayment = emi * quickTenure;
  const totalInterest = totalRepayment - quickAmount;

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-20 overflow-hidden">
        {/* Glow ambient background accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('hero.badge')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                <span>{t('hero.title_part1')} </span>
                <span className="gradient-text">{t('hero.title_part2')}</span><br />
                <span>{t('hero.title_part3')}</span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                {t('hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/wizard"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 group"
                >
                  <span>{t('hero.cta_apply')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/calculator"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all flex items-center justify-center space-x-2"
                >
                  <span>{t('hero.cta_calc')}</span>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-center lg:text-left">
                <div>
                  <p className="text-lg sm:text-xl font-bold text-white">{t('hero.stat_models')}</p>
                  <p className="text-xs text-slate-400">Validated by 5-Fold CV</p>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-emerald-400">{t('hero.stat_banks')}</p>
                  <p className="text-xs text-slate-400">SBI, HDFC, ICICI & more</p>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-blue-400">{t('hero.stat_spam')}</p>
                  <p className="text-xs text-slate-400">Zero Commercial Leakage</p>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Quick Simulator */}
            <div className="lg:col-span-5">
              <div className="glass-card rounded-2xl p-6 shadow-2xl border border-slate-700/80 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider">Instant EMI Simulator</h2>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md font-semibold">
                    Real-Time
                  </span>
                </div>

                <div className="space-y-5 pt-4">
                  {/* Amount Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Loan Amount</span>
                      <span className="text-white font-bold">₹{quickAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <input
                      type="range"
                      min="100000"
                      max="10000000"
                      step="50000"
                      value={quickAmount}
                      onChange={(e) => setQuickAmount(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Tenure Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Tenure</span>
                      <span className="text-white font-bold">{quickTenure} Months ({roundTo(quickTenure/12, 1)} Yrs)</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="240"
                      step="12"
                      value={quickTenure}
                      onChange={(e) => setQuickTenure(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Rate Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Interest Rate</span>
                      <span className="text-white font-bold">{quickRate}% p.a.</span>
                    </div>
                    <input
                      type="range"
                      min="7.5"
                      max="16.0"
                      step="0.25"
                      value={quickRate}
                      onChange={(e) => setQuickRate(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  {/* Calculated Output Card */}
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Estimated Monthly EMI:</span>
                      <span className="text-xl font-extrabold text-emerald-400">
                        ₹{emi.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800/80">
                      <div>
                        <span className="text-slate-400">Total Interest:</span>
                        <p className="font-semibold text-slate-200">₹{totalInterest.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Total Repayment:</span>
                        <p className="font-semibold text-slate-200">₹{totalRepayment.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/wizard"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center block transition-all shadow-md shadow-blue-600/30"
                  >
                    Check Approval Probability with Machine Learning &rarr;
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Partner Banks Strip */}
      <section className="border-y border-slate-800/80 bg-slate-900/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">
            Pre-Screened Lenders & Underwriting Norms Supported
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-80">
            {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Bank of Baroda', 'Punjab National Bank'].map((bank, i) => (
              <div key={i} className="flex items-center space-x-2 text-slate-300 font-semibold text-sm hover:text-white transition-colors">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>{bank}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparative Gap Matrix (From Section 4 of Synopsis) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
            Gap Analysis & Comparison
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            SmartLoan AI vs. Traditional Aggregators
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Why traditional loan aggregators harm your credit score and conceal true costs, and how SmartLoan AI protects you.
          </p>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-700 text-slate-300">
                  <th className="py-4 px-6 font-bold uppercase tracking-wider">Evaluation Criteria</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-wider text-red-400">Commercial Aggregators</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-wider text-amber-400">Bank Netbanking Portals</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10">SmartLoan AI (Our Platform)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-3.5 px-6 font-medium text-white">Pre-Application Approval Odds</td>
                  <td className="py-3.5 px-6 text-slate-400">Vague / Commercial bias</td>
                  <td className="py-3.5 px-6 text-slate-400">None (Requires hard pull)</td>
                  <td className="py-3.5 px-6 font-bold text-emerald-400 bg-emerald-500/5">ML Probability Score (0–100%)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium text-white">Hidden Fee Transparency</td>
                  <td className="py-3.5 px-6 text-slate-400">Obscured in Fine Print</td>
                  <td className="py-3.5 px-6 text-slate-400">Disclosed only in Sanction Letter</td>
                  <td className="py-3.5 px-6 font-bold text-emerald-400 bg-emerald-500/5">Complete APR & Ancillary Fee Breakdown</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium text-white">Visual EMI & Amortization</td>
                  <td className="py-3.5 px-6 text-slate-400">Basic tabular EMI only</td>
                  <td className="py-3.5 px-6 text-slate-400">Standard static table</td>
                  <td className="py-3.5 px-6 font-bold text-emerald-400 bg-emerald-500/5">Interactive Recharts & Payoff Curves</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium text-white">Single Multi-Bank Intake</td>
                  <td className="py-3.5 px-6 text-slate-400">Yes (Captures leads for spam)</td>
                  <td className="py-3.5 px-6 text-slate-400">No (Single bank portal only)</td>
                  <td className="py-3.5 px-6 font-bold text-emerald-400 bg-emerald-500/5">Unified 4-Stage Secure Wizard</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium text-white">Vernacular Languages</td>
                  <td className="py-3.5 px-6 text-slate-400">English Only</td>
                  <td className="py-3.5 px-6 text-slate-400">English / Basic Hindi</td>
                  <td className="py-3.5 px-6 font-bold text-emerald-400 bg-emerald-500/5">5 Languages: EN, HI, MR, GU, TA</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium text-white">KYC Document Assistant</td>
                  <td className="py-3.5 px-6 text-slate-400">Manual upload list</td>
                  <td className="py-3.5 px-6 text-slate-400">Static file upload</td>
                  <td className="py-3.5 px-6 font-bold text-emerald-400 bg-emerald-500/5">Dynamic Role-Based Checklist</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium text-white">Spam / Telemarketing Sales Calls</td>
                  <td className="py-3.5 px-6 text-red-400 font-semibold">High (Aggressive calling & lead selling)</td>
                  <td className="py-3.5 px-6 text-slate-400">Moderate</td>
                  <td className="py-3.5 px-6 font-bold text-emerald-400 bg-emerald-500/5 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Zero (Privacy-First Architecture)</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Core Features Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-14">
          <h2 className="text-3xl font-extrabold text-white">{t('features.title')}</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">{t('features.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="glass-card rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
              <BrainCircuit className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">{t('features.ml_title')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('features.ml_desc')}</p>
          </div>

          <div className="glass-card rounded-2xl p-6 hover:border-emerald-500/50 transition-all hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <Percent className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">{t('features.apr_title')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('features.apr_desc')}</p>
          </div>

          <div className="glass-card rounded-2xl p-6 hover:border-purple-500/50 transition-all hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
              <FileCheck className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">{t('features.kyc_title')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('features.kyc_desc')}</p>
          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-blue-500/30 bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-slate-950 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to verify your loan approval probability?
            </h3>
            <p className="text-slate-400 text-sm max-w-xl">
              Takes less than 2 minutes. Receive instant AI confidence scores across 7 commercial banks with zero CIBIL impact.
            </p>
          </div>
          <Link
            to="/wizard"
            className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/40 hover:scale-105 transition-all flex items-center space-x-2 flex-shrink-0"
          >
            <span>Start Free Evaluation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}

function roundTo(num, decimals) {
  return Number(Math.round(num + "e" + decimals) + "e-" + decimals);
}
