import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChatWidget from './components/AIChatWidget';

import HomePage from './pages/HomePage';
import ApplicationWizard from './pages/ApplicationWizard';
import ComparisonResults from './pages/ComparisonResults';
import CalculatorPage from './pages/CalculatorPage';
import DocumentsPage from './pages/DocumentsPage';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  // 1. Session check loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 p-[2px] animate-spin">
          <div className="w-full h-full bg-slate-950 rounded-[14px]"></div>
        </div>
        <p className="mt-4 text-xs font-semibold text-slate-400 tracking-wider uppercase">Loading SmartLoan AI...</p>
      </div>
    );
  }

  // 2. Gatekeeper: If NOT authenticated, show Login page first
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
        <main className="flex-1 flex items-center justify-center">
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<LoginPage />} />
          </Routes>
        </main>
      </div>
    );
  }

  // 3. Once authenticated: Full website unlocked
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wizard" element={<ApplicationWizard />} />
          <Route path="/results" element={<ComparisonResults />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <AIChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

