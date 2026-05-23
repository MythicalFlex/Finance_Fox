import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  List, Bell, Calculator, IndianRupee, TrendingUp, PiggyBank, Percent,
  ChevronDown, AlertCircle, CheckCircle2, Palmtree
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active, dotColor, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${active ? 'bg-primaryLight text-primary' : 'text-textMuted hover:bg-gray-100'}`}
  >
    <div className="relative">
      {Icon && <Icon size={18} className={active ? 'text-primary' : 'text-textMuted'} />}
      {dotColor && !Icon && <div className={`w-2.5 h-2.5 rounded-sm ${dotColor}`} />}
    </div>
    <span>{label}</span>
  </button>
);

// ─── Reusable input ─────────────────────────────────────────────────────────
const CalcInput = ({ label, value, onChange, prefix, suffix, type = 'number', min, step }) => (
  <div>
    <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1">{label}</label>
    <div className="relative flex items-center">
      {prefix && <span className="absolute left-3 text-textMuted font-bold text-sm pointer-events-none">{prefix}</span>}
      <input
        type={type}
        value={value}
        min={min}
        step={step}
        onChange={e => onChange(e.target.value)}
        onWheel={e => e.target.blur()}
        className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 text-sm font-bold text-darkNavy focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${prefix ? 'pl-8 pr-4' : suffix ? 'pl-4 pr-8' : 'px-4'}`}
      />
      {suffix && <span className="absolute right-3 text-textMuted font-bold text-sm pointer-events-none">{suffix}</span>}
    </div>
  </div>
);

// ─── Result row ──────────────────────────────────────────────────────────────
const ResultRow = ({ label, value, highlight, dark }) => (
  <div className={`flex justify-between items-center py-2.5 border-b ${dark ? 'border-slate-700' : 'border-gray-100'} last:border-0 ${highlight ? 'font-bold' : ''}`}>
    <span className={`text-sm ${dark ? 'text-white' : highlight ? 'text-darkNavy' : 'text-textMuted'}`}>{label}</span>
    <span className={`text-sm font-bold ${dark ? 'text-white' : highlight ? 'text-primary text-base' : 'text-darkNavy'}`}>{value}</span>
  </div>
);

