import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

export default function App() {
  return (
    <AuthProvider>
      <Router>
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
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </main>

          <Footer />
          <AIChatWidget />
        </div>
      </Router>
    </AuthProvider>
  );
}
