import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AIAssistantDrawer from '../components/AIAssistantDrawer';
import {
  Home,
  List,
  PieChart,
  TrendingUp,
  Calculator,
  FileText,
  User,
  Settings,
  Bell,
  Plus,
  Coffee,
  Home as HomeIcon,
  ShoppingCart,
  Car,
  Zap,
  MoreHorizontal,
  ChevronDown,
  IndianRupee,
  Heart,
  Briefcase,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  CheckCircle,
  Calendar
} from 'lucide-react';

const STOCKS_POOL = [
  { symbol: 'MARUTI', name: 'Maruti Suzuki India', price: 11200, sector: 'Automotive' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', price: 9600, sector: 'Telecom' },
  { symbol: 'DRREDDY', name: 'Dr. Reddy\'s Laboratories', price: 6100, sector: 'Healthcare' },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals', price: 5900, sector: 'Healthcare' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3600, sector: 'Technology' },
  { symbol: 'LT', name: 'Larsen & Toubro Limited', price: 3450, sector: 'Telecom' },
  { symbol: 'TITAN', name: 'Titan Company', price: 3200, sector: 'Consumer Goods' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Limited', price: 2850, sector: 'Consumer Goods' },
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2450, sector: 'Technology' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2350, sector: 'Consumer Goods' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra', price: 1950, sector: 'Automotive' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1780, sector: 'Finance' },
  { symbol: 'ADANIGREEN', name: 'Adani Green Energy', price: 1650, sector: 'Energy' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', price: 1550, sector: 'Finance' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', price: 1520, sector: 'Healthcare' },
  { symbol: 'INFY', name: 'Infosys Limited', price: 1450, sector: 'Technology' },
  { symbol: 'CIPLA', name: 'Cipla Limited', price: 1350, sector: 'Healthcare' },
  { symbol: 'BHARTIAIRTEL', name: 'Bharti Airtel Limited', price: 1150, sector: 'Telecom' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', price: 980, sector: 'Finance' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Limited', price: 920, sector: 'Automotive' },
  { symbol: 'SBIN', name: 'State Bank of India', price: 610, sector: 'Finance' },
  { symbol: 'COALINDIA', name: 'Coal India Limited', price: 440, sector: 'Telecom' },
  { symbol: 'WIPRO', name: 'Wipro Limited', price: 430, sector: 'Technology' },
  { symbol: 'ITC', name: 'ITC Limited', price: 420, sector: 'Consumer Goods' },
  { symbol: 'TATAPOWER', name: 'Tata Power Company', price: 380, sector: 'Energy' },
  { symbol: 'NTPC', name: 'NTPC Limited', price: 320, sector: 'Energy' },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', price: 230, sector: 'Energy' }
];

const SidebarItem = ({ icon: Icon, label, active, dotColor, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${active ? 'bg-primaryLight text-primary' : 'text-textMuted hover:bg-gray-100'}`}>
    <div className="relative">
      {Icon && <Icon size={18} className={active ? 'text-primary' : 'text-textMuted'} />}
      {dotColor && !Icon && <div className={`w-2.5 h-2.5 rounded-sm ${dotColor}`} />}
    </div>
    <span>{label}</span>
  </button>
);

const Sparkline = ({ color, points }) => (
  <svg viewBox="0 0 100 30" className="w-full h-8 mt-4 overflow-visible">
    <polyline
      fill="none"
      stroke={color}
      strokeWidth="2"
      points={points}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx={points.split(' ').pop().split(',')[0]} cy={points.split(' ').pop().split(',')[1]} r="3" fill={color} />
  </svg>
);

const StatCard = ({ title, amount, subtitle, subValue, trendType, isDark, sparklinePoints }) => {
  const isUp = trendType === 'success';
  const isWarning = trendType === 'warning';
  const isDanger = trendType === 'danger';

  let badgeColor = 'bg-successLight text-success';
  let sparkColor = '#22c55e';

  if (isDanger) {
    badgeColor = 'bg-dangerLight text-danger';
    sparkColor = '#ef4444';
  } else if (isWarning) {
    badgeColor = 'bg-warningLight text-warning';
    sparkColor = '#eab308';
  }

  if (isDark) {
    badgeColor = 'bg-success/20 text-success';
  }

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${isDark ? 'bg-darkNavy text-white border-darkNavy shadow-lg' : 'bg-white border-borderLight shadow-sm'} relative overflow-hidden flex flex-col justify-between`}>
      {isDark && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
      )}
      <div>
        <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-textMuted'}`}>{title}</h3>
        <div className="text-3xl font-bold mb-3 tracking-tight">{amount}</div>
        <div className="flex items-center gap-2 text-xs">
          {subValue && (
            <span className={`px-2 py-0.5 rounded flex items-center font-bold ${badgeColor}`}>
              {subValue}
            </span>
          )}
          <span className={isDark ? 'text-gray-400' : 'text-textMuted'}>{subtitle}</span>
        </div>
      </div>
      <Sparkline color={sparkColor} points={sparklinePoints} />
    </div>
  );
};