const fmt = (n) => '₹' + Number(n.toFixed(2)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─────────────────────────────────────────────────────────────────────────────
// 1. EMI Calculator
// ─────────────────────────────────────────────────────────────────────────────
const EMICalculator = () => {
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(60);
  const [tenureUnit, setTenureUnit] = useState('months');
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const months = tenureUnit === 'years' ? tenure * 12 : tenure;
  const r = rate / 100 / 12;
  const emi = r === 0 ? principal / months : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const total = emi * months;
  const interest = total - principal;

  return (
    <div className="bg-white rounded-2xl border border-borderLight shadow-sm">
      <div className="p-6 border-b border-borderLight flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary shrink-0">
          <IndianRupee size={20} />
        </div>
        <div>
          <h3 className="font-bold text-darkNavy">EMI Calculator</h3>
          <p className="text-xs text-textMuted">Calculate your Equated Monthly Instalment</p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <CalcInput label="Loan Amount (Principal)" value={principal} onChange={v => setPrincipal(+v)} prefix="₹" min="1000" />
          <CalcInput label="Annual Interest Rate" value={rate} onChange={v => setRate(+v)} suffix="%" min="0.1" step="0.1" />

          <div>
            <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1">Loan Tenure</label>
            <div className="flex gap-2">
              <div className="flex-1 relative flex items-center">
                <input
                  type="number"
                  value={tenure}
                  min="1"
                  onChange={e => setTenure(+e.target.value)}
                  onWheel={e => e.target.blur()}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-bold text-darkNavy focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="relative w-28" ref={dropRef}>
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="w-full h-full flex items-center justify-between px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-darkNavy focus:outline-none hover:border-primary/40 transition-all"
                >
                  {tenureUnit === 'months' ? 'Months' : 'Years'}
                  <ChevronDown size={14} className={`transition-transform duration-200 text-textMuted ${dropOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropOpen && (
                  <div className="absolute right-0 top-full mt-1 w-28 bg-white border border-borderLight rounded-xl shadow-xl py-1 z-50">
                    {['months', 'years'].map(u => (
                      <button key={u} onClick={() => { setTenureUnit(u); setDropOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors ${tenureUnit === u ? 'bg-primaryLight text-primary' : 'text-darkNavy hover:bg-slate-50'}`}>
                        {u === 'months' ? 'Months' : 'Years'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-darkNavy rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Monthly EMI</p>
            <p className="text-3xl font-bold text-white">{fmt(isNaN(emi) || !isFinite(emi) ? 0 : emi)}</p>
          </div>
          <div className="mt-4 space-y-0 border-t border-slate-700 pt-4">
            <ResultRow label="Principal Amount" value={fmt(principal)} dark />
            <ResultRow label="Total Interest" value={fmt(isNaN(interest) ? 0 : interest)} dark />
            <div className="flex justify-between items-center pt-2.5">
              <span className="text-xs text-gray-300 font-medium">Total Payment</span>
              <span className="text-sm font-bold text-primary">{fmt(isNaN(total) ? 0 : total)}</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Principal</span>
              <span>Interest</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex">
              <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${isNaN(principal / total) ? 0 : (principal / total) * 100}%` }} />
              <div className="bg-orange-300 h-full flex-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. SIP Calculator (Step-Up + Inflation Adjusted)
// ─────────────────────────────────────────────────────────────────────────────
const SIPCalculator = () => {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [increment, setIncrement] = useState(10);   // % yearly step-up
  const [inflation, setInflation] = useState(6);    // % annual inflation

  // ── Step-up SIP simulation (month by month) ─────────────────────────────
  // Each year the monthly investment increases by `increment`%.
  // balance compounds at monthly rate every month.
  const computeSIP = () => {
    const r = rate / 100 / 12;
    let balance = 0;
    let invested = 0;
    for (let month = 1; month <= years * 12; month++) {
      const yearIndex = Math.floor((month - 1) / 12);
      const monthlyAmt = monthly * Math.pow(1 + increment / 100, yearIndex);
      balance = (balance + monthlyAmt) * (1 + r);
      invested += monthlyAmt;
    }
    return { fv: balance, invested };
  };

  const { fv, invested } = computeSIP();
  const returns = fv - invested;
  // Real value: deflate the nominal FV by cumulative inflation over the period
  const realValue = inflation > 0 ? fv / Math.pow(1 + inflation / 100, years) : fv;
  const inflationErosion = fv - realValue;

  // Final year monthly SIP (for display)
  const finalMonthly = monthly * Math.pow(1 + increment / 100, years - 1);

  const safe = (n) => (isNaN(n) || !isFinite(n) ? 0 : n);

  return (
    <div className="bg-white rounded-2xl border border-borderLight shadow-sm">
      <div className="p-6 border-b border-borderLight flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
          <TrendingUp size={20} />
        </div>
        <div>
          <h3 className="font-bold text-darkNavy">SIP Calculator</h3>
          <p className="text-xs text-textMuted">Step-up SIP with inflation-adjusted real value</p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Inputs ── */}
        <div className="space-y-4">
          <CalcInput label="Starting Monthly Investment" value={monthly} onChange={v => setMonthly(+v)} prefix="₹" min="100" />
          <CalcInput label="Expected Annual Return" value={rate} onChange={v => setRate(+v)} suffix="%" min="0.1" step="0.1" />
          <CalcInput label="Investment Duration" value={years} onChange={v => setYears(+v)} suffix="Yrs" min="1" />

          {/* Step-up & Inflation in a 2-col grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1">
                Yearly Step-Up
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={increment}
                  min="0"
                  step="0.5"
                  onChange={e => setIncrement(+e.target.value)}
                  onWheel={e => e.target.blur()}
                  className="w-full bg-blue-50 border border-blue-200 rounded-xl py-2.5 pl-4 pr-8 text-sm font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-3 text-blue-400 font-bold text-sm pointer-events-none">%</span>
              </div>
              <p className="text-[10px] text-textMuted mt-1">Increase per year</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1">
                Inflation Rate
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={inflation}
                  min="0"
                  step="0.5"
                  onChange={e => setInflation(+e.target.value)}
                  onWheel={e => e.target.blur()}
                  className="w-full bg-orange-50 border border-orange-200 rounded-xl py-2.5 pl-4 pr-8 text-sm font-bold text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-3 text-orange-400 font-bold text-sm pointer-events-none">%</span>
              </div>
              <p className="text-[10px] text-textMuted mt-1">Set 0 to ignore</p>
            </div>
          </div>

          {/* Step-up preview pill */}
          {increment > 0 && years > 1 && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
              <span className="text-xs text-blue-600 font-medium">SIP in year {years}</span>
              <span className="text-sm font-bold text-blue-700">{fmt(safe(finalMonthly))}/mo</span>
            </div>
          )}
        </div>

        {/* ── Results ── */}
        <div className="bg-darkNavy rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />

          {/* Nominal FV */}
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Future Value (Nominal)</p>
            <p className="text-3xl font-bold text-white">{fmt(safe(fv))}</p>
          </div>

          <div className="mt-4 border-t border-slate-700 pt-4 space-y-0">
            <ResultRow label="Total Invested" value={fmt(safe(invested))} dark />
            <ResultRow label="Estimated Returns" value={fmt(safe(returns))} dark />

            {/* Inflation-adjusted separator */}
            {inflation > 0 && (
              <>
                <div className="flex items-center gap-2 py-2.5">
                  <div className="flex-1 border-t border-slate-600" />
                  <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider shrink-0">After Inflation ({inflation}%)</span>
                  <div className="flex-1 border-t border-slate-600" />
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-orange-300 font-medium">Purchasing Power</span>
                  <span className="text-sm font-bold text-orange-300">{fmt(safe(realValue))}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-400 font-medium">Inflation Erosion</span>
                  <span className="text-xs font-bold text-red-400">-{fmt(safe(inflationErosion))}</span>
                </div>
              </>
            )}

            <div className="flex justify-between items-center pt-2.5">
              <span className="text-xs text-gray-300 font-medium">Wealth Gained</span>
              <span className="text-sm font-bold text-blue-400">
                {invested > 0 ? ((returns / invested) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>

          {/* Stacked bar: Invested | Returns */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Invested</span>
              <span>Returns</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex">
              <div
                className="bg-blue-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${safe(invested / fv) * 100}%` }}
              />
              <div className="bg-green-400 h-full flex-1" />
            </div>
            {inflation > 0 && (
              <>
                <div className="flex justify-between text-xs text-gray-400 mb-1 mt-3">
                  <span>Real Value</span>
                  <span>Inflation Loss</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex">
                  <div
                    className="bg-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${safe(realValue / fv) * 100}%` }}
                  />
                  <div className="bg-red-400 h-full flex-1" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Lumpsum Calculator
// ─────────────────────────────────────────────────────────────────────────────
const LumpsumCalculator = () => {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [freq, setFreq] = useState(1);
  const [inflation, setInflation] = useState(6); // % annual inflation
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const freqOptions = [{ label: 'Annually', value: 1 }, { label: 'Half-yearly', value: 2 }, { label: 'Quarterly', value: 4 }, { label: 'Monthly', value: 12 }];
  const fv = principal * Math.pow(1 + rate / 100 / freq, freq * years);
  const returns = fv - principal;
  
  // Real value: deflate the nominal FV by cumulative inflation over the period
  const realValue = inflation > 0 ? fv / Math.pow(1 + inflation / 100, years) : fv;
  const inflationErosion = fv - realValue;

  const safe = (n) => (isNaN(n) || !isFinite(n) ? 0 : n);

  return (
    <div className="bg-white rounded-2xl border border-borderLight shadow-sm">
      <div className="p-6 border-b border-borderLight flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
          <PiggyBank size={20} />
        </div>
        <div>
          <h3 className="font-bold text-darkNavy">Lumpsum Calculator</h3>
          <p className="text-xs text-textMuted">One-time investment future value with compounding & inflation adjust</p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <CalcInput label="Principal Amount" value={principal} onChange={v => setPrincipal(+v)} prefix="₹" min="1000" />
          <CalcInput label="Annual Interest Rate" value={rate} onChange={v => setRate(+v)} suffix="%" min="0.1" step="0.1" />
          <CalcInput label="Time Period" value={years} onChange={v => setYears(+v)} suffix="Yrs" min="1" />
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1">Compounding</label>
              <div className="relative animate-fadeIn" ref={dropRef}>
                <button onClick={() => setDropOpen(!dropOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-darkNavy focus:outline-none hover:border-primary/40 transition-all">
                  <span className="truncate">{freqOptions.find(f => f.value === freq)?.label}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 text-textMuted shrink-0 ml-1 ${dropOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-borderLight rounded-xl shadow-xl py-1 z-50">
                    {freqOptions.map(f => (
                      <button key={f.value} onClick={() => { setFreq(f.value); setDropOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors ${freq === f.value ? 'bg-primaryLight text-primary' : 'text-darkNavy hover:bg-slate-50'}`}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1">
                Inflation Rate
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={inflation}
                  min="0"
                  step="0.5"
                  onChange={e => setInflation(+e.target.value)}
                  onWheel={e => e.target.blur()}
                  className="w-full bg-orange-50 border border-orange-200 rounded-xl py-2.5 pl-4 pr-8 text-sm font-bold text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-3 text-orange-400 font-bold text-sm pointer-events-none">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-darkNavy rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/20 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
          
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Future Value (Nominal)</p>
            <p className="text-3xl font-bold text-white">{fmt(safe(fv))}</p>
          </div>

          <div className="mt-4 border-t border-slate-700 pt-4 space-y-0">
            <ResultRow label="Principal Invested" value={fmt(principal)} dark />
            <ResultRow label="Estimated Returns" value={fmt(safe(returns))} dark />
            
            {/* Inflation-adjusted separator */}
            {inflation > 0 && (
              <>
                <div className="flex items-center gap-2 py-2.5">
                  <div className="flex-1 border-t border-slate-600" />
                  <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider shrink-0">After Inflation ({inflation}%)</span>
                  <div className="flex-1 border-t border-slate-600" />
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-orange-300 font-medium">Purchasing Power</span>
                  <span className="text-sm font-bold text-orange-300">{fmt(safe(realValue))}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-400 font-medium">Inflation Erosion</span>
                  <span className="text-xs font-bold text-red-400">-{fmt(safe(inflationErosion))}</span>
                </div>
              </>
            )}

            <div className="flex justify-between items-center pt-2.5">
              <span className="text-xs text-gray-300 font-medium">Total Gain</span>
              <span className="text-sm font-bold text-green-400">{principal > 0 ? ((returns / principal) * 100).toFixed(1) : 0}%</span>
            </div>
          </div>

          {/* Stacked bars */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Principal</span>
              <span>Returns</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex">
              <div className="bg-green-400 h-full rounded-full transition-all duration-500" style={{ width: `${safe(principal / fv) * 100}%` }} />
              <div className="bg-emerald-300 h-full flex-1" />
            </div>
            
            {inflation > 0 && (
              <>
                <div className="flex justify-between text-xs text-gray-400 mb-1 mt-3">
                  <span>Real Value</span>
                  <span>Inflation Loss</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex">
                  <div
                    className="bg-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${safe(realValue / fv) * 100}%` }}
                  />
                  <div className="bg-red-400 h-full flex-1" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Retirement Corpus Calculator
// ─────────────────────────────────────────────────────────────────────────────
const RetirementCalculator = () => {
  const [currentAge, setCurrentAge] = useState(30);
  const [retireAge, setRetireAge] = useState(60);
  const [lifeExpectancy, setLifeExpectancy] = useState(85);
  const [expenses, setExpenses] = useState(50000);
  const [savings, setSavings] = useState(500000);
  const [preReturn, setPreReturn] = useState(12);
  const [postReturn, setPostReturn] = useState(8);
  const [inflation, setInflation] = useState(6);
  const [adjustInflation, setAdjustInflation] = useState(true);

  const yearsToRetire = Math.max(1, retireAge - currentAge);
  const yearsInRetirement = Math.max(1, lifeExpectancy - retireAge);
  
  const inflationRate = adjustInflation ? inflation : 0;
  
  // 1. Inflated monthly expenses at retirement
  const monthlyExpenseAtRetire = expenses * Math.pow(1 + inflationRate / 100, yearsToRetire);
  
  // 2. Calculate retirement corpus needed (backward simulation)
  const computeCorpus = () => {
    const rPostMonthly = postReturn / 100 / 12;
    const totalMonths = yearsInRetirement * 12;
    let balance = 0;
    
    // Work backwards from last month of life expectancy to start of retirement
    for (let month = totalMonths; month >= 1; month--) {
      const yearIndex = Math.floor((month - 1) / 12);
      // Expenses inflate each year post-retirement
      const expenseThisMonth = monthlyExpenseAtRetire * Math.pow(1 + inflationRate / 100, yearIndex);
      
      balance = balance / (1 + rPostMonthly) + expenseThisMonth;
    }
    return balance;
  };
  
  const targetCorpus = computeCorpus();
  
  // 3. Growth of existing savings until retirement
  const preReturnMonthly = preReturn / 100 / 12;
  const preRetireMonths = yearsToRetire * 12;
  const fvExistingSavings = savings * Math.pow(1 + preReturnMonthly, preRetireMonths);
  
  // 4. Remaining corpus to build and required monthly SIP
  const additionalCorpusNeeded = Math.max(0, targetCorpus - fvExistingSavings);
  
  let requiredSIP = 0;
  if (additionalCorpusNeeded > 0) {
    const rateFactor = Math.pow(1 + preReturnMonthly, preRetireMonths) - 1;
    if (rateFactor > 0) {
      requiredSIP = (additionalCorpusNeeded * preReturnMonthly) / (rateFactor * (1 + preReturnMonthly));
    } else {
      requiredSIP = additionalCorpusNeeded / preRetireMonths;
    }
  }

  const safe = (n) => (isNaN(n) || !isFinite(n) ? 0 : n);

  return (
    <div className="bg-white rounded-2xl border border-borderLight shadow-sm">
      <div className="p-6 border-b border-borderLight flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
          <Palmtree size={20} />
        </div>
        <div>
          <h3 className="font-bold text-darkNavy">Retirement Corpus Calculator</h3>
          <p className="text-xs text-textMuted">Estimate the corpus required for your golden years with inflation protection</p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <CalcInput label="Current Age" value={currentAge} onChange={v => setCurrentAge(+v)} suffix="Yrs" min="1" />
            <CalcInput label="Retirement Age" value={retireAge} onChange={v => setRetireAge(+v)} suffix="Yrs" min={currentAge + 1} />
            <CalcInput label="Life Expectancy" value={lifeExpectancy} onChange={v => setLifeExpectancy(+v)} suffix="Yrs" min={retireAge + 1} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CalcInput label="Current Monthly Expense" value={expenses} onChange={v => setExpenses(+v)} prefix="₹" min="100" />
            <CalcInput label="Existing Savings" value={savings} onChange={v => setSavings(+v)} prefix="₹" min="0" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <CalcInput label="Pre-Retire Return" value={preReturn} onChange={v => setPreReturn(+v)} suffix="%" min="0" step="0.1" />
            <CalcInput label="Post-Retire Return" value={postReturn} onChange={v => setPostReturn(+v)} suffix="%" min="0" step="0.1" />
            <div>
              <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1">
                Inflation Rate
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  disabled={!adjustInflation}
                  value={inflation}
                  min="0"
                  step="0.5"
                  onChange={e => setInflation(+e.target.value)}
                  onWheel={e => e.target.blur()}
                  className={`w-full border rounded-xl py-2.5 pl-4 pr-8 text-sm font-bold transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${adjustInflation ? 'bg-orange-50 border-orange-200 text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400' : 'bg-gray-100 border-gray-200 text-gray-400'}`}
                />
                <span className={`absolute right-3 font-bold text-sm pointer-events-none ${adjustInflation ? 'text-orange-400' : 'text-gray-300'}`}>%</span>
              </div>
            </div>
          </div>

          {/* Inflation Toggle */}
          <div className="flex items-center gap-2.5 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
            <input
              type="checkbox"
              id="adjustInflation"
              checked={adjustInflation}
              onChange={e => setAdjustInflation(e.target.checked)}
              className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="adjustInflation" className="text-xs font-bold text-darkNavy cursor-pointer select-none">
              Adjust Expenses & Returns for Inflation
            </label>
          </div>
        </div>

        {/* Results */}
        <div className="bg-darkNavy rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />

          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Target Retirement Corpus</p>
            <p className="text-3xl font-bold text-white">{fmt(safe(targetCorpus))}</p>
          </div>

          <div className="mt-4 border-t border-slate-700 pt-4 space-y-0">
            <ResultRow 
              label={`Monthly Expense at Retire${adjustInflation ? ' (Inflated)' : ''}`} 
              value={fmt(safe(monthlyExpenseAtRetire))} 
              dark 
            />
            <ResultRow 
              label="FV of Existing Savings" 
              value={fmt(safe(fvExistingSavings))} 
              dark 
            />
            <ResultRow 
              label="Additional Corpus Needed" 
              value={fmt(safe(additionalCorpusNeeded))} 
              dark 
            />

            <div className="flex justify-between items-center pt-2.5 border-t border-slate-700 mt-2.5">
              <span className="text-xs text-gray-300 font-medium">Required Monthly Savings (SIP)</span>
              <span className={`text-sm font-bold ${additionalCorpusNeeded > 0 ? 'text-purple-400' : 'text-green-400'}`}>
                {additionalCorpusNeeded > 0 ? fmt(safe(requiredSIP)) : '₹0.00 (Fully Funded!)'}
              </span>
            </div>
          </div>

          {/* Stacked bar representing savings vs additional needed */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>FV Existing Savings</span>
              <span>Additional Needed</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex">
              <div 
                className="bg-green-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, safe(fvExistingSavings / targetCorpus) * 100)}%` }}
              />
              <div className="bg-purple-400 h-full flex-1" />
            </div>
            {adjustInflation && (
              <div className="text-[10px] text-orange-300 font-semibold mt-2 text-center">
                *Adjusted for {inflation}% inflation over {yearsToRetire} years.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
const CalculatorsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [userInitials, setUserInitials] = useState('U');
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.name) {
          const nameParts = parsed.name.trim().split(/\s+/);
          const initials = nameParts.map(p => p[0]).join('').substring(0, 2).toUpperCase();
          setUserInitials(initials || 'U');
        }
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileDropdownOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="min-h-screen bg-background flex text-textDark font-sans">
      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-borderLight flex flex-col z-30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center gap-3 px-6 py-6 border-b border-borderLight h-16 box-border cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 rounded bg-darkNavy flex items-center justify-center relative overflow-hidden">
            <span className="text-primary font-bold text-lg z-10">₹</span>
          </div>
          <div className="flex flex-col">
            <span className="text-primary text-[10px] font-bold leading-tight tracking-wider uppercase">Finance</span>
            <span className="text-darkNavy font-bold leading-tight">FOX</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
          <div className="mb-8">
            <h4 className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-3 px-2">Main</h4>
            <div className="space-y-1">
              <SidebarItem dotColor="bg-gray-200" label="Overview" onClick={() => navigate('/dashboard')} />
              <SidebarItem dotColor="bg-gray-200" label="Expenses" onClick={() => navigate('/expenses')} />
              <SidebarItem dotColor="bg-gray-200" label="Budget" onClick={() => navigate('/budget')} />
              <SidebarItem dotColor="bg-gray-200" label="Stocks" onClick={() => navigate('/stocks')} />
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-3 px-2">Tools</h4>
            <div className="space-y-1">
              <SidebarItem dotColor="bg-primary" label="Calculators" active onClick={() => navigate('/calculators')} />
              <SidebarItem dotColor="bg-gray-200" label="EMI Tracker" onClick={() => navigate('/emitracker')} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-borderLight flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-textMuted" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <List size={24} />
            </button>
            <h1 className="text-lg text-textMuted font-medium border-l border-borderLight pl-4 ml-2">Calculators</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="px-4 py-1.5 rounded-full border border-borderLight text-sm font-medium text-textDark hover:bg-gray-50 flex items-center gap-2 tabular-nums">
              <span>{now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span className="text-primary font-bold">{now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
            </button>
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm hover:bg-orange-600 transition-colors cursor-pointer"
              >
                {userInitials}
              </button>
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-borderLight rounded-xl shadow-xl py-1.5 z-50 animate-fadeIn">
                  <button className="w-full text-left px-4 py-2.5 text-xs font-semibold text-darkNavy hover:bg-slate-50 transition-colors" onClick={() => setProfileDropdownOpen(false)}>
                    Profile Settings
                  </button>
                  <div className="mx-3 my-1 border-t border-gray-100" />
                  <button className="w-full text-left px-4 py-2.5 text-xs font-semibold text-primary hover:bg-orange-50 transition-colors" onClick={handleSignOut}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 overflow-y-auto flex-1 w-full">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1">Financial Calculators</h2>
            <p className="text-textMuted text-sm">Powerful tools to plan your EMIs, investments, and budget smarter.</p>
          </div>

          <div className="space-y-8">
            <EMICalculator />
            <SIPCalculator />
            <LumpsumCalculator />
            <RetirementCalculator />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalculatorsPage;
