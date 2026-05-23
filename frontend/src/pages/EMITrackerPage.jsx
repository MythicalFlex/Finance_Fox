import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  List, Bell, IndianRupee, ChevronDown, AlertCircle, CheckCircle2,
  Landmark, Clock, Trash2, Plus, Calendar, ArrowRight, ShieldCheck, Undo
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active, dotColor, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${active ? 'bg-primaryLight text-primary font-bold' : 'text-textMuted hover:bg-gray-100'}`}
  >
    <div className="relative">
      {Icon && <Icon size={18} className={active ? 'text-primary' : 'text-textMuted'} />}
      {dotColor && !Icon && <div className={`w-2.5 h-2.5 rounded-sm ${active ? 'bg-primary' : dotColor}`} />}
    </div>
    <span>{label}</span>
  </button>
);

const EMITrackerPage = () => {
  const [emis, setEmis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [userInitials, setUserInitials] = useState('U');

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
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [now, setNow] = useState(new Date());

  // Dropdown states for metrics cards
  const [repaymentDropdownOpen, setRepaymentDropdownOpen] = useState(false);
  const [tenureDropdownOpen, setTenureDropdownOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [lender, setLender] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalTenure, setTotalTenure] = useState('');
  const [paidTenure, setPaidTenure] = useState('');

  const profileRef = useRef(null);
  const repaymentDropdownRef = useRef(null);
  const tenureDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle outside click for dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (repaymentDropdownRef.current && !repaymentDropdownRef.current.contains(e.target)) {
        setRepaymentDropdownOpen(false);
      }
      if (tenureDropdownRef.current && !tenureDropdownRef.current.contains(e.target)) {
        setTenureDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch all EMIs on mount
  useEffect(() => {
    const fetchEMIs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/emis', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setEmis(data);
        } else {
          console.error('Failed to load EMIs');
        }
      } catch (err) {
        console.error('Error fetching EMIs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEMIs();
  }, []);

  // Helper to show custom toasts
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Helper to check if an EMI is paid for the current month
  const isPaidThisMonth = (emi, today) => {
    if (!emi.lastPaidDate) return false;
    const lastPaid = new Date(emi.lastPaidDate);
    return lastPaid.getMonth() === today.getMonth() && lastPaid.getFullYear() === today.getFullYear();
  };

  // Helper to format currency
  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

  // Handle pay/check button click
  const handlePayEMI = async (id) => {
    try {
      let updatedEmi = null;
      const updatedEmis = emis.map(e => {
        if (e.id === id) {
          const nextPaidTenure = Math.min(Number(e.totalTenure), Number(e.paidTenure) + 1);
          updatedEmi = {
            ...e,
            paidTenure: nextPaidTenure,
            lastPaidDate: new Date().toISOString()
          };
          return updatedEmi;
        }
        return e;
      });

      if (!updatedEmi) return;

      // Optimistic update
      setEmis(updatedEmis);

      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/emis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedEmi)
      });

      if (res.ok) {
        showToast('Installment payment recorded successfully! 🎉', 'success');
      } else {
        throw new Error('Failed to sync with backend');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not sync payment. Please try again.', 'error');
    }
  };

  const handleRollbackEMI = async (id) => {
    try {
      let updatedEmi = null;
      const updatedEmis = emis.map(e => {
        if (e.id === id) {
          const nextPaidTenure = Math.max(0, Number(e.paidTenure) - 1);
          const lastPaid = nextPaidTenure > 0 
            ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            : null;
          updatedEmi = {
            ...e,
            paidTenure: nextPaidTenure,
            lastPaidDate: lastPaid
          };
          return updatedEmi;
        }
        return e;
      });

      if (!updatedEmi) return;

      // Optimistic update
      setEmis(updatedEmis);

      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/emis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedEmi)
      });

      if (res.ok) {
        showToast('EMI payment rolled back successfully! ↩️', 'success');
      } else {
        throw new Error('Failed to sync with backend');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not sync rollback. Please try again.', 'error');
    }
  };

  // Handle adding new EMI
  const handleAddEMI = async (e) => {
    e.preventDefault();

    if (!name.trim()) return showToast('Please enter a loan/EMI name.', 'error');
    if (!lender.trim()) return showToast('Please enter the lender name.', 'error');
    if (!amount || Number(amount) <= 0) return showToast('Enter a valid monthly EMI amount.', 'error');
    if (!dueDate || Number(dueDate) < 1 || Number(dueDate) > 31) return showToast('Due date must be between 1 and 31.', 'error');
    if (!totalTenure || Number(totalTenure) <= 0) return showToast('Total tenure must be greater than 0 months.', 'error');

    const pTenure = Number(paidTenure) || 0;
    if (pTenure < 0 || pTenure > Number(totalTenure)) {
      return showToast('Paid tenure cannot exceed total tenure.', 'error');
    }

    const newEMI = {
      id: Date.now(),
      name: name.trim(),
      lender: lender.trim(),
      amount: Number(amount),
      dueDate: Number(dueDate),
      totalTenure: Number(totalTenure),
      paidTenure: pTenure,
      lastPaidDate: pTenure > 0 ? new Date().toISOString() : null
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/emis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEMI)
      });

      if (res.ok) {
        setEmis([...emis, newEMI]);
        showToast('EMI successfully added to tracker! 🚀', 'success');
        // Reset form
        setName('');
        setLender('');
        setAmount('');
        setDueDate('');
        setTotalTenure('');
        setPaidTenure('');
      } else {
        throw new Error('Backend failed to save EMI');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save EMI to server.', 'error');
    }
  };

  // Handle deleting EMI
  const handleDeleteEMI = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/emis/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setEmis(emis.filter(e => e.id !== id));
        showToast('EMI successfully removed.', 'success');
        setDeleteConfirmId(null);
      } else {
        throw new Error('Backend failed to delete EMI');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete EMI from server.', 'error');
    }
  };

  // Calculate Metrics
  const activeEMIs = emis.filter(e => Number(e.paidTenure) < Number(e.totalTenure));
  const totalMonthlyEMI = activeEMIs.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalPaidAmount = emis.reduce((sum, e) => sum + (Number(e.amount) * Number(e.paidTenure)), 0);
  const totalLeftAmount = emis.reduce((sum, e) => sum + (Number(e.amount) * (Number(e.totalTenure) - Number(e.paidTenure))), 0);
  const totalActiveLoansCount = activeEMIs.length;

  // Calculate average aggregate tenure progress percentage
  const totalTenureMonths = emis.reduce((sum, e) => sum + Number(e.totalTenure), 0);
  const totalPaidTenureMonths = emis.reduce((sum, e) => sum + Number(e.paidTenure), 0);
  const aggregateProgress = totalTenureMonths > 0 ? (totalPaidTenureMonths / totalTenureMonths) * 100 : 0;

  // Compile notifications/alerts
  const alertList = activeEMIs.map(e => {
    const paid = isPaidThisMonth(e, now);
    if (paid) return null;

    const dueDay = Number(e.dueDate);
    const todayDay = now.getDate();
    const diff = dueDay - todayDay;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthName = monthNames[now.getMonth()];

    if (diff < 0) {
      return {
        id: e.id,
        type: 'danger',
        message: `Overdue Warning: ${e.name} EMI of ${fmt(e.amount)} is overdue! Due date was ${currentMonthName} ${dueDay}.`,
        emi: e
      };
    } else if (diff <= 7) {
      return {
        id: e.id,
        type: 'warning',
        message: `${e.name} EMI of ${fmt(e.amount)} is due soon on ${currentMonthName} ${dueDay} (in ${diff === 0 ? 'today' : diff === 1 ? '1 day' : diff + ' days'}).`,
        emi: e
      };
    }
    return null;
  }).filter(Boolean);

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
              <SidebarItem dotColor="bg-gray-200" label="Expense History" onClick={() => navigate('/expense-history')} />
              <SidebarItem dotColor="bg-gray-200" label="AI Assistant" onClick={() => navigate('/ai-assistant')} />
              <SidebarItem dotColor="bg-gray-200" label="Budget" onClick={() => navigate('/budget')} />
              <SidebarItem dotColor="bg-gray-200" label="Stocks" onClick={() => navigate('/stocks')} />
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-3 px-2">Tools</h4>
            <div className="space-y-1">
              <SidebarItem dotColor="bg-gray-200" label="Calculators" onClick={() => navigate('/calculators')} />
              <SidebarItem dotColor="bg-primary" label="EMI Tracker" active onClick={() => navigate('/emitracker')} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-borderLight flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-textMuted" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <List size={24} />
            </button>
            <h1 className="text-lg text-textMuted font-medium border-l border-borderLight pl-4 ml-2">EMI Tracker</h1>
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
                  <button className="w-full text-left px-4 py-2.5 text-xs font-semibold text-primary hover:bg-orange-50 transition-colors flex items-center gap-2" onClick={handleSignOut}>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 w-full max-w-7xl mx-auto">
          {/* Welcome Message */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-1 text-darkNavy">EMI Tracking Center</h2>
              <p className="text-textMuted text-sm">Monitor outstanding debt commitments, register monthly installments, and track payment schedules.</p>
            </div>
          </div>

          {/* Dynamic Top Banners */}
          <div className="mb-8">
            {alertList.length > 0 ? (
              <div className="space-y-3">
                {alertList.map((alert, i) => (
                  <div
                    key={alert.id || i}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border animate-fadeIn transition-all shadow-sm ${alert.type === 'danger'
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}
                  >
                    <AlertCircle className={`shrink-0 mt-0.5 ${alert.type === 'danger' ? 'text-rose-500' : 'text-amber-500'}`} size={18} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{alert.message}</p>
                      <p className="text-xs mt-1 opacity-90">To pay off this month's installment, click the pay checkbox in the loan list below.</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              emis.length > 0 && (
                <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800 shadow-sm animate-fadeIn">
                  <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold">Excellent Standing!</h4>
                    <p className="text-xs opacity-90">All active EMI payments are fully paid up for the month of {now.toLocaleString('en-IN', { month: 'long' })}. You are in perfect sync!</p>
                  </div>
                </div>
              )
            )}
          </div>

          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Monthly Outflow */}
            <div className="bg-white p-6 rounded-2xl border border-borderLight shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primaryLight rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold text-textMuted uppercase tracking-wider mb-1">Monthly EMI Burden</p>
                  <h3 className="text-3xl font-extrabold text-darkNavy">{fmt(totalMonthlyEMI)}</h3>
                </div>
                <div className="w-10 h-10 bg-primaryLight text-primary rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                  <Landmark size={20} />
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <span className="text-xs text-textMuted font-medium">Across active loans</span>
                <span className="text-xs font-bold text-primary bg-primaryLight px-2 py-0.5 rounded-full">{totalActiveLoansCount} Active</span>
              </div>
            </div>

            {/* Total Paid */}
            <div className="bg-white p-6 rounded-2xl border border-borderLight shadow-sm relative flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold text-textMuted uppercase tracking-wider mb-1">Cumulative Debt Paid</p>
                  <h3 className="text-3xl font-extrabold text-emerald-950">{fmt(totalPaidAmount)}</h3>
                </div>
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                  <ShieldCheck size={20} />
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 relative" ref={repaymentDropdownRef}>
                <button
                  type="button"
                  onClick={() => setRepaymentDropdownOpen(!repaymentDropdownOpen)}
                  className="w-full flex justify-between items-center text-xs text-textMuted font-medium hover:text-darkNavy transition-colors focus:outline-none"
                >
                  <span className="select-none">Repayment Progress</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${repaymentDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {repaymentDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-borderLight rounded-xl shadow-xl p-3.5 z-10 space-y-2.5 max-h-48 overflow-y-auto animate-fadeIn">
                    {activeEMIs.length === 0 ? (
                      <p className="text-[11px] text-textMuted text-center font-medium">No active loans</p>
                    ) : (
                      activeEMIs.map(e => {
                        const pct = Math.round((Number(e.paidTenure) / Number(e.totalTenure)) * 100);
                        return (
                          <div key={e.id} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-semibold text-slate-700">
                              <span className="truncate max-w-[120px]" title={e.lender}>{e.lender}</span>
                              <span>{pct}% ({e.paidTenure}/{e.totalTenure} mos)</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden flex">
                              <div className="bg-emerald-500 h-full" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Outstanding liability */}
            <div className="bg-white p-6 rounded-2xl border border-borderLight shadow-sm relative flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold text-textMuted uppercase tracking-wider mb-1">Outstanding Liability</p>
                  <h3 className="text-3xl font-extrabold text-purple-950">{fmt(totalLeftAmount)}</h3>
                </div>
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                  <Clock size={20} />
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 relative" ref={tenureDropdownRef}>
                <button
                  type="button"
                  onClick={() => setTenureDropdownOpen(!tenureDropdownOpen)}
                  className="w-full flex justify-between items-center text-xs text-textMuted font-medium hover:text-darkNavy transition-colors focus:outline-none"
                >
                  <span className="select-none">Total tenure balance</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${tenureDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {tenureDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-borderLight rounded-xl shadow-xl p-3.5 z-10 space-y-2.5 max-h-48 overflow-y-auto animate-fadeIn">
                    {activeEMIs.length === 0 ? (
                      <p className="text-[11px] text-textMuted text-center font-medium">No active loans</p>
                    ) : (
                      activeEMIs.map(e => {
                        const left = Number(e.totalTenure) - Number(e.paidTenure);
                        return (
                          <div key={e.id} className="flex justify-between items-center text-[10px] font-semibold text-slate-700">
                            <span className="truncate max-w-[120px]" title={e.lender}>{e.lender}</span>
                            <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{left} mos left</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Section: Active Loan Installments list */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-darkNavy">Active Installments List</h3>
                <span className="text-xs font-bold text-textMuted bg-gray-100 px-3 py-1 rounded-full">{emis.length} Total Loans</span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-borderLight rounded-2xl shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
                  <p className="text-sm font-semibold text-textMuted">Syncing tracking records...</p>
                </div>
              ) : emis.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white border border-borderLight rounded-2xl text-center shadow-sm">
                  <div className="w-14 h-14 bg-primaryLight rounded-full flex items-center justify-center text-primary mb-4">
                    <Landmark size={24} />
                  </div>
                  <h4 className="font-bold text-darkNavy mb-1">No tracked loans yet</h4>
                  <p className="text-xs text-textMuted max-w-sm mb-6">Start tracking your outstandings by filling out the "Add New EMI Tracker" form on the right.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {emis.map((emi) => {
                    const paidThisMonth = isPaidThisMonth(emi, now);
                    const isCompleted = Number(emi.paidTenure) >= Number(emi.totalTenure);
                    const percent = isCompleted ? 100 : (Number(emi.paidTenure) / Number(emi.totalTenure)) * 100;

                    const dueDay = Number(emi.dueDate);
                    const isOverdue = !paidThisMonth && !isCompleted && now.getDate() > dueDay;
                    const isDueSoon = !paidThisMonth && !isCompleted && (dueDay - now.getDate() <= 7) && (dueDay - now.getDate() >= 0);

                    // Calculations
                    const amountPaid = Number(emi.amount) * Number(emi.paidTenure);
                    const amountLeft = Number(emi.amount) * (Number(emi.totalTenure) - Number(emi.paidTenure));
                    const monthsLeft = Number(emi.totalTenure) - Number(emi.paidTenure);
                    const yearsLeft = (monthsLeft / 12).toFixed(1);

                    return (
                      <div
                        key={emi.id}
                        className={`bg-white rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col p-6 shadow-sm hover:shadow-md ${isCompleted
                            ? 'border-emerald-200 bg-emerald-50/10'
                            : isOverdue
                              ? 'border-rose-300 ring-2 ring-rose-50'
                              : paidThisMonth
                                ? 'border-primary/20 bg-primaryLight/5'
                                : 'border-borderLight'
                          }`}
                      >
                        {/* Top info and status badge */}
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <div className="flex gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCompleted
                                ? 'bg-emerald-100 text-emerald-700'
                                : isOverdue
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-primaryLight text-primary'
                              }`}>
                              <Landmark size={20} />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-darkNavy leading-tight">{emi.name}</h4>
                              <p className="text-xs text-textMuted font-medium">{emi.lender} · Due day: {emi.dueDate}th</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            {isCompleted ? (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle2 size={12} /> Completed 🎉
                              </span>
                            ) : paidThisMonth ? (
                              <span className="text-[11px] font-bold text-primary bg-primaryLight px-3 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle2 size={12} /> Paid for {now.toLocaleString('en-IN', { month: 'short' })} ✓
                              </span>
                            ) : isOverdue ? (
                              <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full flex items-center gap-1">
                                <AlertCircle size={12} /> Overdue ⚠️
                              </span>
                            ) : isDueSoon ? (
                              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                                Due in {dueDay - now.getDate()} days
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-textMuted bg-gray-100 px-3 py-1 rounded-full">
                                Unpaid
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Mid Section: Amount and check action */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-gray-100/80 mb-4 bg-gray-50/50 -mx-6 px-6">
                          <div>
                            <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">Monthly installment</span>
                            <span className="text-2xl font-black text-darkNavy">{fmt(emi.amount)} <span className="text-xs text-textMuted font-bold">/ month</span></span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePayEMI(emi.id)}
                              disabled={isCompleted}
                              className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-extrabold shadow-sm hover:bg-orange-600 transition-all flex items-center gap-1.5 hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                              <CheckCircle2 size={15} /> Pay Next EMI
                            </button>
                            <button
                              onClick={() => handleRollbackEMI(emi.id)}
                              disabled={Number(emi.paidTenure) === 0}
                              className="px-4 py-2.5 bg-white border border-gray-200 text-textDark rounded-xl text-xs font-extrabold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-1.5 hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                              <Undo size={15} className="text-textMuted" /> Rollback
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-textMuted mb-1 font-semibold">
                            <span>Tenure Cleared</span>
                            <span>{Math.round(percent)}% ({emi.paidTenure}/{emi.totalTenure} months)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-primary'}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        {/* Secondary statistics grid */}
                        <div className="grid grid-cols-3 gap-2.5 text-left border-b border-gray-100 pb-4 mb-4">
                          <div>
                            <span className="text-[9px] font-bold text-textMuted uppercase tracking-wider block">Total Paid</span>
                            <span className="text-xs font-extrabold text-slate-800">{fmt(amountPaid)}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-textMuted uppercase tracking-wider block">Remaining Left</span>
                            <span className="text-xs font-extrabold text-slate-800">{fmt(amountLeft)}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-textMuted uppercase tracking-wider block">Time Left</span>
                            <span className="text-xs font-extrabold text-slate-800">
                              {isCompleted ? 'None' : `${monthsLeft} mos (${yearsLeft} yrs)`}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex justify-between items-center">
                          <div className="text-[10px] text-textMuted font-medium flex items-center gap-1">
                            {emi.lastPaidDate ? (
                              <>
                                <span>Last paid:</span>
                                <span className="font-semibold text-slate-700">
                                  {new Date(emi.lastPaidDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                              </>
                            ) : (
                              <span>No payment recorded yet</span>
                            )}
                          </div>

                          {deleteConfirmId === emi.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-rose-600">Delete?</span>
                              <button
                                onClick={() => handleDeleteEMI(emi.id)}
                                className="px-2.5 py-1 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2.5 py-1 bg-gray-100 text-textMuted rounded text-[10px] font-bold hover:bg-gray-200"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(emi.id)}
                              className="text-textMuted hover:text-rose-600 p-1 rounded transition-colors"
                              title="Delete tracked EMI"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Section: Add New EMI Form */}
            <div className="bg-white rounded-2xl border border-borderLight shadow-sm p-6 lg:sticky lg:top-24">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Plus size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-darkNavy leading-none">Add Loan Tracker</h3>
                  <p className="text-[10px] text-textMuted mt-1">Initiate tracking for a new loan commitment</p>
                </div>
              </div>

              <form onSubmit={handleAddEMI} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1.5">EMI / Loan Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. HDFC Home Loan, Car Loan"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-darkNavy focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-gray-400 placeholder:font-normal"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1.5">Lender / Financial Institution</label>
                  <input
                    type="text"
                    value={lender}
                    onChange={e => setLender(e.target.value)}
                    placeholder="e.g. SBI Bank, ICICI Bank"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-darkNavy focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-gray-400 placeholder:font-normal"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1.5">Monthly EMI Amount</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-textMuted font-bold text-sm pointer-events-none">₹</span>
                      <input
                        type="number"
                        value={amount}
                        min="1"
                        onChange={e => setAmount(e.target.value)}
                        onWheel={e => e.target.blur()}
                        placeholder="Amount"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm font-bold text-darkNavy focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-gray-400 placeholder:font-normal"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1.5">Monthly Due Day</label>
                    <input
                      type="number"
                      value={dueDate}
                      min="1"
                      max="31"
                      onChange={e => setDueDate(e.target.value)}
                      onWheel={e => e.target.blur()}
                      placeholder="e.g. 5, 10"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-darkNavy focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-gray-400 placeholder:font-normal"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1.5">Total Tenure (Months)</label>
                    <input
                      type="number"
                      value={totalTenure}
                      min="1"
                      onChange={e => setTotalTenure(e.target.value)}
                      onWheel={e => e.target.blur()}
                      placeholder="Total months"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-darkNavy focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-gray-400 placeholder:font-normal"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1.5">Months Already Paid</label>
                    <input
                      type="number"
                      value={paidTenure}
                      min="0"
                      onChange={e => setPaidTenure(e.target.value)}
                      onWheel={e => e.target.blur()}
                      placeholder="Already paid"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-darkNavy focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-gray-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3 text-xs font-black shadow-md hover:shadow-lg transition-all hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus size={16} /> Track Loan Commitment
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3.5 rounded-xl border shadow-xl animate-fadeIn ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : <AlertCircle size={16} className="text-rose-500 shrink-0" />}
          <span className="text-xs font-extrabold">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default EMITrackerPage;
