import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FileText, CheckCircle2, TrendingUp, 
  BrainCircuit, Building2, Plus, Trash2, ArrowUpRight, ShieldCheck, Activity 
} from 'lucide-react';
import api from '../services/api';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [applications, setApplications] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // New bank modal form state
  const [newBank, setNewBank] = useState({
    bank_name: '',
    code: '',
    loan_category: 'Home',
    min_interest_rate: 8.5,
    max_interest_rate: 9.5,
    processing_fee_pct: 0.5,
    min_cibil: 680,
  });
  const [showAddBank, setShowAddBank] = useState(false);

  const fetchAdminData = async () => {
    try {
      const [anaRes, appRes, bnkRes] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAllApplications(),
        api.getBanks(),
      ]);
      setAnalytics(anaRes.data);
      setApplications(appRes.data.applications || []);
      setBanks(bnkRes.data.banks || []);
    } catch (e) {
      console.error("Admin fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.updateApplicationStatus(id, newStatus);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const handleAddBank = async (e) => {
    e.preventDefault();
    try {
      await api.addBankProduct(newBank);
      setShowAddBank(false);
      setNewBank({
        bank_name: '',
        code: '',
        loan_category: 'Home',
        min_interest_rate: 8.5,
        max_interest_rate: 9.5,
        processing_fee_pct: 0.5,
        min_cibil: 680,
      });
      fetchAdminData();
    } catch (e) {
      alert("Failed to add bank product");
    }
  };

  const handleDeleteBank = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bank product?")) return;
    try {
      await api.deleteBankProduct(id);
      fetchAdminData();
    } catch (e) {
      alert("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center text-slate-400">
        <Activity className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
        <p className="text-xs">Loading Admin Telemetry & Analytics...</p>
      </div>
    );
  }

  const overview = analytics?.overview || {};
  const modelMetrics = analytics?.model_metrics || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs text-purple-400 font-semibold mb-1">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Platform Administration & Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            SmartLoan AI Executive Portal
          </h1>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {['overview', 'ml_metrics', 'applications', 'banks'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Total Applications</span>
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-black text-white">{overview.total_applications || 0}</p>
              <p className="text-[10px] text-emerald-400 font-medium">Dual-Engine Scored</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Overall Approval Rate</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-400">{overview.approval_rate || 0}%</p>
              <p className="text-[10px] text-slate-500">High + Moderate Tiers</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Active Partner Lenders</span>
                <Building2 className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-white">{overview.total_banks || 0}</p>
              <p className="text-[10px] text-purple-400">Commercial Banks</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Registered Users</span>
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-white">{overview.total_users || 0}</p>
              <p className="text-[10px] text-amber-400">Zero Telemarketing Leads</p>
            </div>
          </div>

          {/* Category Distribution & Quick Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Applications by Loan Category
              </h3>
              <div className="space-y-3">
                {(analytics?.category_distribution || []).map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{cat.category} Loan</span>
                      <span className="text-white font-bold">{cat.count} apps</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (cat.count / Math.max(overview.total_applications, 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Approval Tier Distribution
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-300 font-semibold uppercase">High Confidence</span>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{overview.high_approval_count || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] text-amber-300 font-semibold uppercase">Moderate Odds</span>
                  <p className="text-xl font-bold text-amber-400 mt-1">{overview.moderate_approval_count || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <span className="text-[10px] text-red-300 font-semibold uppercase">High Risk</span>
                  <p className="text-xl font-bold text-red-400 mt-1">{overview.low_approval_count || 0}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Underwriting engine applies bank-specific policy adjustments on top of the Scikit-learn predictive model.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ML METRICS TAB */}
      {activeTab === 'ml_metrics' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {modelMetrics.model_name || 'Random Forest Ensemble (150 Trees)'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Validated via 5-Fold Stratified Cross-Validation</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                Production Ready
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Test Accuracy</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">{modelMetrics.accuracy}%</p>
                <p className="text-[10px] text-slate-500">Target: &gt; 85%</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">ROC-AUC Score</span>
                <p className="text-2xl font-black text-blue-400 mt-1">{modelMetrics.roc_auc}</p>
                <p className="text-[10px] text-slate-500">Target: &gt; 0.88</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Precision</span>
                <p className="text-2xl font-black text-purple-400 mt-1">{modelMetrics.precision}%</p>
                <p className="text-[10px] text-slate-500">Minimizing false promises</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Recall</span>
                <p className="text-2xl font-black text-amber-400 mt-1">{modelMetrics.recall}%</p>
                <p className="text-[10px] text-slate-500">Capturing eligibilities</p>
              </div>
            </div>

            {/* Feature Importances */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Top Predictive Feature Contributions (Gini Importance)
              </h4>
              <div className="space-y-2.5">
                {(modelMetrics.feature_importances || []).slice(0, 6).map((feat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-mono text-[11px]">{feat.feature}</span>
                      <span className="text-white font-bold">{feat.importance}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, feat.importance * 3)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* APPLICATIONS TAB */}
      {activeTab === 'applications' && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">All Borrower Applications ({applications.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-4">Ref / Date</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Category / Principal</th>
                  <th className="py-3 px-4">Income / CIBIL</th>
                  <th className="py-3 px-4">ML Approval</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-blue-400 font-semibold">
                      SLA-{String(app.id).padStart(6, '0')}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{app.applicant_name}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-200">₹{Number(app.loan_amount).toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-400 block">{app.loan_category}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span>₹{Number(app.monthly_income).toLocaleString('en-IN')} / mo</span>
                      <span className="text-[10px] text-emerald-400 block font-semibold">CIBIL: {app.credit_score}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${app.approval_probability >= 75 ? 'text-emerald-400' : (app.approval_probability >= 50 ? 'text-amber-400' : 'text-red-400')}`}>
                        {app.approval_probability}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                        className="glass-input rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none bg-slate-900"
                      >
                        <option value="Pre-Approved">Pre-Approved</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Sanctioned">Sanctioned</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={api.getPdfReportUrl(app.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-semibold border border-blue-500/30 inline-flex items-center space-x-1"
                      >
                        <span>PDF</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BANKS TAB */}
      {activeTab === 'banks' && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Partner Bank Lending Terms ({banks.length})</h3>
            <button
              onClick={() => setShowAddBank(!showAddBank)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Bank Product</span>
            </button>
          </div>

          {/* Add Bank Product Form */}
          {showAddBank && (
            <form onSubmit={handleAddBank} className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-4">
              <h4 className="text-xs font-bold text-white">New Bank Offering Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Bank Name (e.g. Canara Bank)"
                  value={newBank.bank_name}
                  onChange={(e) => setNewBank({ ...newBank, bank_name: e.target.value })}
                  required
                  className="glass-input rounded-lg px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Code (e.g. CANARA)"
                  value={newBank.code}
                  onChange={(e) => setNewBank({ ...newBank, code: e.target.value })}
                  required
                  className="glass-input rounded-lg px-3 py-2 text-xs text-white uppercase"
                />
                <select
                  value={newBank.loan_category}
                  onChange={(e) => setNewBank({ ...newBank, loan_category: e.target.value })}
                  className="glass-input rounded-lg px-3 py-2 text-xs text-white bg-slate-900"
                >
                  <option value="Home">Home Loan</option>
                  <option value="Personal">Personal Loan</option>
                  <option value="Education">Education Loan</option>
                  <option value="Vehicle">Vehicle Loan</option>
                </select>
                <input
                  type="number"
                  step="0.05"
                  placeholder="Interest Rate (e.g. 8.6)"
                  value={newBank.min_interest_rate}
                  onChange={(e) => setNewBank({ ...newBank, min_interest_rate: Number(e.target.value) })}
                  className="glass-input rounded-lg px-3 py-2 text-xs text-white"
                />
                <input
                  type="number"
                  step="0.05"
                  placeholder="Processing Fee % (e.g. 0.5)"
                  value={newBank.processing_fee_pct}
                  onChange={(e) => setNewBank({ ...newBank, processing_fee_pct: Number(e.target.value) })}
                  className="glass-input rounded-lg px-3 py-2 text-xs text-white"
                />
                <input
                  type="number"
                  placeholder="Min CIBIL (e.g. 680)"
                  value={newBank.min_cibil}
                  onChange={(e) => setNewBank({ ...newBank, min_cibil: Number(e.target.value) })}
                  className="glass-input rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddBank(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          )}

          {/* Banks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {banks.map((b) => (
              <div key={b.id} className="glass-card rounded-xl p-4 border border-slate-800 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white">{b.bank_name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                      {b.code}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteBank(b.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
                  <div>
                    <span className="text-slate-400">Category:</span>
                    <p className="font-semibold text-slate-200">{b.loan_category}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Interest Rate:</span>
                    <p className="font-semibold text-emerald-400">{b.min_interest_rate}% - {b.max_interest_rate}%</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Proc. Fee:</span>
                    <p className="font-semibold text-slate-200">{b.processing_fee_pct}% (+18% GST)</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Min CIBIL:</span>
                    <p className="font-semibold text-slate-200">{b.min_cibil}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
