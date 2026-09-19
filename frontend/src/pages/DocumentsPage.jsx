import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileCheck, UploadCloud, CheckCircle2, Clock, AlertCircle, 
  FileText, Shield, Sparkles, Filter 
} from 'lucide-react';
import api from '../services/api';

export default function DocumentsPage() {
  const { t } = useTranslation();

  const [employmentType, setEmploymentType] = useState('Salaried');
  const [loanCategory, setLoanCategory] = useState('Home');
  const [checklist, setChecklist] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchChecklist = async () => {
    try {
      const res = await api.getDocumentChecklist({
        employment_type: employmentType,
        loan_category: loanCategory,
      });
      setChecklist(res.data.checklist);
      if (res.data.checklist.length > 0 && !selectedDocType) {
        setSelectedDocType(res.data.checklist[0].doc_type);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUploaded = async () => {
    try {
      const res = await api.getMyDocuments();
      setUploadedDocs(res.data.documents || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchChecklist();
  }, [employmentType, loanCategory]);

  useEffect(() => {
    fetchUploaded();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileToUpload || !selectedDocType) return;

    setUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('doc_type', selectedDocType);

    try {
      await api.uploadDocument(formData);
      setMessage({ type: 'success', text: `"${selectedDocType}" uploaded successfully!` });
      setFileToUpload(null);
      fetchUploaded();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || "Upload failed. Check format." });
    } finally {
      setUploading(false);
    }
  };

  // Compute checklist completion percentage
  const completedCount = checklist.filter((item) =>
    uploadedDocs.some((d) => d.doc_type === item.doc_type)
  ).length;
  const progressPct = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
          <FileCheck className="w-3.5 h-3.5" />
          <span>Rule-Based Document Assistant</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{t('documents.title')}</h1>
        <p className="text-slate-400 text-xs sm:text-sm">{t('documents.subtitle')}</p>
      </div>

      {/* Filter Bar for Dynamic Checklist */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-slate-300 font-semibold">
          <Filter className="w-4 h-4 text-blue-400" />
          <span>Tailor Checklist by Profile:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-400">Employment:</span>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="glass-input rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none bg-slate-900"
            >
              <option value="Salaried">Salaried (Corporate / Govt)</option>
              <option value="Self-Employed">Self-Employed / Business</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-400">Loan:</span>
            <select
              value={loanCategory}
              onChange={(e) => setLoanCategory(e.target.value)}
              className="glass-input rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none bg-slate-900"
            >
              <option value="Home">Home Loan</option>
              <option value="Personal">Personal Loan</option>
              <option value="Education">Education Loan</option>
              <option value="Vehicle">Vehicle Loan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Progress Metric Bar */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-300">{t('documents.progress')}</span>
          <span className="font-bold text-emerald-400">{completedCount} of {checklist.length} Completed ({progressPct}%)</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Dynamic Checklist Items */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Mandatory Verification Checklist</span>
          </h2>

          <div className="space-y-3">
            {checklist.map((item, idx) => {
              const isUploaded = uploadedDocs.some((d) => d.doc_type === item.doc_type);
              return (
                <div
                  key={idx}
                  className={`glass-card rounded-xl p-4 border transition-all flex items-start justify-between gap-4 ${
                    isUploaded
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {isUploaded ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{item.doc_type}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded-md font-medium">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  <div>
                    {isUploaded ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                        Uploaded
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedDocType(item.doc_type)}
                        className="text-[10px] px-2 py-1 rounded-md bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 font-semibold transition-colors whitespace-nowrap"
                      >
                        Upload Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upload Zone Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2 pb-3 border-b border-slate-800">
              <UploadCloud className="w-4 h-4 text-blue-400" />
              <span>{t('documents.upload_title')}</span>
            </h2>

            {message && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border border-red-500/20 text-red-300'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Target Document Category</label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none bg-slate-900"
                >
                  {checklist.map((c, i) => (
                    <option key={i} value={c.doc_type}>
                      {c.doc_type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Drag and drop box */}
              <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-2xl p-6 text-center space-y-2 transition-colors bg-slate-900/40">
                <UploadCloud className="w-8 h-8 text-blue-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-200">
                  {fileToUpload ? fileToUpload.name : t('documents.drag_drop')}
                </p>
                <p className="text-[10px] text-slate-400">PDF, PNG, JPG, DOCX (Max 16 MB)</p>
                <input
                  type="file"
                  id="doc-upload"
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.docx"
                  className="hidden"
                />
                <label
                  htmlFor="doc-upload"
                  className="inline-block px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                >
                  Choose Local File
                </label>
              </div>

              <button
                type="submit"
                disabled={uploading || !fileToUpload}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center justify-center space-x-2"
              >
                {uploading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Encrypting & Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload & Attach Document</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Uploaded Documents History */}
          {uploadedDocs.length > 0 && (
            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Attached Files ({uploadedDocs.length})
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {uploadedDocs.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-slate-200 font-semibold truncate">{doc.file_name}</p>
                        <p className="text-[10px] text-slate-400">{doc.doc_type} &bull; {doc.file_size_kb} KB</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
