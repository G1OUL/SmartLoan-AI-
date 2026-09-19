import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calculator, Percent, TrendingDown, DollarSign, ShieldAlert, 
  HelpCircle, ChevronRight, Layers, Table as TableIcon 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import api from '../services/api';

export default function CalculatorPage() {
  const { t } = useTranslation();

  const [loanAmount, setLoanAmount] = useState(2500000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureMonths, setTenureMonths] = useState(180);
  const [procFeePct, setProcFeePct] = useState(1.0);
  const [insPct, setInsPct] = useState(0.5);
  const [docCharges, setDocCharges] = useState(1500);

  const [calcResult, setCalcResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCalculations = async () => {
    try {
      const res = await api.calculateCosts({
        loan_amount: loanAmount,
        annual_interest_rate: interestRate,
        tenure_months: tenureMonths,
        processing_fee_pct: procFeePct,
        insurance_rate_pct: insPct,
        doc_charges: docCharges,
      });
      setCalcResult(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalculations();
  }, [loanAmount, interestRate, tenureMonths, procFeePct, insPct, docCharges]);

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Percent className="w-3.5 h-3.5" />
          <span>RBI Digital Lending Transparency Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{t('calculator.title')}</h1>
        <p className="text-slate-400 text-xs sm:text-sm">{t('calculator.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sliders Input Panel */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Calculator className="w-4 h-4 text-blue-400" />
            <span>Borrowing Parameters</span>
          </h2>

          {/* Loan Amount */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">{t('calculator.principal')}</span>
              <span className="font-bold text-white">₹{loanAmount.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="100000"
              max="15000000"
              step="50000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>₹1 Lakh</span>
              <span>₹1.5 Crore</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">{t('calculator.rate')}</span>
              <span className="font-bold text-white">{interestRate}% p.a.</span>
            </div>
            <input
              type="range"
              min="6.5"
              max="18.0"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>6.5%</span>
              <span>18.0%</span>
            </div>
          </div>

          {/* Tenure */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">{t('calculator.tenure')}</span>
              <span className="font-bold text-white">{tenureMonths} Months ({Math.round(tenureMonths/12*10)/10} Yrs)</span>
            </div>
            <input
              type="range"
              min="12"
              max="360"
              step="12"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1 Year</span>
              <span>30 Years</span>
            </div>
          </div>

          {/* Hidden Ancillary Fees Section */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Ancillary Hidden Levies</span>
            </h3>

            {/* Processing Fee */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Processing Fee % (+18% GST)</span>
                <span className="font-bold text-amber-400">{procFeePct}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="3.0"
                step="0.1"
                value={procFeePct}
                onChange={(e) => setProcFeePct(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Insurance */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Loan Protection Insurance %</span>
                <span className="font-bold text-amber-400">{insPct}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.5"
                step="0.1"
                value={insPct}
                onChange={(e) => setInsPct(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Doc charges */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Documentation Charges</span>
                <span className="font-bold text-amber-400">₹{docCharges}</span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="250"
                value={docCharges}
                onChange={(e) => setDocCharges(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

        </div>

        {/* Results & Visual Analytics Panel */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Output KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            
            <div className="glass-card rounded-xl p-4 border border-blue-500/30 bg-blue-950/20">
              <span className="text-[11px] text-slate-400">{t('calculator.monthly_emi')}</span>
              <p className="text-xl font-black text-white mt-1">
                ₹{calcResult ? Number(calcResult.monthly_emi).toLocaleString('en-IN') : '...'}
              </p>
              <p className="text-[10px] text-blue-400">Reducing balance</p>
            </div>

            <div className="glass-card rounded-xl p-4 border border-emerald-500/30 bg-emerald-950/20">
              <span className="text-[11px] text-slate-400">{t('calculator.effective_apr')}</span>
              <p className="text-xl font-black text-emerald-400 mt-1">
                {calcResult ? calcResult.effective_apr : '...'}%
              </p>
              <p className="text-[10px] text-emerald-500">True annualized rate</p>
            </div>

            <div className="glass-card rounded-xl p-4 border border-amber-500/30 bg-amber-950/20">
              <span className="text-[11px] text-slate-400">{t('calculator.upfront_fees')}</span>
              <p className="text-xl font-black text-amber-400 mt-1">
                ₹{calcResult ? Number(calcResult.total_upfront_fees).toLocaleString('en-IN') : '...'}
              </p>
              <p className="text-[10px] text-amber-500">Incl. 18% GST (₹{calcResult?.gst_on_fee})</p>
            </div>

            <div className="glass-card rounded-xl p-4 border border-slate-800">
              <span className="text-[11px] text-slate-400">{t('calculator.total_interest')}</span>
              <p className="text-lg font-bold text-red-400 mt-1">
                ₹{calcResult ? Number(calcResult.total_interest).toLocaleString('en-IN') : '...'}
              </p>
            </div>

            <div className="glass-card rounded-xl p-4 border border-slate-800">
              <span className="text-[11px] text-slate-400">{t('calculator.net_disbursed')}</span>
              <p className="text-lg font-bold text-emerald-400 mt-1">
                ₹{calcResult ? Number(calcResult.net_disbursed_amount).toLocaleString('en-IN') : '...'}
              </p>
            </div>

            <div className="glass-card rounded-xl p-4 border border-slate-800">
              <span className="text-[11px] text-slate-400">Total Borrowing Cost</span>
              <p className="text-lg font-bold text-slate-200 mt-1">
                ₹{calcResult ? Number(calcResult.total_cost_of_borrowing).toLocaleString('en-IN') : '...'}
              </p>
            </div>

          </div>

          {/* Interactive Donut Cost Distribution Chart */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>{t('calculator.pie_title')} (Principal vs. Interest vs. Hidden Ancillary Costs)</span>
            </h3>

            <div className="h-64 w-full">
              {calcResult && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={calcResult.pie_breakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {calcResult.pie_breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Payoff Curve Area Chart */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-blue-400" />
              <span>{t('calculator.schedule_title')} (Outstanding Balance Curve)</span>
            </h3>

            <div className="h-56 w-full">
              {calcResult && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={calcResult.yearly_summary}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="year" stroke="#64748b" tickFormatter={(y) => `Yr ${y}`} fontSize={10} />
                    <YAxis stroke="#64748b" tickFormatter={(v) => `₹${Math.round(v/100000)}L`} fontSize={10} />
                    <RechartsTooltip
                      formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="ending_balance" name="Remaining Balance" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Amortization Schedule Table */}
      {calcResult && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <TableIcon className="w-4 h-4 text-blue-400" />
              <span>Year-by-Year Amortization Schedule</span>
            </h3>
            <span className="text-xs text-slate-400">Total {calcResult.yearly_summary.length} Years</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-4 font-semibold">Year</th>
                  <th className="py-2.5 px-4 font-semibold">Principal Repaid</th>
                  <th className="py-2.5 px-4 font-semibold">Interest Paid</th>
                  <th className="py-2.5 px-4 font-semibold">Total Installment</th>
                  <th className="py-2.5 px-4 font-semibold">Ending Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {calcResult.yearly_summary.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-white">Year {row.year}</td>
                    <td className="py-2.5 px-4 text-emerald-400 font-medium">₹{Number(row.principal_paid).toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4 text-red-400 font-medium">₹{Number(row.interest_paid).toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4">₹{Number(row.total_paid).toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-200">₹{Number(row.ending_balance).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
