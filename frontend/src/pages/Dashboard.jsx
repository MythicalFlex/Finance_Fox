import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  MoreHorizontal
} from 'lucide-react';

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
    <div className={`p-5 rounded-2xl border ${isDark ? 'bg-darkNavy text-white border-darkNavy shadow-lg' : 'bg-white border-borderLight shadow-sm'} relative overflow-hidden flex flex-col justify-between`}>
      <div>
        <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-textMuted'}`}>{title}</h3>
        <div className="text-3xl font-bold mb-3">{amount}</div>
        <div className="flex items-center gap-2 text-xs">
          {subValue && (
            <span className={`px-2 py-0.5 rounded flex items-center font-medium ${badgeColor}`}>
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

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [userName, setUserName] = useState('User');
  const [userInitials, setUserInitials] = useState('U');
  const profileRef = useRef(null);
  const navigate = useNavigate();

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
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="min-h-screen bg-background flex text-textDark font-sans">
      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-borderLight flex flex-col z-30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center gap-3 px-6 py-6 border-b border-borderLight h-16 box-border">
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
              <SidebarItem dotColor="bg-primary" label="Overview" active />
              <SidebarItem dotColor="bg-gray-200" label="Expenses" onClick={() => navigate('/expenses')} />
              <SidebarItem dotColor="bg-gray-200" label="Budget" onClick={() => navigate('/budget')} />
              <SidebarItem dotColor="bg-gray-200" label="Stocks" onClick={() => navigate('/stocks')} />
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-3 px-2">Tools</h4>
            <div className="space-y-1">
              <SidebarItem dotColor="bg-gray-200" label="Calculators" onClick={() => navigate('/calculators')} />
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
            <h1 className="text-lg text-textMuted font-medium border-l border-borderLight pl-4 ml-2">Dashboard</h1>
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
                  <button
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-darkNavy hover:bg-slate-50 transition-colors flex items-center gap-2"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <span>Profile Settings</span>
                  </button>
                  <div className="mx-3 my-1 border-t border-gray-100" />
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

        <div className="p-6 md:p-8 overflow-y-auto">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'}, {userName} 👋
              </h2>
              <p className="text-textMuted text-sm">
                {now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} — {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} — Your finances look healthy overall
              </p>
            </div>

          </div>

          {/* Top Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Net Balance"
              amount="₹14,200"
              subValue="↑ 8.2%"
              subtitle="vs Mar"
              trendType="success"
              isDark={true}
              sparklinePoints="0,25 20,20 40,22 60,15 80,18 100,10"
            />
            <StatCard
              title="Total Income"
              amount="₹60,000"
              subValue="Salary"
              subtitle="Apr 1"
              trendType="success"
              sparklinePoints="0,20 30,20 30,10 100,10"
            />
            <StatCard
              title="Total Expenses"
              amount="₹45,800"
              subValue="↑ 3.4%"
              subtitle="vs Mar"
              trendType="danger"
              sparklinePoints="0,15 20,18 40,12 60,20 80,15 100,25"
            />
            <StatCard
              title="Savings"
              amount="₹12,000"
              subValue="20% rate"
              subtitle="on target"
              trendType="warning"
              sparklinePoints="0,25 20,22 40,25 60,18 80,15 100,15"
            />
          </div>

          {/* Middle Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

            {/* Budget Overview */}
            <div className="bg-white p-5 rounded-2xl border border-borderLight shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Budget overview</h3>
                <button className="text-sm text-blue-500 hover:underline">Edit split</button>
              </div>

              <div className="flex gap-2 mb-6">
                <span className="px-3 py-1 bg-orange-100 text-primary text-xs font-semibold rounded-full">Needs 50%</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">Wants 30%</span>
                <span className="px-3 py-1 bg-green-100 text-success text-xs font-semibold rounded-full">Savings 20%</span>
              </div>

              <div className="flex justify-end gap-6 mb-6">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end mb-1">
                    <div className="w-2 h-2 bg-primary rounded-sm"></div>
                    <span className="text-xs text-textMuted">Needs</span>
                  </div>
                  <div className="text-sm font-bold">₹30,000</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end mb-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
                    <span className="text-xs text-textMuted">Wants</span>
                  </div>
                  <div className="text-sm font-bold">₹18,000</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end mb-1">
                    <div className="w-2 h-2 bg-success rounded-sm"></div>
                    <span className="text-xs text-textMuted">Savings</span>
                  </div>
                  <div className="text-sm font-bold">₹12,000</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1 font-bold">
                    <span>Needs</span>
                    <span className="text-danger">95%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                    <div className="bg-danger h-1.5 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-textMuted">
                    <span>₹28,400 / ₹30,000</span>
                    <span className="text-danger">↑ Near limit</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1 font-bold">
                    <span>Wants</span>
                    <span className="text-blue-500">61%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '61%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-textMuted">
                    <span>₹11,000 / ₹18,000</span>
                    <span className="text-textMuted">On track</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1 font-bold">
                    <span>Savings</span>
                    <span className="text-success">100%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                    <div className="bg-success h-1.5 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-textMuted">
                    <span>₹12,000 / ₹12,000</span>
                    <span className="text-success">✓ Allocated</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 flex justify-between items-center text-sm">
                <span className="text-textMuted">Month health</span>
                <span className="text-success font-bold flex items-center gap-1">On track <span className="text-lg leading-none">✓</span></span>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white p-5 rounded-2xl border border-borderLight shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Recent transactions</h3>
                <button className="text-sm text-blue-500 hover:underline">View all</button>
              </div>

              <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                <button className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full whitespace-nowrap">All</button>
                <button className="px-3 py-1 border border-borderLight text-textMuted hover:bg-gray-50 text-xs font-semibold rounded-full whitespace-nowrap">Food</button>
                <button className="px-3 py-1 border border-borderLight text-textMuted hover:bg-gray-50 text-xs font-semibold whitespace-nowrap">Transport</button>
                <button className="px-3 py-1 border border-borderLight text-textMuted hover:bg-gray-50 text-xs font-semibold rounded-full whitespace-nowrap">Bills</button>
                <button className="px-3 py-1 border border-borderLight text-textMuted hover:bg-gray-50 text-xs font-semibold rounded-full whitespace-nowrap">Income</button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-success">
                      <div className="w-4 h-4 bg-success rounded-full flex items-center justify-center text-white text-[10px] font-bold">₹</div>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Salary deposit</div>
                      <div className="text-xs text-textMuted flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success"></span> Income · Apr 1</div>
                    </div>
                  </div>
                  <div className="font-bold text-success text-sm">+₹60,000</div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                      <HomeIcon size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Rent payment</div>
                      <div className="text-xs text-textMuted flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Housing · Apr 1</div>
                    </div>
                  </div>
                  <div className="font-bold text-danger text-sm">-₹12,000</div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-primary">
                      <ShoppingCart size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Grocery shopping</div>
                      <div className="text-xs text-textMuted flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Food · Apr 3</div>
                    </div>
                  </div>
                  <div className="font-bold text-danger text-sm">-₹2,340</div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-danger">
                      <Car size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Petrol refill</div>
                      <div className="text-xs text-textMuted flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-danger"></span> Transport · Apr 4</div>
                    </div>
                  </div>
                  <div className="font-bold text-danger text-sm">-₹1,500</div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-warning">
                      <Zap size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Electricity bill</div>
                      <div className="text-xs text-textMuted flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-warning"></span> Utilities · Apr 5</div>
                    </div>
                  </div>
                  <div className="font-bold text-danger text-sm">-₹1,890</div>
                </div>

                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-primary">
                      <Coffee size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Morning coffee</div>
                      <div className="text-xs text-textMuted flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Food · Today</div>
                    </div>
                  </div>
                  <div className="font-bold text-danger text-sm">-₹85</div>
                </div>
              </div>
            </div>

            {/* Stock Predictions */}
            <div className="bg-white p-5 rounded-2xl border border-borderLight shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Stock predictions</h3>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">AI - FinBERT</span>
              </div>
              <p className="text-xs text-textMuted bg-gray-50 px-3 py-1.5 rounded-md mb-4 text-center">Based on ₹12,000 savings - opt-in</p>

              <div className="w-full text-left text-xs mb-2 text-textMuted uppercase font-bold grid grid-cols-12 gap-2 px-1">
                <div className="col-span-2">Ticker</div>
                <div className="col-span-4">Company</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-center">Conf.</div>
                <div className="col-span-2 text-right">Signal</div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 items-center text-sm px-1">
                  <div className="col-span-2 font-bold">NVDA</div>
                  <div className="col-span-4 text-xs text-textMuted truncate">NVIDIA Corp</div>
                  <div className="col-span-2 text-right font-semibold">₹74,800</div>
                  <div className="col-span-2 flex items-center justify-center relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="absolute left-0 top-0 h-full bg-success" style={{ width: '98%' }}></div>
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-darkNavy z-10">98%</span>
                  </div>
                  <div className="col-span-2 text-right text-xs font-bold text-success">Bullish</div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-center text-sm px-1">
                  <div className="col-span-2 font-bold">MSFT</div>
                  <div className="col-span-4 text-xs text-textMuted truncate">Microsoft</div>
                  <div className="col-span-2 text-right font-semibold">₹34,900</div>
                  <div className="col-span-2 flex items-center justify-center relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="absolute left-0 top-0 h-full bg-success" style={{ width: '85%' }}></div>
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-darkNavy z-10">85%</span>
                  </div>
                  <div className="col-span-2 text-right text-xs font-bold text-success">Bullish</div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-center text-sm px-1">
                  <div className="col-span-2 font-bold">GOOGL</div>
                  <div className="col-span-4 text-xs text-textMuted truncate">Alphabet</div>
                  <div className="col-span-2 text-right font-semibold">₹14,500</div>
                  <div className="col-span-2 flex items-center justify-center relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="absolute left-0 top-0 h-full bg-success" style={{ width: '80%' }}></div>
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-darkNavy z-10">80%</span>
                  </div>
                  <div className="col-span-2 text-right text-xs font-bold text-success">Bullish</div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-center text-sm px-1">
                  <div className="col-span-2 font-bold">TSLA</div>
                  <div className="col-span-4 text-xs text-textMuted truncate">Tesla Inc</div>
                  <div className="col-span-2 text-right font-semibold">₹14,900</div>
                  <div className="col-span-2 flex items-center justify-center relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="absolute left-0 top-0 h-full bg-warning" style={{ width: '50%' }}></div>
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-darkNavy z-10">50%</span>
                  </div>
                  <div className="col-span-2 text-right text-xs font-bold text-warning">Mixed</div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-center text-sm px-1">
                  <div className="col-span-2 font-bold">META</div>
                  <div className="col-span-4 text-xs text-textMuted truncate">Meta Platforms</div>
                  <div className="col-span-2 text-right font-semibold">₹40,700</div>
                  <div className="col-span-2 flex items-center justify-center relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="absolute left-0 top-0 h-full bg-success" style={{ width: '70%' }}></div>
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-darkNavy z-10">70%</span>
                  </div>
                  <div className="col-span-2 text-right text-xs font-bold text-success">Bullish</div>
                </div>
              </div>

              <div className="mt-auto pt-6 text-center">
                <p className="text-[10px] text-textMuted leading-tight">Predictions are decision-support only — not financial advice.</p>
                <p className="text-[10px] text-textMuted leading-tight">Powered by LSTM + FinBERT sentiment analysis.</p>
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Calculators */}
            <div className="bg-white p-5 rounded-2xl border border-borderLight shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Financial calculators</h3>
                <button className="text-sm text-blue-500 hover:underline">Save scenario</button>
              </div>

              <div className="flex gap-2 mb-6">
                <button className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg">EMI</button>
                <button className="px-4 py-1.5 border border-borderLight text-textDark hover:bg-gray-50 text-sm font-medium rounded-lg">SIP</button>
                <button className="px-4 py-1.5 border border-borderLight text-textDark hover:bg-gray-50 text-sm font-medium rounded-lg">Lumpsum</button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase mb-1">Principal (₹)</label>
                  <input type="text" value="500000" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium" readOnly />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase mb-1">Annual rate (%)</label>
                  <input type="text" value="8.5" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium" readOnly />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase mb-1">Tenure (Years)</label>
                  <input type="text" value="10" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium" readOnly />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase mb-1">Processing fee (%)</label>
                  <input type="text" value="1" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium" readOnly />
                </div>
              </div>

              <div className="bg-darkNavy rounded-xl p-4 flex justify-between text-white">
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Monthly EMI</div>
                  <div className="font-bold text-lg">₹6,207</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Total Interest</div>
                  <div className="font-bold text-lg">₹2,44,840</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Total Payable</div>
                  <div className="font-bold text-lg text-primaryLight">₹7,44,840</div>
                </div>
              </div>
            </div>

            {/* EMI Tracker */}
            <div className="bg-white p-5 rounded-2xl border-2 border-blue-500 shadow-sm relative overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">EMI tracker</h3>
                <span className="text-sm font-bold text-primary bg-orange-100 px-3 py-1 rounded-full">₹20,400 / mo total</span>
              </div>

              <div className="bg-orange-50 rounded-lg p-3 flex justify-between items-center mb-6">
                <span className="text-sm font-medium text-primary">EMI load on income</span>
                <span className="text-lg font-bold text-primary">34%</span>
              </div>

              <div className="space-y-5 flex-1">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="font-bold text-sm">Home loan EMI</div>
                      <div className="text-xs text-textMuted">SBI Housing Finance · Due Apr 10</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">₹15,000</div>
                      <div className="text-[10px] text-textMuted">per month</div>
                      <div className="text-xs text-success font-bold flex items-center justify-end gap-1 mt-0.5">Paid ✓</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <div className="text-[10px] text-textMuted">40% of tenure · 6 yrs remaining</div>
                </div>

                <div>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="font-bold text-sm">Car loan EMI</div>
                      <div className="text-xs text-textMuted">HDFC Auto Finance · Due Apr 15</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">₹4,200</div>
                      <div className="text-[10px] text-textMuted">per month</div>
                      <div className="text-xs text-success font-bold flex items-center justify-end gap-1 mt-0.5">Paid ✓</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <div className="text-[10px] text-textMuted">85% of tenure · 1.5 yrs remaining</div>
                </div>

                <div>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="font-bold text-sm">Personal loan</div>
                      <div className="text-xs text-textMuted">ICICI Bank · Due Apr 20</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">₹1,200</div>
                      <div className="text-[10px] text-textMuted">per month</div>
                      <div className="text-xs text-success font-bold flex items-center justify-end gap-1 mt-0.5">Paid ✓</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                    <div className="bg-success h-1.5 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                  <div className="text-[10px] text-textMuted">95% of tenure · 3 months remaining</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-darkNavy rounded-full shadow-lg flex items-center justify-center text-primary hover:scale-105 transition-transform z-40">
        <span className="font-bold text-xl">₹</span>
        <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-primary rounded-full border-2 border-darkNavy"></div>
      </button>
    </div>
  );
};

export default Dashboard;