const iconComponents = {
  Home: HomeIcon,
  Heart: Heart,
  Briefcase: Briefcase,
  TrendingUp: TrendingUp,
  IndianRupee: IndianRupee,
  AlertCircle: AlertCircle,
  ShoppingCart: ShoppingCart,
  Car: Car,
  Zap: Zap,
  Coffee: Coffee
};

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [userName, setUserName] = useState('User');
  const [userInitials, setUserInitials] = useState('U');
  const profileRef = useRef(null);
  const templateDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Dynamic state loaded from backend / local storage
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [activeTemplateId, setActiveTemplateId] = useState(() => {
    const saved = localStorage.getItem('activeTemplateId');
    return saved ? JSON.parse(saved) : '';
  });
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [emis, setEmis] = useState([]);
  const [stocks, setStocks] = useState([]);

  // Interactive Financial Calculator States
  const [calcType, setCalcType] = useState('EMI');
  const [calcPrincipal, setCalcPrincipal] = useState(500000);
  const [calcRate, setCalcRate] = useState(8.5);
  const [calcTenure, setCalcTenure] = useState(10); // Years


  // Fetch all templates, expenses, and EMIs on page mount
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      
      // 1. Fetch templates
      try {
        const response = await fetch('http://localhost:5000/api/templates', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setSavedTemplates(data);
          localStorage.setItem('budgetTemplates', JSON.stringify(data));
          
          const savedTplId = localStorage.getItem('activeTemplateId');
          if (!savedTplId && data.length > 0) {
            setActiveTemplateId(data[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to fetch templates:', e);
        const saved = localStorage.getItem('budgetTemplates');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setSavedTemplates(parsed);
            const savedTplId = localStorage.getItem('activeTemplateId');
            if (!savedTplId && parsed.length > 0) {
              setActiveTemplateId(parsed[0].id);
            }
          } catch (err) {}
        }
      }

      // 2. Fetch expenses
      try {
        const response = await fetch('http://localhost:5000/api/expenses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setExpenses(data);
          localStorage.setItem('expenseLogs', JSON.stringify(data));
        }
      } catch (e) {
        console.error('Failed to fetch expenses:', e);
        const saved = localStorage.getItem('expenseLogs');
        if (saved) {
          try { setExpenses(JSON.parse(saved)); } catch (err) {}
        }
      }

      // 3. Fetch EMIs
      try {
        const response = await fetch('http://localhost:5000/api/emis', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setEmis(data);
          localStorage.setItem('emis', JSON.stringify(data));
        }
      } catch (e) {
        console.error('Failed to fetch EMIs:', e);
        const saved = localStorage.getItem('emis');
        if (saved) {
          try { setEmis(JSON.parse(saved)); } catch (err) {}
        }
      }
    };

    fetchData();
  }, []);

  // Sync activeTemplateId to localStorage
  useEffect(() => {
    if (activeTemplateId !== '') {
      localStorage.setItem('activeTemplateId', JSON.stringify(activeTemplateId));
    }
  }, [activeTemplateId]);

  // Fetch stocks when activeTemplateId changes
  useEffect(() => {
    const fetchStocks = async () => {
      if (!activeTemplateId) return;
      try {
        const response = await fetch(`http://localhost:5000/api/stocks/${activeTemplateId}`);
        if (response.ok) {
          const data = await response.json();
          setStocks(data);
        }
      } catch (e) {
        console.error('Failed to fetch stocks:', e);
      }
    };
    fetchStocks();
  }, [activeTemplateId]);

  // Dynamic calculations based on selected active template and real expenses/EMIs
  const activeTemplate = useMemo(() => {
    return savedTemplates.find(t => String(t.id) === String(activeTemplateId)) || savedTemplates[0];
  }, [savedTemplates, activeTemplateId]);

  const monthlyIncome = useMemo(() => {
    return activeTemplate?.income || 60000;
  }, [activeTemplate]);

  const expensesForActiveTemplate = useMemo(() => {
    return expenses.filter(e => String(e.templateId) === String(activeTemplateId));
  }, [expenses, activeTemplateId]);

  const totalExpenses = useMemo(() => {
    return expensesForActiveTemplate.reduce((sum, e) => sum + e.amount, 0);
  }, [expensesForActiveTemplate]);

  const activeEMIsList = useMemo(() => {
    return emis.filter(e => Number(e.paidTenure) < Number(e.totalTenure));
  }, [emis]);

  const totalEMIs = useMemo(() => {
    return activeEMIsList.reduce((sum, e) => sum + Number(e.amount), 0);
  }, [activeEMIsList]);

  const netSurplus = useMemo(() => {
    return monthlyIncome - totalExpenses - totalEMIs;
  }, [monthlyIncome, totalExpenses, totalEMIs]);

  const savingsRate = useMemo(() => {
    return monthlyIncome > 0 ? (netSurplus / monthlyIncome) * 100 : 0;
  }, [netSurplus, monthlyIncome]);

  // Sparkline point generator based on calculations
  const netSurplusSparkPoints = useMemo(() => {
    return netSurplus >= 0 
      ? "0,25 20,20 40,22 60,15 80,18 100,10" 
      : "0,10 20,15 40,12 60,20 80,22 100,28";
  }, [netSurplus]);

  // Sort and slice top 5 recent transactions
  const recentExpenses = useMemo(() => {
    return [...expensesForActiveTemplate]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [expensesForActiveTemplate]);

  const getCategoryDetails = (catId) => {
    if (!activeTemplate || !activeTemplate.categories) {
      return { name: 'discretionary', color: '#f97316', icon: 'IndianRupee' };
    }
    const cat = activeTemplate.categories.find(c => Number(c.id) === Number(catId));
    return cat || { name: 'discretionary', color: '#f97316', icon: 'IndianRupee' };
  };

  // Helper for formatting transaction timestamps
  const formatExpenseDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${timeStr}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${timeStr}`;
    } else {
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) + `, ` + timeStr;
    }
  };

  // Dynamic Financial Calculations
  const calcResults = useMemo(() => {
    const P = calcPrincipal;
    const R = calcRate;
    const N = calcTenure;

    if (calcType === 'EMI') {
      const r = R / 12 / 100;
      const n = N * 12;
      const emi = r > 0 ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n;
      const totalPayable = emi * n;
      const totalInterest = totalPayable - P;

      return {
        monthly: emi,
        interest: totalInterest,
        total: totalPayable,
        labels: { monthly: 'Monthly EMI', interest: 'Total Interest', total: 'Total Payable' }
      };
    } else if (calcType === 'SIP') {
      const PMT = P;
      const i = R / 12 / 100;
      const n = N * 12;
      const fv = i > 0 ? PMT * ((Math.pow(1 + i, n) - 1) / i) * (1 + i) : PMT * n;
      const invested = PMT * n;
      const gain = fv - invested;

      return {
        monthly: PMT,
        interest: gain,
        total: fv,
        labels: { monthly: 'Monthly SIP', interest: 'Wealth Gain', total: 'Expected Amount' }
      };
    } else {
      const r = R / 100;
      const fv = P * Math.pow(1 + r, N);
      const gain = fv - P;

      return {
        monthly: P,
        interest: gain,
        total: fv,
        labels: { monthly: 'Invested Amount', interest: 'Wealth Gain', total: 'Expected Value' }
      };
    }
  }, [calcType, calcPrincipal, calcRate, calcTenure]);


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.name) {
          setUserName(parsed.name.split(' ')[0]);
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
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (templateDropdownRef.current && !templateDropdownRef.current.contains(e.target)) {
        setTemplateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-background flex text-textDark font-sans">
      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-borderLight flex flex-col z-30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center gap-3 px-6 py-6 border-b border-borderLight h-16 box-border cursor-pointer" onClick={() => navigate('/dashboard')}>
          <img src="/logo.png" alt="Finance Fox Logo" className="w-8 h-8 object-contain" />
          <div className="flex flex-col">
            <span className="text-primary text-[10px] font-bold leading-tight tracking-wider uppercase">Finance</span>
            <span className="text-darkNavy font-bold leading-tight">FOX</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
          <div className="mb-8">
            <h4 className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-3 px-2">Main</h4>
            <div className="space-y-1">
              <SidebarItem dotColor="bg-primary" label="Overview" active icon={Home} />
              <SidebarItem dotColor="bg-gray-200" label="Expenses" onClick={() => navigate('/expenses')} icon={List} />
              <SidebarItem dotColor="bg-gray-200" label="Expense History" onClick={() => navigate('/expense-history')} icon={FileText} />
              <SidebarItem dotColor="bg-gray-200" label="Budget" onClick={() => navigate('/budget')} icon={PieChart} />
              <SidebarItem dotColor="bg-gray-200" label="Stocks" onClick={() => navigate('/stocks')} icon={TrendingUp} />
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-3 px-2">Tools</h4>
            <div className="space-y-1">
              <SidebarItem dotColor="bg-gray-200" label="Calculators" onClick={() => navigate('/calculators')} icon={Calculator} />
              <SidebarItem dotColor="bg-gray-200" label="EMI Tracker" onClick={() => navigate('/emitracker')} icon={AlertCircle} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-borderLight flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-textMuted" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <List size={24} />
            </button>
            <h1 className="text-lg text-textMuted font-medium border-l border-borderLight pl-4 ml-2">Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Active Template Selector */}
            {savedTemplates.length > 0 && (
              <div className="relative flex items-center bg-white border border-borderLight hover:border-primary/40 transition-all rounded-xl pl-3 pr-8 py-1 shadow-sm group" ref={templateDropdownRef}>
                <div className="flex flex-col min-w-[100px] max-w-[150px] pointer-events-none">
                  <span className="text-[8px] uppercase font-bold text-textMuted tracking-wider leading-none mb-0.5">Selected Template</span>
                  <span className="font-extrabold text-darkNavy text-xs truncate">
                    {activeTemplate?.name || 'Loading...'}
                  </span>
                </div>
                
                <button 
                  type="button"
                  onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
                  className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-pointer text-textMuted hover:text-primary transition-colors focus:outline-none"
                  aria-label="Toggle active template dropdown"
                >
                  <ChevronDown size={14} className={`transition-transform duration-200 ${templateDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
                </button>

                {templateDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-borderLight rounded-xl shadow-xl py-1 z-50 animate-fadeIn">
                    {savedTemplates.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setActiveTemplateId(t.id);
                          setTemplateDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-semibold transition-colors flex items-center justify-between ${
                          String(t.id) === String(activeTemplateId) 
                            ? 'bg-primaryLight text-primary' 
                            : 'text-darkNavy hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{t.name}</span>
                        {String(t.id) === String(activeTemplateId) && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button className="px-4 py-1.5 rounded-full border border-borderLight text-sm font-medium text-textDark hover:bg-gray-50 flex items-center gap-2 tabular-nums">
              <Calendar size={14} className="shrink-0" />
              <span>{now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span className="text-primary font-bold">{now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
            </button>
            
            <div className="relative" ref={profileRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setProfileDropdownOpen(!profileDropdownOpen); }}
                className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm hover:bg-orange-600 transition-colors cursor-pointer"
              >
                {userInitials}
              </button>
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-44 bg-white border border-borderLight rounded-xl shadow-xl py-1.5 z-50 animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-darkNavy hover:bg-slate-50 transition-colors flex items-center gap-2"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <span>Profile Settings</span>
                  </button>
                  <div className="mx-3 my-1 border-t border-gray-155 border-gray-150" />
                  <button
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-primary hover:bg-orange-50 transition-colors flex items-center gap-2"
                    onClick={handleSignOut}
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 overflow-y-auto flex-1 w-full">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                {now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'}, {userName} 👋
              </h2>
              <p className="text-textMuted text-sm">
                {now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} — Active template: <strong className="text-darkNavy">{activeTemplate?.name || 'Default'}</strong>
              </p>
            </div>
          </div>

          {/* Top Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Net Surplus"
              amount={`₹${netSurplus.toLocaleString('en-IN')}`}
              subValue={netSurplus >= 0 ? "↑ Active Surplus" : "↓ Deficit"}
              subtitle="Current month surplus"
              trendType={netSurplus >= 0 ? "success" : "danger"}
              isDark={true}
              sparklinePoints={netSurplusSparkPoints}
            />
            <StatCard
              title="Monthly Income"
              amount={`₹${monthlyIncome.toLocaleString('en-IN')}`}
              subValue="Income source"
              subtitle="From active template"
              trendType="success"
              sparklinePoints="0,20 30,20 30,10 100,10"
            />
            <StatCard
              title="Total Expenses"
              amount={`₹${totalExpenses.toLocaleString('en-IN')}`}
              subValue={`${monthlyIncome > 0 ? ((totalExpenses / monthlyIncome) * 100).toFixed(1) : 0}% used`}
              subtitle="Template logs spent"
              trendType={totalExpenses > monthlyIncome ? "danger" : "warning"}
              sparklinePoints="0,15 20,18 40,12 60,20 80,15 100,25"
            />
            <StatCard
              title="EMI Commitments"
              amount={`₹${totalEMIs.toLocaleString('en-IN')}`}
              subValue={`${monthlyIncome > 0 ? ((totalEMIs / monthlyIncome) * 100).toFixed(1) : 0}% load`}
              subtitle={`${activeEMIsList.length} active EMIs`}
              trendType={totalEMIs / monthlyIncome > 0.35 ? "danger" : "success"}
              sparklinePoints="0,25 20,22 40,25 60,18 80,15 100,15"
            />
          </div>

          {/* Middle Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Dynamic Budget Overview (Requested Feature) */}
            <div className="bg-white p-5 rounded-2xl border border-borderLight shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-darkNavy">Budget Overview</h3>
                  <button onClick={() => navigate('/budget')} className="text-xs font-bold text-blue-500 hover:underline">
                    Edit Split
                  </button>
                </div>

                <div className="flex gap-1.5 mb-6 overflow-x-auto no-scrollbar pb-1">
                  {(activeTemplate?.categories || []).map((cat) => (
                    <span
                      key={cat.id}
                      className="px-2.5 py-0.5 text-[10px] font-bold rounded-full whitespace-nowrap"
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                    >
                      {cat.name} {cat.percentage}%
                    </span>
                  ))}
                  {(!activeTemplate?.categories || activeTemplate.categories.length === 0) && (
                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 text-textMuted rounded-full">
                      No categories
                    </span>
                  )}
                </div>

                <div className="space-y-4 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
                  {(activeTemplate?.categories || []).map((cat) => {
                    const catBudget = (monthlyIncome * (cat.percentage || 0)) / 100;
                    const catSpent = expensesForActiveTemplate.filter(e => Number(e.categoryId) === Number(cat.id)).reduce((sum, e) => sum + e.amount, 0);
                    const catRemaining = catBudget - catSpent;
                    const percentUsed = catBudget > 0 ? (catSpent / catBudget) * 100 : 0;
                    const isOverBudget = catSpent > catBudget;

                    return (
                      <div key={cat.id} className="group">
                        <div className="flex justify-between text-xs mb-1 font-bold">
                          <span className="flex items-center gap-1.5 text-darkNavy">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: cat.color }} />
                            <span>{cat.name}</span>
                          </span>
                          <span className="font-mono font-black" style={{ color: isOverBudget ? '#ef4444' : percentUsed >= 90 ? '#eab308' : '#22c55e' }}>
                            {percentUsed.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-50 rounded-full h-1.5 mb-1 overflow-hidden border border-slate-100">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(percentUsed, 100)}%`, backgroundColor: cat.color }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-textMuted font-medium">
                          <span>₹{catSpent.toLocaleString('en-IN')} / ₹{catBudget.toLocaleString('en-IN')}</span>
                          {isOverBudget ? (
                            <span className="text-danger font-extrabold">Over by ₹{Math.abs(catRemaining).toLocaleString('en-IN')}</span>
                          ) : percentUsed >= 90 ? (
                            <span className="text-warning font-extrabold">Near limit</span>
                          ) : (
                            <span className="text-success font-extrabold">₹{catRemaining.toLocaleString('en-IN')} left</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {(!activeTemplate?.categories || activeTemplate.categories.length === 0) && (
                    <div className="text-center py-8 text-textMuted text-xs font-semibold bg-slate-50 border border-dashed rounded-xl p-4">
                      No categories found for this template. Navigate to the Budget tab to create some!
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-150 flex justify-between items-center text-xs">
                <span className="text-textMuted font-bold uppercase">Budget Status</span>
                {netSurplus >= 0 ? (
                  <span className="text-success font-extrabold flex items-center gap-1">
                    On Track <CheckCircle size={14} />
                  </span>
                ) : (
                  <span className="text-danger font-extrabold flex items-center gap-1 animate-pulse">
                    Overspent <AlertCircle size={14} />
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic Recent Transactions (Real Data Integration) */}
            <div className="bg-white p-5 rounded-2xl border border-borderLight shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-darkNavy">Recent Transactions</h3>
                <button onClick={() => navigate('/expense-history')} className="text-xs font-bold text-blue-500 hover:underline">
                  View All
                </button>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] no-scrollbar">
                {recentExpenses.map((expense) => {
                  const cat = getCategoryDetails(expense.categoryId);
                  const IconComp = iconComponents[cat.icon] || IndianRupee;

                  return (
                    <div key={expense.id} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-xl px-2 transition-all group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: cat.color }}
                        >
                          <IconComp size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-darkNavy truncate">{expense.name}</div>
                          <div className="text-[10px] text-textMuted font-medium flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                            <span className="truncate">{cat.name} · {formatExpenseDate(expense.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="font-black text-xs text-danger shrink-0 font-mono pl-2">
                        -₹{expense.amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                })}

                {recentExpenses.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-14 text-textMuted text-xs font-semibold bg-slate-50 border border-dashed rounded-xl">
                    <IndianRupee size={28} className="text-slate-300 mb-2 animate-bounce" />
                    <span>No transactions recorded yet</span>
                    <button onClick={() => navigate('/expenses')} className="text-[10px] text-primary mt-2 uppercase font-extrabold tracking-wider hover:underline">
                      Log First Expense +
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Fox AI Wealth Insights */}
            <div className="bg-white p-5 rounded-2xl border border-borderLight shadow-sm flex flex-col justify-between h-[380px]">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-darkNavy flex items-center gap-1.5">
                    <Sparkles size={18} className="text-primary animate-pulse" />
                    Fox AI Wealth Insights
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-slate-55 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-textMuted uppercase font-bold tracking-wider block">Savings Surplus</span>
                      <span className="text-lg font-black text-darkNavy">₹{netSurplus.toLocaleString('en-IN')}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${netSurplus > 0 ? 'bg-emerald-55 text-emerald-600 bg-emerald-50' : 'bg-rose-55 text-rose-600 bg-rose-50'}`}>
                      {netSurplus > 0 ? 'Investable' : 'Deficit'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] text-textMuted uppercase font-bold tracking-wider block">Top Stocks for Your Budget</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(() => {
                        let affordableStocks = STOCKS_POOL.filter(stock => stock.price <= netSurplus);
                        if (affordableStocks.length === 0) {
                          affordableStocks = [...STOCKS_POOL].sort((a, b) => a.price - b.price);
                        } else {
                          affordableStocks.sort((a, b) => b.price - a.price);
                        }
                        return affordableStocks.slice(0, 3).map((stock, idx) => (
                          <div key={idx} className="bg-slate-55 bg-slate-50/50 border border-slate-100/50 p-2 rounded-xl text-center flex flex-col justify-between">
                            <span className="font-extrabold text-xs text-darkNavy block">{stock.symbol}</span>
                            <span className="font-mono text-[10px] text-emerald-600 font-bold block mt-1">₹{stock.price.toLocaleString('en-IN')}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  <div className="bg-primaryLight/15 p-2.5 rounded-xl border border-primaryLight/40 text-[10px] text-slate-700 font-medium leading-relaxed">
                    {netSurplus > 0 ? (
                      `Based on your surplus of ₹${netSurplus.toLocaleString('en-IN')}, you have investable capital! You can invest in high-value stocks like ${(() => {
                        let affordableStocks = STOCKS_POOL.filter(stock => stock.price <= netSurplus);
                        if (affordableStocks.length === 0) affordableStocks = [...STOCKS_POOL].sort((a, b) => a.price - b.price);
                        else affordableStocks.sort((a, b) => b.price - a.price);
                        return affordableStocks.slice(0, 3).map(s => s.symbol).join(', ');
                      })()} to grow your wealth.`
                    ) : (
                      "You currently do not have a savings surplus. Build up a surplus by lowering expenses or updating your budget template to start investing!"
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex-shrink-0">
                <p className="text-[8px] text-textMuted italic leading-tight text-center">
                  Investments in securities market are subject to market risks , read all documents carefully before investing
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interactive Financial Calculators (Redesigned with dynamic inputs) */}
            <div className="bg-white p-5 rounded-2xl border border-borderLight shadow-sm flex flex-col h-[420px] justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-darkNavy">Financial Calculators</h3>
                  <button 
                    onClick={() => navigate('/calculators')} 
                    className="text-xs font-bold text-blue-500 hover:underline"
                  >
                    Calculators
                  </button>
                </div>

                <div className="flex gap-1.5 mb-5 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  {['EMI', 'SIP', 'Lumpsum'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setCalcType(type);
                        if (type === 'EMI') {
                          setCalcPrincipal(500000);
                          setCalcRate(8.5);
                          setCalcTenure(10);
                        } else if (type === 'SIP') {
                          setCalcPrincipal(10000);
                          setCalcRate(12);
                          setCalcTenure(15);
                        } else {
                          setCalcPrincipal(100000);
                          setCalcRate(10);
                          setCalcTenure(5);
                        }
                      }}
                      className={`flex-1 text-center py-1.5 rounded-lg text-xs font-bold transition-all ${
                        calcType === type 
                          ? 'bg-primary text-white shadow-sm' 
                          : 'text-textMuted hover:text-darkNavy hover:bg-slate-100/50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-black text-textMuted uppercase mb-1">
                      <span>{calcType === 'EMI' ? 'Principal (₹)' : calcType === 'SIP' ? 'Monthly SIP (₹)' : 'Investment (₹)'}</span>
                      <span className="font-mono text-darkNavy text-xs font-black">
                        ₹{calcPrincipal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={calcType === 'EMI' ? 100000 : calcType === 'SIP' ? 500 : 5000}
                      max={calcType === 'EMI' ? 5000000 : calcType === 'SIP' ? 100000 : 2500000}
                      step={calcType === 'EMI' ? 50000 : calcType === 'SIP' ? 500 : 5000}
                      value={calcPrincipal}
                      onChange={(e) => setCalcPrincipal(Number(e.target.value))}
                      className="w-full accent-primary h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[10px] font-black text-textMuted uppercase mb-1">
                        <span>Rate (%)</span>
                        <span className="font-mono text-darkNavy text-[11px] font-black">{calcRate}%</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="30"
                        step="0.1"
                        value={calcRate}
                        onChange={(e) => setCalcRate(Number(e.target.value))}
                        className="w-full accent-primary h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-black text-textMuted uppercase mb-1">
                        <span>Tenure (Yrs)</span>
                        <span className="font-mono text-darkNavy text-[11px] font-black">{calcTenure} yrs</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max={calcType === 'EMI' ? 30 : 40}
                        step="1"
                        value={calcTenure}
                        onChange={(e) => setCalcTenure(Number(e.target.value))}
                        className="w-full accent-primary h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-darkNavy rounded-2xl p-4 flex justify-between text-white mt-auto shadow-inner relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-slate-900/10 pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-[9px] uppercase font-bold text-gray-400 mb-0.5">
                    {calcResults.labels.monthly}
                  </div>
                  <div className="font-black text-base font-mono">
                    ₹{Math.round(calcResults.monthly).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="relative z-10">
                  <div className="text-[9px] uppercase font-bold text-gray-400 mb-0.5">
                    {calcResults.labels.interest}
                  </div>
                  <div className="font-black text-base font-mono text-successLight">
                    ₹{Math.round(calcResults.interest).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="relative z-10 text-right">
                  <div className="text-[9px] uppercase font-bold text-gray-400 mb-0.5">
                    {calcResults.labels.total}
                  </div>
                  <div className="font-black text-base font-mono text-primaryLight">
                    ₹{Math.round(calcResults.total).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic EMI Tracker (Real Data Integration) */}
            <div className="bg-white p-5 rounded-2xl border border-borderLight shadow-sm flex flex-col h-[420px] justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-darkNavy">EMI Tracker</h3>
                  <span className="text-xs font-black text-primary bg-orange-50 border border-orange-100 px-3 py-1 rounded-full font-mono">
                    ₹{totalEMIs.toLocaleString('en-IN')}/mo total
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-textMuted uppercase">EMI Load on Income</span>
                  <span className={`text-base font-black font-mono ${totalEMIs / monthlyIncome > 0.35 ? 'text-danger' : 'text-primary'}`}>
                    {monthlyIncome > 0 ? ((totalEMIs / monthlyIncome) * 100).toFixed(0) : 0}%
                  </span>
                </div>

                <div className="space-y-4 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
                  {activeEMIsList.map((emi) => {
                    const progressPercent = (Number(emi.paidTenure) / Number(emi.totalTenure)) * 100;
                    const remainingMonths = Number(emi.totalTenure) - Number(emi.paidTenure);

                    return (
                      <div key={emi.id} className="border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <div className="font-bold text-xs text-darkNavy">{emi.name}</div>
                            <div className="text-[10px] text-textMuted font-semibold">
                              {emi.lender || 'Financial Bank'} · Due Day {emi.dueDate}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-xs text-primary font-mono">
                              ₹{Number(emi.amount).toLocaleString('en-IN')}
                            </div>
                            <div className="text-[9px] text-textMuted font-bold uppercase">per month</div>
                          </div>
                        </div>
                        <div className="w-full bg-slate-50 rounded-full h-1.5 mb-1 overflow-hidden border border-slate-100">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-textMuted font-bold">
                          <span>{progressPercent.toFixed(0)}% paid</span>
                          <span>{remainingMonths} months remaining</span>
                        </div>
                      </div>
                    );
                  })}

                  {activeEMIsList.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-textMuted text-xs font-semibold bg-emerald-50/50 border border-emerald-100 rounded-xl">
                      <span className="text-2xl mb-1 select-none">🎉</span>
                      <span className="text-emerald-800 font-extrabold">100% Debt Free!</span>
                      <p className="text-[10px] text-emerald-700/80 leading-normal mt-1 max-w-[200px]">
                        You currently have no outstanding loan liabilities or active EMIs. Outstanding financial management!
                      </p>
                      <button onClick={() => navigate('/emitracker')} className="text-[9px] text-emerald-800 uppercase font-black tracking-wider hover:underline mt-3">
                        EMI Tracker ↗
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-center">
                <button onClick={() => navigate('/emitracker')} className="text-[10px] text-primary uppercase font-extrabold tracking-wider hover:underline">
                  Manage Liabilities ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AIAssistantDrawer />
    </div>
  );
};

export default Dashboard;
