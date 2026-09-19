import React from 'react';
import { ShieldCheck, Heart, ExternalLink, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-base text-white">SmartLoan AI</span>
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed">
              An intelligent, transparent retail loan advisory platform engineered to eliminate predatory financial marketing, uncover concealed ancillary fees, and calculate continuous approval odds before formal lender submission.
            </p>
            <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit">
              <Lock className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">Privacy-First: Zero Data Monetization or Spam Calls</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 tracking-wide uppercase text-[11px]">Core Capabilities</h4>
            <ul className="space-y-2">
              <li><a href="/wizard" className="hover:text-blue-400 transition-colors">ML Approval Predictor</a></li>
              <li><a href="/calculator" className="hover:text-blue-400 transition-colors">True Cost & APR Calculator</a></li>
              <li><a href="/documents" className="hover:text-blue-400 transition-colors">Dynamic KYC Assistant</a></li>
              <li><a href="/admin" className="hover:text-blue-400 transition-colors">Lender Administration</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 tracking-wide uppercase text-[11px]">Regulatory Compliance</h4>
            <ul className="space-y-2">
              <li className="flex items-center space-x-1">
                <span>RBI Digital Lending Norms</span>
              </li>
              <li><span>Key Fact Statement (KFS) Mode</span></li>
              <li><span>Bcrypt 12-Rounds Encryption</span></li>
              <li><span>Academic Capstone 2025–26</span></li>
            </ul>
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-400">
          <p>&copy; {new Date().getFullYear()} SmartLoan AI Platform. Developed for Academic Final Project.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Powered by Scikit-learn, React & Flask</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
