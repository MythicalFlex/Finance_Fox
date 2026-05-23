import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { 
  List, Bell, Plus, Trash2, Home, Heart, Briefcase, TrendingUp, IndianRupee, AlertCircle, Edit2, Check, Save, X
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

const colorOptions = ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#14b8a6'];

const iconComponents = {
  Home: Home,
  Heart: Heart,
  Briefcase: Briefcase,
  TrendingUp: TrendingUp,
  IndianRupee: IndianRupee,
  AlertCircle: AlertCircle
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-darkNavy text-white p-3 rounded-xl shadow-xl border border-slate-700 z-50 relative">
        <p className="font-bold text-sm mb-1">{data.name}</p>
        <p className="text-primaryLight text-xs">{data.value}% (₹{data.amount.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})})</p>
      </div>
    );
  }
  return null;
};

const CategoryRow = ({
  cat,
  income,
  editingId,
  editName,
  setEditName,
  saveEditing,
  startEditing,
  handleColorChange,
  handleAmountChange,
  handlePercentageChange,
  handleDeleteCategory
}) => {
  const IconComp = iconComponents[cat.icon] || IndianRupee;
  const amount = (income * (cat.percentage || 0)) / 100;

  const [localAmount, setLocalAmount] = useState('');
  const [localPercent, setLocalPercent] = useState('');
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isPercentFocused, setIsPercentFocused] = useState(false);

  useEffect(() => {
    if (!isAmountFocused) {
      setLocalAmount(parseFloat(amount.toFixed(4)).toString());
    }
  }, [amount, isAmountFocused]);

  useEffect(() => {
    if (!isPercentFocused) {
      setLocalPercent(parseFloat(cat.percentage.toFixed(4)).toString());
    }
  }, [cat.percentage, isPercentFocused]);

  const onAmountChange = (e) => {
    const val = e.target.value;
    setLocalAmount(val);
    handleAmountChange(cat.id, val);
  };

  const onPercentChange = (e) => {
    const val = e.target.value;
    setLocalPercent(val);
    handlePercentageChange(cat.id, val);
  };

  return (
    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-gray-200 hover:shadow-sm">
      
      <div className="flex items-center gap-4 flex-1 w-full">
        <div className="relative group cursor-pointer w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm transition-transform hover:scale-105" style={{ backgroundColor: cat.color }}>
          <IconComp size={20} />
          <div className="absolute top-14 left-0 bg-white border border-gray-200 p-2 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-20 flex flex-wrap gap-1 w-32">
            {colorOptions.map(color => (
              <button key={color} onClick={() => handleColorChange(cat.id, color)} className="w-6 h-6 rounded-full border-2 border-transparent hover:border-darkNavy transition-all" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          {editingId === cat.id ? (
            <div className="flex items-center gap-2 mb-1">
              <input 
                autoFocus
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border-b-2 border-primary bg-transparent outline-none font-bold text-darkNavy text-sm w-full max-w-[150px]"
                onKeyDown={(e) => e.key === 'Enter' && saveEditing(cat.id)}
                onBlur={() => saveEditing(cat.id)}
              />
              <button onClick={() => saveEditing(cat.id)} className="text-success p-1 hover:bg-green-100 rounded-lg transition-colors"><Check size={16}/></button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-darkNavy text-sm truncate">{cat.name}</span>
              <button onClick={() => startEditing(cat)} className="text-gray-400 hover:text-primary p-1 rounded hover:bg-gray-200 transition-colors"><Edit2 size={12}/></button>
            </div>
          )}
          
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(cat.percentage, 100)}%`, backgroundColor: cat.color }}></div>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-3 justify-between md:justify-end w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-0 border-gray-200">
        <div className="flex flex-col items-start md:items-end">
          <span className="text-[10px] uppercase text-textMuted font-bold mb-1 tracking-wider">Amount</span>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-textMuted font-bold text-sm">₹</span>
            <input 
              type="number" 
              value={localAmount}
              onChange={onAmountChange}
              onFocus={() => setIsAmountFocused(true)}
              onBlur={() => {
                setIsAmountFocused(false);
                setLocalAmount(parseFloat(amount.toFixed(4)).toString());
              }}
              onWheel={(e) => e.target.blur()}
              className="w-24 sm:w-28 bg-white border border-gray-200 rounded-xl py-2 pl-7 pr-3 text-sm font-bold text-right focus:outline-none focus:border-primary shadow-sm text-darkNavy transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="0" max={income}
            />
          </div>
        </div>
        
        <div className="flex flex-col items-start md:items-end">
          <span className="text-[10px] uppercase text-textMuted font-bold mb-1 tracking-wider">Share</span>
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <input 
                type="number" 
                value={localPercent}
                onChange={onPercentChange}
                onFocus={() => setIsPercentFocused(true)}
                onBlur={() => {
                  setIsPercentFocused(false);
                  setLocalPercent(parseFloat(cat.percentage.toFixed(4)).toString());
                }}
                onWheel={(e) => e.target.blur()}
                className="w-20 bg-white border border-gray-200 rounded-xl py-2 pl-3 pr-7 text-sm font-bold text-center focus:outline-none focus:border-primary shadow-sm text-darkNavy transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="0" max="100"
              />
              <span className="absolute right-3 text-textMuted font-bold text-sm">%</span>
            </div>
            
            <button 
              onClick={() => handleDeleteCategory(cat.id)}
              className="text-gray-400 hover:text-danger p-2 rounded-xl hover:bg-red-50 transition-colors"
              title="Delete Category"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

const BudgetPage = () => {
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
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);
  
  const [income, setIncome] = useState(60000);
  const [categories, setCategories] = useState([
    { id: 1, name: 'Living Costs', percentage: 50, color: '#f97316', icon: 'Home' },
    { id: 2, name: 'Personal Expenses', percentage: 30, color: '#3b82f6', icon: 'Heart' },
    { id: 3, name: 'Savings', percentage: 10, color: '#22c55e', icon: 'Briefcase' },
    { id: 4, name: 'Investments', percentage: 10, color: '#eab308', icon: 'TrendingUp' }
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [saveError, setSaveError] = useState('');
  const [templateToDelete, setTemplateToDelete] = useState(null);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/templates');
      if (response.ok) {
        const data = await response.json();
        setSavedTemplates(data);
        localStorage.setItem('budgetTemplates', JSON.stringify(data));
        return;
      }
    } catch (e) {
      console.error('Failed to fetch templates from backend, using localStorage fallback', e);
    }
    
    // Fallback
    const saved = localStorage.getItem('budgetTemplates');
    if (saved) {
      try {
        setSavedTemplates(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved budget templates');
      }
    } else {
      const legacy = localStorage.getItem('budgetTemplate');
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy);
          const legacyTemp = { id: Date.now(), name: 'My First Template', ...parsed };
          setSavedTemplates([legacyTemp]);
          localStorage.setItem('budgetTemplates', JSON.stringify([legacyTemp]));
          // Try to sync with backend as well
          fetch('http://localhost:5000/api/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(legacyTemp)
          }).catch(() => {});
        } catch (e) {}
      }
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSaveTemplate = () => {
    setNewTemplateName(`Template ${savedTemplates.length + 1}`);
    setSaveError('');
    setShowSaveModal(true);
  };

  const handleTemplateNameChange = (val) => {
    setNewTemplateName(val);
    if (saveError) {
      setSaveError('');
    }
  };

  const confirmSaveTemplate = async () => {
    if (!newTemplateName.trim()) return;

    const nameExists = savedTemplates.some(
      t => t.name.trim().toLowerCase() === newTemplateName.trim().toLowerCase()
    );
    if (nameExists) {
      setSaveError('A template with this name already exists. Please choose a different name.');
      return;
    }
    
    const newTemplate = { id: Date.now(), name: newTemplateName.trim(), income, categories };
    const newSaved = [...savedTemplates, newTemplate];
    
    setSavedTemplates(newSaved);
    localStorage.setItem('budgetTemplates', JSON.stringify(newSaved));
    
    // API Call to save template on backend
    try {
      await fetch('http://localhost:5000/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate)
      });
    } catch (e) {
      console.error('Failed to save template to backend:', e);
    }
    
    setShowSaveModal(false);
    setSaveStatus('Saved!');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const loadTemplate = (template) => {
    if (template.categories) setCategories(template.categories);
    if (template.income) setIncome(template.income);
  };

  const deleteTemplate = async (id) => {
    const newSaved = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(newSaved);
    localStorage.setItem('budgetTemplates', JSON.stringify(newSaved));

    // API Call to delete template from backend
    try {
      await fetch(`http://localhost:5000/api/templates/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.error('Failed to delete template from backend:', e);
    }
  };

  const totalPercentage = categories.reduce((sum, cat) => sum + (parseFloat(cat.percentage) || 0), 0);
  const isBalanced = totalPercentage === 100;

  const handlePercentageChange = (id, newVal) => {
    let val = parseFloat(newVal);
    if (isNaN(val)) val = 0;
    setCategories(categories.map(c => c.id === id ? { ...c, percentage: val } : c));
  };

  const handleAmountChange = (id, newAmount) => {
    let amt = parseFloat(newAmount);
    if (isNaN(amt)) amt = 0;
    const newPct = income > 0 ? (amt / income) * 100 : 0;
    setCategories(categories.map(c => c.id === id ? { ...c, percentage: newPct } : c));
  };

  const handleAddCategory = () => {
    const newId = Date.now();
    setCategories([...categories, {
      id: newId,
      name: 'New Category',
      percentage: 0,
      color: colorOptions[categories.length % colorOptions.length],
      icon: 'IndianRupee'
    }]);
    setEditingId(newId);
    setEditName('New Category');
  };

  const handleDeleteCategory = (id) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const startEditing = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const saveEditing = (id) => {
    if (editName.trim()) {
      setCategories(categories.map(c => c.id === id ? { ...c, name: editName } : c));
    }
    setEditingId(null);
  };

  const handleColorChange = (id, color) => {
    setCategories(categories.map(c => c.id === id ? { ...c, color } : c));
  };

  const chartData = useMemo(() => {
    return categories.map(c => ({
      name: c.name,
      value: parseFloat(c.percentage) || 0,
      color: c.color,
      amount: (income * (parseFloat(c.percentage) || 0)) / 100
    })).filter(c => c.value > 0);
  }, [categories, income]);

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
              <SidebarItem dotColor="bg-primary" label="Budget" active />
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
        <header className="h-16 bg-white border-b border-borderLight flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-textMuted" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <List size={24} />
            </button>
            <h1 className="text-lg text-textMuted font-medium border-l border-borderLight pl-4 ml-2">Budget Planner</h1>
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

        <div className="p-6 md:p-8 overflow-y-auto max-w-6xl mx-auto w-full">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Budget Planner</h2>
              <p className="text-textMuted text-sm">Allocate your monthly income into customizable percentage-based categories.</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-borderLight shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 text-success flex items-center justify-center shrink-0">
                <IndianRupee size={20} />
              </div>
              <div>
                <p className="text-xs text-textMuted font-bold uppercase">Monthly Income</p>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-lg text-darkNavy">₹</span>
                  <input 
                    type="number" 
                    value={income}
                    onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                    onWheel={(e) => e.target.blur()}
                    className="font-bold text-lg text-darkNavy bg-transparent outline-none w-28 focus:border-b-2 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {!isBalanced && (
            <div className={`mb-6 p-4 rounded-xl flex items-start sm:items-center gap-3 border ${totalPercentage > 100 ? 'bg-red-50 border-red-200 text-danger' : 'bg-yellow-50 border-yellow-200 text-warning'}`}>
              <AlertCircle size={20} className="shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-sm font-medium">
                {totalPercentage > 100 
                  ? `Warning: You have allocated ${parseFloat(totalPercentage.toFixed(4))}%. Please reduce by ${parseFloat((totalPercentage - 100).toFixed(4))}% (₹${(((totalPercentage - 100) / 100) * income).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}) to balance your budget.`
                  : `Notice: You have only allocated ${parseFloat(totalPercentage.toFixed(4))}%. You still have ${parseFloat((100 - totalPercentage).toFixed(4))}% (₹${(((100 - totalPercentage) / 100) * income).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}) left to allocate.`
                }
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Allocation Rules */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-borderLight shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h3 className="font-bold text-lg">Allocation Rules</h3>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button onClick={handleSaveTemplate} className="flex-1 sm:flex-none text-sm bg-white border border-gray-200 text-textDark hover:bg-gray-50 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm">
                      <Save size={16} className={saveStatus ? "text-success" : "text-textMuted"} /> 
                      <span className={saveStatus ? "text-success" : ""}>{saveStatus || 'Save Template'}</span>
                    </button>
                    <button onClick={handleAddCategory} className="flex-1 sm:flex-none text-sm bg-primaryLight text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm">
                      <Plus size={16} /> Add Category
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {categories.map((cat) => (
                    <CategoryRow
                      key={cat.id}
                      cat={cat}
                      income={income}
                      editingId={editingId}
                      editName={editName}
                      setEditName={setEditName}
                      saveEditing={saveEditing}
                      startEditing={startEditing}
                      handleColorChange={handleColorChange}
                      handleAmountChange={handleAmountChange}
                      handlePercentageChange={handlePercentageChange}
                      handleDeleteCategory={handleDeleteCategory}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Analytics */}
            <div className="space-y-6">
              <div className="bg-darkNavy text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <h3 className="font-bold mb-2">Budget Distribution</h3>
                <p className="text-xs text-gray-400 mb-6">Visual breakdown of your 100% allocation</p>
                
                <div className="h-64 w-full relative">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">No data to display</div>
                  )}
                  {isBalanced && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <span className="block text-2xl font-bold text-white">100%</span>
                        <span className="text-xs text-successLight">Balanced</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex flex-col gap-3 max-h-48 overflow-y-auto no-scrollbar pr-2">
                  {chartData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-slate-800/50 p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }}></div>
                        <span className="text-gray-200 font-medium truncate max-w-[120px]">{data.name}</span>
                      </div>
                      <span className="font-bold text-white">{data.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saved Templates */}
              <div className="bg-white p-6 rounded-2xl border border-borderLight shadow-sm">
                <h3 className="font-bold mb-4">Saved Templates</h3>
                {savedTemplates.length === 0 ? (
                  <div className="text-center py-6 text-textMuted bg-gray-50 rounded-xl border border-gray-100">
                    <Save size={24} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No templates saved yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2 no-scrollbar">
                    {savedTemplates.map((template) => (
                      <div key={template.id} className="border border-gray-100 bg-gray-50 p-4 rounded-xl hover:border-primary/30 transition-colors group relative shadow-sm">
                        <div className="flex flex-col">
                          <span className="font-bold text-darkNavy text-sm pr-6 truncate">{template.name}</span>
                          <span className="text-xs text-textMuted mt-0.5">{(template.categories || []).length} categories • ₹{template.income?.toLocaleString() || 0} income</span>
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                          <button 
                            onClick={() => loadTemplate(template)}
                            className="flex-1 text-xs font-bold text-primary bg-primaryLight py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
                          >
                            Load Template
                          </button>
                        </div>
                        <button 
                          onClick={() => setTemplateToDelete(template)}
                          className="absolute top-3 right-3 text-gray-400 hover:text-danger p-1 rounded hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete Template"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </main>

      {/* Save Template Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-borderLight flex justify-between items-center">
              <h3 className="font-bold text-lg text-darkNavy flex items-center gap-2">
                <Save size={20} className="text-primary" />
                Save Budget Template
              </h3>
              <button 
                onClick={() => setShowSaveModal(false)}
                className="text-textMuted hover:text-danger hover:bg-red-50 p-1.5 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-textMuted uppercase mb-2">Template Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newTemplateName}
                  onChange={(e) => handleTemplateNameChange(e.target.value)}
                  className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all font-semibold text-darkNavy ${saveError ? 'border-danger focus:ring-danger/20 focus:border-danger' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'}`}
                  placeholder="e.g. Vacation Budget"
                />
                {saveError && (
                  <div className="mt-2 text-xs text-danger font-semibold flex items-center gap-1.5 animate-fadeIn">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-blue-400 uppercase">Monthly Income</span>
                  <span className="text-blue-600 font-bold">₹{income.toLocaleString()}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-blue-400 uppercase">Categories</span>
                  <span className="text-blue-600 font-bold">{categories.length}</span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-borderLight bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowSaveModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-textMuted hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSaveTemplate}
                disabled={!newTemplateName.trim()}
                className="px-5 py-2.5 text-sm font-semibold bg-primary text-white hover:bg-orange-600 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Template Modal */}
      {templateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-borderLight flex justify-between items-center">
              <h3 className="font-bold text-lg text-darkNavy flex items-center gap-2">
                <Trash2 size={20} className="text-danger" />
                Delete Template
              </h3>
              <button 
                onClick={() => setTemplateToDelete(null)}
                className="text-textMuted hover:text-danger hover:bg-red-50 p-1.5 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-textMuted font-medium leading-relaxed">
                Are you sure you want to delete the template <strong className="text-darkNavy">"{templateToDelete.name}"</strong>? This will permanently delete the template file from your disk.
              </p>
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex justify-between items-center text-xs">
                <div className="flex flex-col">
                  <span className="font-bold text-red-500 uppercase mb-0.5">Template Name</span>
                  <span className="font-bold text-red-700 truncate max-w-[150px]">{templateToDelete.name}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-bold text-red-500 uppercase mb-0.5">Income</span>
                  <span className="font-bold text-red-700">₹{templateToDelete.income?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-borderLight bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setTemplateToDelete(null)}
                className="px-5 py-2.5 text-sm font-semibold text-textMuted hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  await deleteTemplate(templateToDelete.id);
                  setTemplateToDelete(null);
                }}
                className="px-5 py-2.5 text-sm font-semibold bg-danger text-white hover:bg-red-600 rounded-xl transition-colors shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
