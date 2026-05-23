import React, { useState, useEffect, useRef } from 'react';
import { 
  List, 
  Plus, 
  Trash2,
  IndianRupee,
  Calendar,
  RefreshCw,
  ChevronDown,
  Search,
  Filter,
  TrendingUp,
  Sparkles,
  ArrowLeft,
  CalendarDays
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const ExpenseHistoryPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [userInitials, setUserInitials] = useState('U');
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Selected Date Filter (Month and Year)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const yearsList = [2025, 2026];

  // Templates and Categories
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [activeTemplateId, setActiveTemplateId] = useState(() => {
    const saved = localStorage.getItem('activeTemplateId');
    return saved ? JSON.parse(saved) : '';
  });
  const [activeCategoryId, setActiveCategoryId] = useState('all'); // 'all' or specific category ID

  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  
  // Expenses State
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form for Backdated Expense
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formTemplateId, setFormTemplateId] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      setTemplateDropdownOpen(false);
      setCategoryDropdownOpen(false);
      setMonthDropdownOpen(false);
      setYearDropdownOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Fetch templates and set active selections
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/templates', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setSavedTemplates(data);
          
          const savedTplId = localStorage.getItem('activeTemplateId');
          if (savedTplId) {
            const parsedId = JSON.parse(savedTplId);
            setActiveTemplateId(parsedId);
            setFormTemplateId(parsedId);
            const activeTpl = data.find(t => t.id === parsedId);
            if (activeTpl && activeTpl.categories && activeTpl.categories.length > 0) {
              setFormCategoryId(activeTpl.categories[0].id);
            }
          } else if (data.length > 0) {
            setActiveTemplateId(data[0].id);
            setFormTemplateId(data[0].id);
            if (data[0].categories && data[0].categories.length > 0) {
              setFormCategoryId(data[0].categories[0].id);
            }
          }
          localStorage.setItem('budgetTemplates', JSON.stringify(data));
        }
      } catch (e) {
        console.error('Failed to fetch templates, falling back to localStorage', e);
        const saved = localStorage.getItem('budgetTemplates');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setSavedTemplates(parsed);
            if (parsed.length > 0) {
              setActiveTemplateId(parsed[0].id);
              setFormTemplateId(parsed[0].id);
              if (parsed[0].categories && parsed[0].categories.length > 0) {
                setFormCategoryId(parsed[0].categories[0].id);
              }
            }
          } catch (err) {}
        }
      }
    };

    fetchTemplates();
  }, []);

  const activeTemplate = savedTemplates.find(t => t.id === activeTemplateId);
  const activeCategories = activeTemplate?.categories || [];

  // Update categories form select value whenever template changes
  useEffect(() => {
    if (activeTemplate && activeTemplate.categories && activeTemplate.categories.length > 0) {
      setFormCategoryId(activeTemplate.categories[0].id);
    }
  }, [activeTemplateId, savedTemplates]);

  // Fetch Expenses
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/expenses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
        localStorage.setItem('expenseLogs', JSON.stringify(data));
      }
    } catch (e) {
      console.error('Failed to fetch expenses', e);
      const saved = localStorage.getItem('expenseLogs');
      if (saved) {
        try {
          setExpenses(JSON.parse(saved));
        } catch (err) {}
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Handle Add Backdated Expense
  const handleAddPastExpense = async (e) => {
    e.preventDefault();
    if (formName && formAmount && formCategoryId && formTemplateId && formDate) {
      const parsedDate = new Date(formDate);
      const newExpense = { 
        id: String(Date.now()), 
        name: formName ? formName.charAt(0).toUpperCase() + formName.slice(1) : '', 
        amount: parseFloat(formAmount), 
        categoryId: parseInt(formCategoryId),
        templateId: parseInt(formTemplateId),
        date: parsedDate.toISOString()
      };

      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      localStorage.setItem('expenseLogs', JSON.stringify(updatedExpenses));
      setFormName('');
      setFormAmount('');

      try {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:5000/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newExpense)
        });
      } catch (err) {
        console.error('Failed to save expense:', err);
      }
    }
  };

  // Remove Expense
  const removeExpense = async (id) => {
    const updatedExpenses = expenses.filter(e => e.id !== id);
    setExpenses(updatedExpenses);
    localStorage.setItem('expenseLogs', JSON.stringify(updatedExpenses));

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  // Seeding realistic past expenses for visualization
  const generateSeedData = async () => {
    if (!activeTemplateId || activeCategories.length === 0) return;
    
    // Generate realistic expenses for the past 4 months (e.g. Feb, Mar, Apr, May of current year)
    const seedExpenses = [];
    const nowRef = new Date();
    
    const descriptions = {
      "Food": ["Uber Eats", "Zomato Dineout", "Spencers Grocery", "Cafe Coffee Day", "Pizza Hut", "Supermarket Veggies"],
      "Entertainment": ["Netflix Subscription", "Movie Tickets", "Spotify Premium", "Bowling Lounge", "Gaming Zone"],
      "Rent": ["Monthly Rent payment"],
      "Utilities": ["Electricity Bill", "Broadband Internet", "Gas Cylinder Refill", "Mobile Recharge"],
      "Shopping": ["Amazon Fashion Store", "Zara Jeans", "Nike Running Shoes", "Local Mall Shopping"],
      "Investments": ["Nifty Index Mutual Fund", "SIP Contribution", "Stocks Buy", "Gold ETF Purchase"],
      "Transport": ["Uber Cab Fare", "Petrol Pump Refill", "Metro Card Recharge", "Auto Rickshaw Pay"],
      "Bills": ["Electricity Bill", "Phone Postpaid", "Water Utility Tax"]
    };

    const token = localStorage.getItem('token');
    
    for (let monthOffset = 0; monthOffset < 4; monthOffset++) {
      const seedMonth = new Date(nowRef.getFullYear(), nowRef.getMonth() - monthOffset, 15);
      
      activeCategories.forEach((cat) => {
        // Budget allocated for this category
        const catBudget = (activeTemplate.income * (cat.percentage || 10)) / 100;
        
        // Let's generate 2-4 transactions per category in past months
        const txCount = Math.floor(Math.random() * 3) + 2; 
        for (let i = 0; i < txCount; i++) {
          const catNames = descriptions[cat.name] || ["General Purchase", "Utility Spend", "Miscellaneous Bill"];
          const name = catNames[Math.floor(Math.random() * catNames.length)];
          
          // Random date within that month
          const randomDay = Math.floor(Math.random() * 25) + 1;
          const txDate = new Date(seedMonth.getFullYear(), seedMonth.getMonth(), randomDay);
          
          // Total amount shouldn't exceed budget
          const maxTxVal = (catBudget / txCount) * 1.1;
          const amount = parseFloat((Math.random() * maxTxVal + 150).toFixed(2));
          
          const uniqueId = `seed-${cat.id}-${txDate.getTime()}-${Math.floor(Math.random() * 1000)}`;
          
          seedExpenses.push({
            id: uniqueId,
            name,
            amount,
            categoryId: cat.id,
            templateId: activeTemplateId,
            date: txDate.toISOString()
          });
        }
      });
    }

    // Update state & store locally
    const merged = [...expenses, ...seedExpenses];
    setExpenses(merged);
    localStorage.setItem('expenseLogs', JSON.stringify(merged));

    // Upload to database
    try {
      for (const item of seedExpenses) {
        await fetch('http://localhost:5000/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(item)
        });
      }
      fetchExpenses(); // Reload
    } catch (e) {
      console.error('Error uploading seed data', e);
    }
  };

  // Helper function to extract date from expense object
  const getExpenseDate = (exp) => {
    if (exp.date) return new Date(exp.date);
    // fallback to timestamp parsing if id is numeric
    if (!isNaN(exp.id)) return new Date(parseInt(exp.id));
    // fallback to createdAt
    if (exp.createdAt) return new Date(exp.createdAt);
    return new Date();
  };

  // Filter expenses based on current selections
  const getFilteredExpenses = () => {
    return expenses.filter(exp => {
      // 1. Must belong to active template
      if (exp.templateId !== activeTemplateId) return false;

      const date = getExpenseDate(exp);
      const expMonth = date.getMonth();
      const expYear = date.getFullYear();

      // 2. Match selected month & year
      if (expMonth !== selectedMonth || expYear !== selectedYear) return false;

      // 3. Match category filter
      if (activeCategoryId !== 'all' && exp.categoryId !== parseInt(activeCategoryId)) return false;

      // 4. Match search query
      if (searchQuery && !exp.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      return true;
    }).sort((a, b) => getExpenseDate(b) - getExpenseDate(a)); // sorted descending by date
  };

  const filteredExpensesList = getFilteredExpenses();
  const totalSpendingThisMonth = filteredExpensesList.reduce((sum, e) => sum + e.amount, 0);

  // Selected template total monthly budget
  const monthlyIncomeBudget = activeTemplate?.income || 30000;
  const activeCategory = activeCategories.find(c => c.id === parseInt(activeCategoryId));
  const activeCategoryName = activeCategory ? activeCategory.name : 'Overall';
  
  const currentSelectedBudget = activeCategory 
    ? (monthlyIncomeBudget * activeCategory.percentage) / 100 
    : monthlyIncomeBudget;

  const budgetRemaining = currentSelectedBudget - totalSpendingThisMonth;
  const budgetPercent = Math.min((totalSpendingThisMonth / currentSelectedBudget) * 100, 100);

  // Compute daily average spending for the selected month
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const daysInSelectedMonth = getDaysInMonth(selectedMonth, selectedYear);
  const averageDailySpend = totalSpendingThisMonth / daysInSelectedMonth;

  // Compute MoM percentage change comparing to previous month
  const getPrevMonthSpending = () => {
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;

    const prevExpenses = expenses.filter(exp => {
      if (exp.templateId !== activeTemplateId) return false;
      const date = getExpenseDate(exp);
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    });
    return prevExpenses.reduce((sum, e) => sum + e.amount, 0);
  };

  const prevMonthTotal = getPrevMonthSpending();
  const momPercent = prevMonthTotal > 0 
    ? ((totalSpendingThisMonth - prevMonthTotal) / prevMonthTotal) * 100 
    : 0;

  // Gather chart data for the last 6 months
  const getChartData = () => {
    const dataPoints = [];
    const nowRef = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(nowRef.getFullYear(), nowRef.getMonth() - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();

      const monthlyExpenses = expenses.filter(exp => {
        if (exp.templateId !== activeTemplateId) return false;
        const date = getExpenseDate(exp);
        return date.getMonth() === m && date.getFullYear() === y;
      });

      const total = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
      dataPoints.push({
        label: `${monthsList[m].substring(0, 3)} ${String(y).substring(2)}`,
        value: total,
        month: m,
        year: y
      });
    }
    return dataPoints;
  };

  const chartData = getChartData();
  const maxChartValue = Math.max(...chartData.map(d => d.value), 1000);

  // Generate SVG Points for Line Chart
  const svgWidth = 500;
  const svgHeight = 150;
  const paddingX = 40;
  const paddingY = 20;

  const points = chartData.map((data, index) => {
    const x = paddingX + (index * (svgWidth - paddingX * 2)) / (chartData.length - 1);
    // Invert y axis so 0 is at bottom
    const y = svgHeight - paddingY - (data.value / maxChartValue) * (svgHeight - paddingY * 2);
    return `${x},${y}`;
  }).join(' ');

  // SVG Area path string
  const areaPoints = chartData.length > 0 ? [
    `${paddingX},${svgHeight - paddingY}`,
    ...chartData.map((data, index) => {
      const x = paddingX + (index * (svgWidth - paddingX * 2)) / (chartData.length - 1);
      const y = svgHeight - paddingY - (data.value / maxChartValue) * (svgHeight - paddingY * 2);
      return `${x},${y}`;
    }),
    `${svgWidth - paddingX},${svgHeight - paddingY}`
  ].join(' ') : '';

  // Get category distribution for the selected month
  const getCategorySpendings = () => {
    const distribution = {};
    activeCategories.forEach(cat => {
      distribution[cat.id] = {
        name: cat.name,
        color: cat.color,
        amount: 0,
        percentage: 0
      };
    });

    filteredExpensesList.forEach(exp => {
      if (distribution[exp.categoryId]) {
        distribution[exp.categoryId].amount += exp.amount;
      }
    });

    // Calculate percentage breakdown
    const list = Object.values(distribution);
    const total = list.reduce((sum, item) => sum + item.amount, 0);
    if (total > 0) {
      list.forEach(item => {
        item.percentage = (item.amount / total) * 100;
      });
    }

    return list.sort((a, b) => b.amount - a.amount);
  };

  const categoryDistribution = getCategorySpendings();

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
              <SidebarItem dotColor="bg-primary" label="Expense History" active />
              <SidebarItem dotColor="bg-gray-200" label="AI Assistant" onClick={() => navigate('/ai-assistant')} />
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
            <h1 className="text-lg text-textMuted font-medium border-l border-borderLight pl-4 ml-2">Expense History</h1>
          </div>
          
          <div className="flex items-center gap-4">
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

        <div className="p-6 md:p-8 overflow-y-auto flex-1 w-full max-w-7xl mx-auto space-y-8">
          
          {/* Title & Top Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-1 text-darkNavy">Past Month Expenses</h2>
              <p className="text-textMuted text-sm">Analyze and filter your spending history across different months and budget templates.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Template Selector */}
              {savedTemplates.length > 0 && (
                <div className="relative flex items-center bg-white border border-borderLight hover:border-primary/40 transition-all rounded-xl pl-4 pr-10 py-2 shadow-sm group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-primaryLight text-primary flex items-center justify-center shrink-0 mr-3 pointer-events-none">
                    <IndianRupee size={16} />
                  </div>
                  <div className="flex flex-col min-w-[120px] max-w-[160px] pointer-events-none">
                    <span className="text-[9px] uppercase font-bold text-textMuted tracking-wider leading-none mb-1">Budget Template</span>
                    <span className="font-bold text-darkNavy text-xs truncate">
                      {savedTemplates.find(t => t.id === activeTemplateId)?.name || 'Select Template'}
                    </span>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setTemplateDropdownOpen(!templateDropdownOpen); }}
                    className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center cursor-pointer text-textMuted hover:text-primary transition-colors focus:outline-none"
                  >
                    <ChevronDown size={14} className={`transition-transform duration-200 ${templateDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
                  </button>

                  {templateDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-borderLight rounded-xl shadow-xl py-1.5 z-50 animate-fadeIn">
                      {savedTemplates.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setActiveTemplateId(t.id);
                            setFormTemplateId(t.id);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors flex items-center justify-between ${t.id === activeTemplateId ? 'bg-primaryLight text-primary' : 'text-darkNavy hover:bg-slate-50'}`}
                        >
                          <span className="truncate">{t.name}</span>
                          {t.id === activeTemplateId && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Quick Seed Button to Help Seeding */}
              <button 
                onClick={generateSeedData}
                className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-xs transition-all flex items-center gap-2 hover:bg-slate-800 shadow-sm border border-slate-800"
                title="Generates 4 months of realistic history"
              >
                <Sparkles size={14} className="text-primary" />
                <span>Seed Sample History</span>
              </button>
            </div>
          </div>

          {/* Quick Month / Year Filter bar */}
          <div className="bg-white border border-borderLight p-4 rounded-2xl shadow-sm flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Select Month Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMonthDropdownOpen(!monthDropdownOpen); setYearDropdownOpen(false); }}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-bold text-darkNavy flex items-center gap-1.5 focus:outline-none transition-colors"
                >
                  <CalendarDays size={14} className="text-primary" />
                  <span>Month: {monthsList[selectedMonth]}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${monthDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {monthDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-44 bg-white border border-borderLight rounded-xl shadow-xl py-1.5 z-40 max-h-60 overflow-y-auto no-scrollbar animate-fadeIn">
                    {monthsList.map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedMonth(idx)}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors ${selectedMonth === idx ? 'text-primary bg-primaryLight/20' : 'text-slate-700'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Select Year Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setYearDropdownOpen(!yearDropdownOpen); setMonthDropdownOpen(false); }}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-bold text-darkNavy flex items-center gap-1.5 focus:outline-none transition-colors"
                >
                  <span>Year: {selectedYear}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${yearDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {yearDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-32 bg-white border border-borderLight rounded-xl shadow-xl py-1.5 z-40 animate-fadeIn">
                    {yearsList.map((y) => (
                      <button
                        key={y}
                        onClick={() => setSelectedYear(y)}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors ${selectedYear === y ? 'text-primary bg-primaryLight/20' : 'text-slate-700'}`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Filter */}
              {activeCategories.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCategoryDropdownOpen(!categoryDropdownOpen); }}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-bold text-darkNavy flex items-center gap-1.5 focus:outline-none transition-colors"
                  >
                    <div className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/5" style={{ backgroundColor: activeCategory?.color || '#94a3b8' }} />
                    <span>Category: {activeCategoryName}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {categoryDropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-borderLight rounded-xl shadow-xl py-1.5 z-40 animate-fadeIn">
                      <button
                        onClick={() => setActiveCategoryId('all')}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 ${activeCategoryId === 'all' ? 'text-primary bg-primaryLight/20' : 'text-slate-700'}`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                        <span>All Categories</span>
                      </button>
                      {activeCategories.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setActiveCategoryId(String(c.id))}
                          className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 ${activeCategoryId === String(c.id) ? 'text-primary bg-primaryLight/20' : 'text-slate-700'}`}
                        >
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Live stats text */}
            <div className="text-xs text-textMuted font-medium">
              Showing <span className="font-bold text-darkNavy">{filteredExpensesList.length}</span> transaction(s) for <span className="font-bold text-primary">{monthsList[selectedMonth]} {selectedYear}</span>
            </div>
          </div>

          {/* Top Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Spent Card */}
            <div className="p-5 rounded-2xl bg-darkNavy text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl -mr-6 -mt-6" />
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 text-gray-400">Total Expenses ({activeCategoryName})</h3>
                <div className="text-3xl font-bold mb-3">₹{totalSpendingThisMonth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <div className="flex items-center gap-2 text-xs">
                  {momPercent !== 0 ? (
                    <span className={`px-2 py-0.5 rounded flex items-center font-bold ${momPercent < 0 ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                      {momPercent < 0 ? '↓' : '↑'} {Math.abs(momPercent).toFixed(1)}%
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">0%</span>
                  )}
                  <span className="text-gray-400">MoM vs {monthsList[selectedMonth === 0 ? 11 : selectedMonth - 1].substring(0, 3)}</span>
                </div>
              </div>
            </div>

            {/* Budget Utilization Card */}
            <div className="p-5 rounded-2xl bg-white border border-borderLight shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 text-textMuted">{activeCategoryName} Budget utilization</h3>
                <div className="text-3xl font-bold mb-3">₹{currentSelectedBudget.toLocaleString()}</div>
                
                <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${budgetPercent > 90 ? 'bg-danger' : 'bg-primary'}`} 
                    style={{ width: `${budgetPercent}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-textMuted">
                  <span>{budgetPercent.toFixed(1)}% used</span>
                  <span className={budgetRemaining < 0 ? "text-danger font-bold" : "text-success font-bold"}>
                    {budgetRemaining < 0 ? `Over by ₹${Math.abs(budgetRemaining).toLocaleString()}` : `₹${budgetRemaining.toLocaleString()} left`}
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Average Card */}
            <div className="p-5 rounded-2xl bg-white border border-borderLight shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 text-textMuted">Daily Average Spending</h3>
                <div className="text-3xl font-bold mb-3">₹{averageDailySpend.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                <div className="text-xs text-textMuted mt-1">
                  Spread over <span className="font-semibold text-darkNavy">{daysInSelectedMonth} days</span> in the month
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout: Visual Chart & Seeding */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Chart Area: 6 Month Spending Trend */}
            <div className="lg:col-span-2 bg-white border border-borderLight rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-darkNavy text-base leading-none">6-Month Spending Trend</h3>
                  <p className="text-xs text-textMuted mt-1">Visualizing overall spending trends for your active template</p>
                </div>
                <span className="text-xs font-bold text-primary bg-primaryLight px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Visual History
                </span>
              </div>

              {chartData.length > 0 && maxChartValue > 1000 ? (
                <div className="flex-1 flex flex-col justify-end">
                  <div className="relative w-full h-[150px] overflow-hidden">
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="history-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Grid Lines */}
                      <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#f1f5f9" strokeWidth="1" />
                      <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="#f1f5f9" strokeWidth="1" />
                      <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />

                      {/* Area Under Line */}
                      {chartData.length > 1 && (
                        <polygon points={areaPoints} fill="url(#history-grad)" stroke="none" />
                      )}

                      {/* Line */}
                      {chartData.length > 1 && (
                        <polyline
                          fill="none"
                          stroke="#f97316"
                          strokeWidth="3"
                          points={points}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Data Dots */}
                      {chartData.map((data, index) => {
                        const x = paddingX + (index * (svgWidth - paddingX * 2)) / (chartData.length - 1);
                        const y = svgHeight - paddingY - (data.value / maxChartValue) * (svgHeight - paddingY * 2);
                        const isSelectedMonth = data.month === selectedMonth && data.year === selectedYear;

                        return (
                          <g key={index}>
                            <circle
                              cx={x}
                              cy={y}
                              r={isSelectedMonth ? "6" : "4"}
                              fill={isSelectedMonth ? "#f97316" : "#ffffff"}
                              stroke="#f97316"
                              strokeWidth={isSelectedMonth ? "3" : "2"}
                              className="transition-all duration-300"
                            />
                            <text
                              x={x}
                              y={y - 10}
                              textAnchor="middle"
                              className="text-[9px] font-bold fill-darkNavy"
                            >
                              ₹{Math.round(data.value).toLocaleString()}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  
                  {/* Chart X Labels */}
                  <div className="flex justify-between px-[40px] pt-2 border-t border-slate-50 mt-1">
                    {chartData.map((data, index) => (
                      <div key={index} className="text-center">
                        <button
                          onClick={() => {
                            setSelectedMonth(data.month);
                            setSelectedYear(data.year);
                          }}
                          className={`text-[10px] font-bold block uppercase tracking-wider hover:text-primary transition-colors ${data.month === selectedMonth && data.year === selectedYear ? 'text-primary font-extrabold' : 'text-textMuted'}`}
                        >
                          {data.label}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-textMuted">
                  <RefreshCw size={24} className="animate-spin text-primary" />
                </div>
              )}
            </div>

            {/* Backdate Simulator Form */}
            <div className="bg-white border border-borderLight rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-darkNavy text-base leading-none mb-1">Add Past Expense</h3>
                <p className="text-xs text-textMuted mb-4">Simulator to log an expense for a specific date in the past.</p>
                
                {activeCategories.length === 0 ? (
                  <p className="text-xs text-danger">No active template categories. Please select a template.</p>
                ) : (
                  <form onSubmit={handleAddPastExpense} className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Expense Name</label>
                      <input 
                        type="text"
                        placeholder="e.g. Cinema Tickets"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Amount (₹)</label>
                        <input 
                          type="number"
                          placeholder="0"
                          value={formAmount}
                          onChange={(e) => setFormAmount(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                          required
                          min="1"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Date</label>
                        <input 
                          type="date"
                          value={formDate}
                          onChange={(e) => setFormDate(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Category</label>
                      <select
                        value={formCategoryId}
                        onChange={(e) => setFormCategoryId(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                        required
                      >
                        {activeCategories.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.percentage}%)</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm shadow-orange-500/10 whitespace-nowrap"
                    >
                      Log Historical Expense
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>

          {/* Lower Section: Expenses List Table & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Record List Table */}
            <div className="lg:col-span-2 bg-white border border-borderLight rounded-2xl p-6 shadow-sm flex flex-col min-h-[400px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="font-bold text-darkNavy text-base leading-none">Expense Records</h3>
                
                {/* Search query input */}
                <div className="relative w-full sm:w-60">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                  <input
                    type="text"
                    placeholder="Search expenses by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <RefreshCw size={24} className="animate-spin text-primary" />
                </div>
              ) : filteredExpensesList.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-textMuted py-16 text-center">
                  <CalendarDays size={48} className="mb-4 text-slate-200" />
                  <h4 className="font-bold text-darkNavy text-sm mb-1">No historical data found</h4>
                  <p className="text-xs max-w-[280px] leading-relaxed">No expenses are recorded in this specific category or month. Use the simulator or seed data generator to populate.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] font-bold text-textMuted uppercase tracking-wider">
                        <th className="pb-3 pl-2">Name</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3 text-right">Amount</th>
                        <th className="pb-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredExpensesList.map((expense) => {
                        const date = getExpenseDate(expense);
                        const category = activeCategories.find(c => c.id === expense.categoryId);
                        
                        return (
                          <tr key={expense.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 pl-2 font-semibold text-textDark text-sm">{expense.name}</td>
                            <td className="py-3.5 text-xs text-textMuted font-semibold">
                              {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="py-3.5">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-black/5" style={{ backgroundColor: `${category?.color || '#e2e8f0'}20`, color: category?.color || '#475569' }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category?.color || '#475569' }} />
                                {category?.name || 'General'}
                              </span>
                            </td>
                            <td className="py-3.5 text-right font-extrabold text-darkNavy text-sm">
                              ₹{expense.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </td>
                            <td className="py-3.5 text-center">
                              {expense.isStock ? (
                                <span className="text-[9px] bg-purple-50 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-lg font-bold select-none whitespace-nowrap">
                                  Stock
                                </span>
                              ) : (
                                <button 
                                  onClick={() => removeExpense(expense.id)}
                                  className="text-gray-400 hover:text-danger p-1 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Category Breakdown Sidebar */}
            <div className="bg-white border border-borderLight rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-darkNavy text-base leading-none mb-1">Category Breakdown</h3>
                <p className="text-xs text-textMuted mb-6">Percentage spending distribution across categories for {monthsList[selectedMonth]}.</p>
                
                {filteredExpensesList.length === 0 ? (
                  <div className="py-12 text-center text-textMuted text-xs">
                    No data to represent breakdown.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categoryDistribution.map((item) => {
                      if (item.amount === 0) return null;
                      return (
                        <div key={item.name} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2 font-bold text-slate-700">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                              <span>{item.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-darkNavy">₹{Math.round(item.amount).toLocaleString()}</span>
                              <span className="text-textMuted ml-1.5">({item.percentage.toFixed(0)}%)</span>
                            </div>
                          </div>
                          
                          <div className="w-full bg-slate-50 rounded-full h-2 overflow-hidden border border-slate-100">
                            <div 
                              className="h-full rounded-full transition-all duration-500" 
                              style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default ExpenseHistoryPage;
