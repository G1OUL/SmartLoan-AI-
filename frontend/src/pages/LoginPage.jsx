import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Lock, Mail, User, Phone, Sparkles, Eye, EyeOff, 
  ArrowRight, CheckCircle2, Building2, BrainCircuit, KeyRound, AlertCircle, Info 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, quickLoginAs } = useAuth();

  const [isRegisterTab, setIsRegisterTab] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('borrower');

  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password. Please try demo accounts below.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        full_name: regFullName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        role: regRole
      });
      setSuccessMsg('Account created successfully! Redirecting...');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Demo Login
  const handleQuickDemo = async (role) => {
    setError('');
    setLoading(true);
    try {
      await quickLoginAs(role);
      navigate(role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError('Demo authentication failed. Please ensure the backend server is reachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Brand Value Proposition & Trust Badges */}
        <div className="lg:col-span-5 space-y-6 text-left hidden lg:block pr-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 p-[2px] shadow-xl shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tight">SmartLoan</span>
              <span className="ml-1.5 text-xs px-2 py-0.5 font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md">
                AI
              </span>
              <p className="text-xs text-slate-400">Next-Gen Multi-Bank Underwriting</p>
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-white leading-snug">
            Intelligent borrowing with <span className="gradient-text">100% transparency</span> and zero guesswork.
          </h2>

          <div className="space-y-4 pt-2">
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <BrainCircuit className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">94.8% Predictive Approval Accuracy</h4>
                <p className="text-[11px] text-slate-400">Random Forest ensemble trained on 12,000+ retail banking loan records.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Zero Hard Credit Bureau Inquiries</h4>
                <p className="text-[11px] text-slate-400">Check eligibility without dropping your CIBIL score by even 1 point.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Building2 className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">7+ Premier Partner Banks</h4>
                <p className="text-[11px] text-slate-400">Instant side-by-side comparison across SBI, HDFC, ICICI, Axis, Kotak, BOB & PNB.</p>
              </div>
            </div>
          </div>

          {/* Privacy Guarantee Box */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2.5">
            <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-[11px] leading-relaxed">
              <b>Strict Privacy:</b> 256-Bit SSL Encrypted. We never sell phone numbers to telemarketing agents.
            </span>
          </div>
        </div>

        {/* Right Side: Interactive Authentication Card */}
        <div className="lg:col-span-7">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
            
            {/* Tab Header (Sign In vs Create Account) */}
            <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => { setIsRegisterTab(false); setError(''); }}
                className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                  !isRegisterTab
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In (लॉग इन)
              </button>
              <button
                type="button"
                onClick={() => { setIsRegisterTab(true); setError(''); }}
                className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                  isRegisterTab
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account (नया खाता)
              </button>
            </div>

            {/* 1-Click Fast Demo Logins */}
            {!isRegisterTab && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>One-Click Instant Demo Login:</span>
                  </span>
                  <span className="text-[10px] text-slate-400">For viva & testing</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('borrower')}
                    className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300">Demo Borrower</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Rahul Sharma (Applicant view)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('admin')}
                    className="p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300">Demo Admin</span>
                      <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Admin (Model & bank editor)</p>
                  </button>
                </div>
              </div>
            )}

            {/* Error / Success Notifications */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB 1: SIGN IN FORM */}
            {!isRegisterTab ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Email Address (ईमेल)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="borrower@smartloan.ai"
                      required
                      className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Password (पासवर्ड)</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] text-blue-400 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Borrower@123"
                      required
                      className="w-full glass-input rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span>Remember this device</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Protected by Bcrypt</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* TAB 2: REGISTER FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Full Legal Name (पूरा नाम)</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      required
                      className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Email Address (ईमेल)</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="rahul@example.com"
                        required
                        className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Mobile Number (फ़ोन)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Password (पासवर्ड)</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min. 6 chars"
                        required
                        className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Account Type (रोल)</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none bg-slate-900"
                    >
                      <option value="borrower">Borrower (ऋण आवेदक)</option>
                      <option value="admin">Administrator (एडमिन)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <span>Complete Free Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Footer Notice */}
            <div className="pt-3 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-400 flex items-center justify-center space-x-1">
                <span>By continuing, you agree to</span>
                <span className="text-slate-300 font-semibold">RBI Digital Lending Norms</span>
                <span>& zero data sharing</span>
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Forgot Password Helper Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel max-w-sm w-full rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-blue-400">
              <KeyRound className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Forgot Password?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              For this academic capstone system, you can immediately log in using the pre-configured accounts:
            </p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1.5">
              <p><b>Borrower:</b> <code className="text-emerald-400">borrower@smartloan.ai</code> / <code className="text-emerald-400">Borrower@123</code></p>
              <p><b>Admin:</b> <code className="text-purple-400">admin@smartloan.ai</code> / <code className="text-purple-400">Admin@123</code></p>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Got it, close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
