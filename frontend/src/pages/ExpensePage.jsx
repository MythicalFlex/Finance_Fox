import React, { useState, useEffect, useRef } from 'react';
import { 
  List, 
  Bell, 
  Plus, 
  Trash2,
  IndianRupee,
  Calendar,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

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

const ExpensePage = () => {
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
  
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [activeTemplateId, setActiveTemplateId] = useState(() => {
    const saved = localStorage.getItem('activeTemplateId');
    return saved ? JSON.parse(saved) : '';
  });
  const [activeCategoryId, setActiveCategoryId] = useState(() => {
    const saved = localStorage.getItem('activeCategoryId');
    return saved ? JSON.parse(saved) : '';
  });

  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      setTemplateDropdownOpen(false);
      setCategoryDropdownOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (activeTemplateId !== '') {
      localStorage.setItem('activeTemplateId', JSON.stringify(activeTemplateId));
    }
  }, [activeTemplateId]);

  useEffect(() => {
    if (activeCategoryId !== '') {
      localStorage.setItem('activeCategoryId', JSON.stringify(activeCategoryId));
    }
  }, [activeCategoryId]);

  const toggleTemplateDropdown = (e) => {
    e.stopPropagation();
    setTemplateDropdownOpen(!templateDropdownOpen);
    setCategoryDropdownOpen(false);
  };

  const toggleCategoryDropdown = (e) => {
    e.stopPropagation();
    setCategoryDropdownOpen(!categoryDropdownOpen);
    setTemplateDropdownOpen(false);
  };

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
          // Only set defaults if no previous selection is saved
          const savedTplId = localStorage.getItem('activeTemplateId');
          const savedCatId = localStorage.getItem('activeCategoryId');
          if (!savedTplId && data.length > 0) {
            const defaultTemp = data[0];
            setActiveTemplateId(defaultTemp.id);
            if (defaultTemp.categories && defaultTemp.categories.length > 0) {
              setActiveCategoryId(defaultTemp.categories[0].id);
            }
          }
          localStorage.setItem('budgetTemplates', JSON.stringify(data));
          return;
        }
      } catch (e) {
        console.error('Failed to fetch templates from backend in ExpensePage, using localStorage fallback', e);
      }
      
      // Fallback
      const saved = localStorage.getItem('budgetTemplates');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSavedTemplates(parsed);
          // Only set defaults if no previous selection is saved
          const savedTplId = localStorage.getItem('activeTemplateId');
          if (!savedTplId && parsed.length > 0) {
            const defaultTemp = parsed[0];
            setActiveTemplateId(defaultTemp.id);
            if (defaultTemp.categories && defaultTemp.categories.length > 0) {
              setActiveCategoryId(defaultTemp.categories[0].id);
            }
          }
        } catch (e) {}
      }
    };

    fetchTemplates();
  }, []);

  const handleTemplateChange = (e) => {
    const id = parseInt(e.target.value);
    setActiveTemplateId(id);
    const temp = savedTemplates.find(t => t.id === id);
    if (temp) {
      if (temp.categories && temp.categories.length > 0) {
        setActiveCategoryId(temp.categories[0].id);
      } else {
        setActiveCategoryId('');
      }
    }
  };

  const activeTemplate = savedTemplates.find(t => t.id === activeTemplateId);
  const activeCategories = activeTemplate?.categories || [];
  
  let currentBudget = 30000;
  let activeCategoryName = 'Overall';
  if (activeTemplate && activeCategoryId) {
    const cat = activeCategories.find(c => c.id === activeCategoryId);
    if (cat) {
      currentBudget = (activeTemplate.income * (cat.percentage || 0)) / 100;
      activeCategoryName = cat.name;
    } else {
      currentBudget = activeTemplate.income || 30000;
    }
  } else if (activeTemplate) {
    currentBudget = activeTemplate.income || 30000;
  }

  const [expenses, setExpenses] = useState([]);

  const fetchExpenses = async () => {
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
      console.error('Failed to fetch expenses from backend', e);
      const saved = localStorage.getItem('expenseLogs');
      if (saved) {
        try {
          setExpenses(JSON.parse(saved));
        } catch (err) {}
      }
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);
  
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  
  useEffect(() => {
    localStorage.setItem('expenseLogs', JSON.stringify(expenses));
  }, [expenses]);



  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (newName && newAmount && activeCategoryId && activeTemplateId) {
      const newExpense = { 
        id: String(Date.now()), 
        name: newName, 
        amount: parseFloat(newAmount), 
        categoryId: activeCategoryId,
        templateId: activeTemplateId
      };

      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      localStorage.setItem('expenseLogs', JSON.stringify(updatedExpenses));
      setNewName('');
      setNewAmount('');

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
        console.error('Failed to save expense to database:', err);
      }
    }
  };

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
      console.error('Failed to delete expense from database:', err);
    }
  };

  const filteredExpenses = expenses.filter(e => e.categoryId === activeCategoryId && e.templateId === activeTemplateId);
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const budgetRemaining = currentBudget - totalExpenses;
  const budgetPercent = Math.min((totalExpenses / currentBudget) * 100, 100);

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
              <SidebarItem dotColor="bg-primary" label="Expenses" active />
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
            <h1 className="text-lg text-textMuted font-medium border-l border-borderLight pl-4 ml-2">Expenses</h1>
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

        <div className="p-6 md:p-8 overflow-y-auto flex-1 w-full">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Expense Tracker</h2>
              <p className="text-textMuted text-sm">Manage and track your daily expenses against your budget for {now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}.</p>
            </div>
            
            {savedTemplates.length > 0 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Active Template Selector */}
                <div className="relative flex items-center bg-white border border-borderLight hover:border-primary/40 transition-all rounded-xl pl-4 pr-10 py-2 shadow-sm group">
                  <div className="w-8 h-8 rounded-lg bg-primaryLight text-primary flex items-center justify-center shrink-0 mr-3 pointer-events-none">
                    <IndianRupee size={16} />
                  </div>
                  <div className="flex flex-col min-w-[120px] max-w-[160px] pointer-events-none">
                    <span className="text-[9px] uppercase font-bold text-textMuted tracking-wider leading-none mb-1">Active Template</span>
                    <span className="font-bold text-darkNavy text-xs truncate">
                      {savedTemplates.find(t => t.id === activeTemplateId)?.name || ''}
                    </span>
                  </div>
                  
                  {/* Chevron Trigger Button */}
                  <button 
                    type="button"
                    onClick={toggleTemplateDropdown}
                    className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center cursor-pointer text-textMuted hover:text-primary transition-colors focus:outline-none"
                    aria-label="Toggle active template dropdown"
                  >
                    <ChevronDown size={14} className={`transition-transform duration-200 ${templateDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
                  </button>

                  {/* Custom Dropdown Menu */}
                  {templateDropdownOpen && (
                    <div 
                      className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-borderLight rounded-xl shadow-xl py-1.5 z-50 animate-fadeIn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {savedTemplates.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setActiveTemplateId(t.id);
                            const temp = savedTemplates.find(x => x.id === t.id);
                            if (temp) {
                              if (temp.categories && temp.categories.length > 0) {
                                setActiveCategoryId(temp.categories[0].id);
                              } else {
                                setActiveCategoryId('');
                              }
                            }
                            setTemplateDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors flex items-center justify-between ${
                            t.id === activeTemplateId 
                              ? 'bg-primaryLight text-primary' 
                              : 'text-darkNavy hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">{t.name}</span>
                          {t.id === activeTemplateId && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category Selector */}
                {activeCategories.length > 0 && (
                  <div className="relative flex items-center bg-white border border-borderLight hover:border-primary/40 transition-all rounded-xl pl-4 pr-10 py-2 shadow-sm group">
                    <div 
                      className="w-3.5 h-3.5 rounded-full shrink-0 mr-3 shadow-sm border border-black/5 transition-transform group-hover:scale-110 pointer-events-none" 
                      style={{ backgroundColor: activeCategories.find(c => c.id === activeCategoryId)?.color || '#3b82f6' }}
                    />
                    <div className="flex flex-col min-w-[120px] max-w-[160px] pointer-events-none">
                      <span className="text-[9px] uppercase font-bold text-textMuted tracking-wider leading-none mb-1">Category</span>
                      <span className="font-bold text-darkNavy text-xs truncate">
                        {activeCategories.find(c => c.id === activeCategoryId)?.name || ''}
                      </span>
                    </div>
                    
                    {/* Chevron Trigger Button */}
                    <button 
                      type="button"
                      onClick={toggleCategoryDropdown}
                      className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center cursor-pointer text-textMuted hover:text-primary transition-colors focus:outline-none"
                      aria-label="Toggle category dropdown"
                    >
                      <ChevronDown size={14} className={`transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
                    </button>

                    {/* Custom Dropdown Menu */}
                    {categoryDropdownOpen && (
                      <div 
                        className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-borderLight rounded-xl shadow-xl py-1.5 z-50 animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {activeCategories.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setActiveCategoryId(c.id);
                              setCategoryDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors flex items-center justify-between ${
                              c.id === activeCategoryId 
                                ? 'bg-primaryLight text-primary' 
                                : 'text-darkNavy hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                              <span className="truncate">{c.name}</span>
                            </div>
                            {c.id === activeCategoryId && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Add Expense & List */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Add Expense Form */}
              <div className="bg-white p-6 rounded-2xl border border-borderLight shadow-sm">
                <form onSubmit={handleAddExpense} className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-textMuted uppercase mb-1">Expense Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Groceries"
                      value={newName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewName(val ? val.charAt(0).toUpperCase() + val.slice(1) : '');
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                    />
                  </div>
                  <div className="sm:w-48">
                    <label className="block text-xs font-bold text-textMuted uppercase mb-1">Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted font-medium">₹</span>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        required
                        min="1"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full sm:w-auto bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-orange-500/20 whitespace-nowrap">
                      Add Expense
                    </button>
                  </div>
                </form>
              </div>

              {/* Expenses List */}
              <div className="bg-white p-6 rounded-2xl border border-borderLight shadow-sm flex flex-col h-full min-h-[300px]">
                <h3 className="font-bold mb-4">Recent Expenses</h3>
                
                {filteredExpenses.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-textMuted py-12">
                    <IndianRupee size={48} className="mb-4 text-gray-200" />
                    <p>No expenses added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                    {filteredExpenses.map((expense) => (
                      <div key={expense.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-gray-200 transition-colors">
                        <div className="font-semibold text-textDark">{expense.name}</div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-darkNavy">₹{expense.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                          {expense.isStock ? (
                            <span className="text-[10px] bg-purple-50 text-purple-600 border border-purple-200 px-2.5 py-1 rounded-lg font-bold select-none whitespace-nowrap">
                              Stock Asset
                            </span>
                          ) : (
                            <button 
                              onClick={() => removeExpense(expense.id)}
                              className="text-gray-400 hover:text-danger p-1.5 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                              aria-label="Remove expense"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-borderLight flex justify-between items-center">
                  <span className="text-textMuted font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">₹{totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Budget Overview */}
            <div className="space-y-6">
              <div className="bg-darkNavy text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <h3 className="font-bold mb-6 text-gray-300">Expense Budget</h3>
                
                <div className="mb-8">
                  <div className="text-xs uppercase font-bold text-gray-400 mb-1">{activeCategoryName} Budget</div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold">₹{currentBudget.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2 font-medium">
                      <span className="text-gray-300">Spent so far</span>
                      <span className={totalExpenses > currentBudget ? "text-danger" : "text-white font-bold"}>
                        ₹{totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${totalExpenses > currentBudget ? 'bg-danger' : 'bg-primary'}`} 
                        style={{ width: `${budgetPercent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{budgetPercent.toFixed(1)}% used</span>
                      <span className={budgetRemaining < 0 ? "text-danger" : "text-successLight"}>
                        {budgetRemaining < 0 ? `Over by ₹${Math.abs(budgetRemaining).toLocaleString()}` : `₹${budgetRemaining.toLocaleString()} left`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExpensePage;
