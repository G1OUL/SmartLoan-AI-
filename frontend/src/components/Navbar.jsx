import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheck, Calculator, FileText, LayoutDashboard, 
  LogIn, LogOut, Globe, Sparkles, User, ChevronDown, Menu, X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const languages = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' }
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, isAdmin, logout, quickLoginAs } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [langDropdown, setLangDropdown] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('smartloan_language', code);
    setLangDropdown(false);
  };

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.apply'), path: '/wizard' },
    { name: t('nav.calculator'), path: '/calculator' },
    { name: t('nav.documents'), path: '/documents' },
    { name: t('nav.admin'), path: '/admin', badge: 'Admin' },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 p-[2px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">SmartLoan</span>
                <span className="text-xs px-1.5 py-0.5 font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide">Multi-Bank Loan Advisory</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded-full font-semibold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden lg:flex items-center space-x-3">
            
            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdown(!langDropdown)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:border-slate-500 transition-colors"
                title="Change Language / भाषा बदलें"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-medium">
                  {languages.find((l) => l.code === i18n.language)?.native || 'English'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdown && (
                <div className="absolute right-0 mt-2 w-40 glass-card rounded-xl py-1 shadow-2xl border border-slate-700 divide-y divide-slate-800 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-blue-600/20 transition-colors ${
                        i18n.language === lang.code ? 'text-blue-400 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <span>{lang.native}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{lang.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Demo Logins for Evaluator Convenience */}
            {!isAuthenticated ? (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => quickLoginAs('borrower')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all flex items-center space-x-1"
                  title="One-click demo login as regular borrower"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{t('nav.demo_borrower')}</span>
                </button>
                <button
                  onClick={() => quickLoginAs('admin')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition-all"
                  title="One-click demo login as administrator"
                >
                  <span>{t('nav.demo_admin')}</span>
                </button>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/30"
                >
                  {t('nav.login')}
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center text-xs font-bold text-white">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-semibold text-slate-200 leading-none">{user?.full_name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-tight">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setLangDropdown(!langDropdown)}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
            >
              <Globe className="w-4 h-4 text-blue-400" />
            </button>
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
            >
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenu && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenu(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-blue-600/20"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col space-y-2">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => { quickLoginAs('borrower'); setMobileMenu(false); }}
                  className="w-full py-2 text-center text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                >
                  {t('nav.demo_borrower')}
                </button>
                <button
                  onClick={() => { quickLoginAs('admin'); setMobileMenu(false); }}
                  className="w-full py-2 text-center text-xs font-semibold rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30"
                >
                  {t('nav.demo_admin')}
                </button>
                <Link
                  to="/login"
                  onClick={() => setMobileMenu(false)}
                  className="w-full py-2 text-center text-xs font-semibold rounded-lg bg-blue-600 text-white"
                >
                  {t('nav.login')}
                </Link>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">{user?.full_name} ({user?.role})</span>
                <button
                  onClick={() => { logout(); setMobileMenu(false); }}
                  className="text-xs text-red-400 font-medium"
                >
                  {t('nav.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
