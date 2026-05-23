import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  List, Bell, IndianRupee, ChevronDown, Plus, Trash2, RefreshCw,
  AlertCircle, CheckCircle2, TrendingUp, LineChart, Briefcase, Scale, Layers, Clock
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active, dotColor, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
      active ? 'bg-primaryLight text-primary font-bold' : 'text-textMuted hover:bg-gray-100'
    }`}
  >
    <div className="relative">
      {Icon && <Icon size={18} className={active ? 'text-primary' : 'text-textMuted'} />}
      {dotColor && !Icon && <div className={`w-2.5 h-2.5 rounded-sm ${active ? 'bg-primary' : dotColor}`} />}
    </div>
    <span>{label}</span>
  </button>
);

const STOCKS_POOL = [
  // 1. Tech
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3600, sector: 'Technology' },
  { symbol: 'INFY', name: 'Infosys Limited', price: 1450, sector: 'Technology' },
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2450, sector: 'Technology' },
  { symbol: 'WIPRO', name: 'Wipro Limited', price: 430, sector: 'Technology' },

  // 2. Banking / Finance
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', price: 1550, sector: 'Finance' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', price: 980, sector: 'Finance' },
  { symbol: 'SBIN', name: 'State Bank of India', price: 610, sector: 'Finance' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1780, sector: 'Finance' },

  // 3. Consumer Goods
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2350, sector: 'Consumer Goods' },
  { symbol: 'ITC', name: 'ITC Limited', price: 420, sector: 'Consumer Goods' },
  { symbol: 'TITAN', name: 'Titan Company', price: 3200, sector: 'Consumer Goods' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Limited', price: 2850, sector: 'Consumer Goods' },

  // 4. Automotive
  { symbol: 'TATAMOTORS', name: 'Tata Motors Limited', price: 920, sector: 'Automotive' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India', price: 11200, sector: 'Automotive' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra', price: 1950, sector: 'Automotive' },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Limited', price: 3850, sector: 'Automotive' },

  // 5. Energy
  { symbol: 'TATAPOWER', name: 'Tata Power Company', price: 380, sector: 'Energy' },
  { symbol: 'NTPC', name: 'NTPC Limited', price: 320, sector: 'Energy' },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', price: 230, sector: 'Energy' },
  { symbol: 'ADANIGREEN', name: 'Adani Green Energy', price: 1650, sector: 'Energy' },

  // 6. Healthcare
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', price: 1520, sector: 'Healthcare' },
  { symbol: 'CIPLA', name: 'Cipla Limited', price: 1350, sector: 'Healthcare' },
  { symbol: 'DRREDDY', name: 'Dr. Reddy\'s Laboratories', price: 6100, sector: 'Healthcare' },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals', price: 5900, sector: 'Healthcare' },

  // 7. Telecom / Infrastructure
  { symbol: 'BHARTIAIRTEL', name: 'Bharti Airtel Limited', price: 1150, sector: 'Telecom' },
  { symbol: 'LT', name: 'Larsen & Toubro Limited', price: 3450, sector: 'Telecom' },
  { symbol: 'COALINDIA', name: 'Coal India Limited', price: 440, sector: 'Telecom' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', price: 9600, sector: 'Telecom' }
];

const SECTOR_COLORS = {
  Technology: 'bg-blue-50 text-blue-700 border-blue-200',
  Finance: 'bg-purple-50 text-purple-700 border-purple-200',
  'Consumer Goods': 'bg-pink-50 text-pink-700 border-pink-200',
  Automotive: 'bg-amber-50 text-amber-700 border-amber-200',
  Energy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Healthcare: 'bg-rose-50 text-rose-700 border-rose-200',
  Telecom: 'bg-indigo-50 text-indigo-700 border-indigo-200'
};

const SECTOR_COLORS_DARK = {
  Technology: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  Finance: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
  'Consumer Goods': 'bg-pink-500/15 text-pink-300 border-pink-500/20',
  Automotive: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  Energy: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  Healthcare: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
  Telecom: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20'
};

const getDiversifiedSuggestions = () => {
  const shuffled = [...STOCKS_POOL].sort(() => Math.random() - 0.5);
  const selected = [];
  const sectorCounts = {};

  for (const stock of shuffled) {
    if (selected.length === 10) break;
    const count = sectorCounts[stock.sector] || 0;
    if (count < 2) {
      selected.push(stock);
      sectorCounts[stock.sector] = count + 1;
    }
  }

  // Fallback safe fill
  if (selected.length < 10) {
    for (const stock of shuffled) {
      if (selected.length === 10) break;
      if (!selected.find(s => s.symbol === stock.symbol)) {
        selected.push(stock);
      }
    }
  }

  return selected;
};

const SECTOR_DOT_COLORS = {
  Technology: 'bg-blue-400',
  Finance: 'bg-purple-400',
  'Consumer Goods': 'bg-pink-400',
  Automotive: 'bg-amber-400',
  Energy: 'bg-emerald-400',
  Healthcare: 'bg-rose-400',
  Telecom: 'bg-indigo-400'
};
const getHourlyTopPicks = (currentDate) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();
  const hour = currentDate.getHours();
  
  // A clean numerical seed based on current day and hour
  const seed = year + (month + 1) * 31 + day * 372 + hour * 89;
  
  const pool = [...STOCKS_POOL];
  
  // Seeded LCG random generator
  let tempSeed = seed;
  const seededRandom = () => {
    tempSeed = (tempSeed * 1664525 + 1013904223) % 4294967296;
    return tempSeed / 4294967296;
  };
  
  // Tag elements with random values and sort
  const taggedPool = pool.map(stock => ({
    stock,
    rand: seededRandom()
  }));
  
  taggedPool.sort((a, b) => a.rand - b.rand);
  
  // Take top 10
  return taggedPool.slice(0, 10).map(({ stock }) => {
    const symbolCode = stock.symbol.charCodeAt(0) + stock.symbol.charCodeAt(stock.symbol.length - 1);
    const volumeValue = ((symbolCode * (hour + 1)) % 80 + 10) / 10;
    return {
      ...stock,
      volume: `${volumeValue.toFixed(1)}M`
    };
  });
};

const getHistoricalTimelineData = (symbol, interval, basePrice) => {
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) {
    seed += symbol.charCodeAt(i);
  }

  let pointsCount = 12;
  let labelFormat = (i) => `Point ${i}`;
  
  if (interval === '1D') {
    pointsCount = 24;
    labelFormat = (i) => {
      const hour = Math.floor(9 + (i * 6.5) / 24);
      const minute = Math.round(((9 + (i * 6.5) / 24) % 1) * 60);
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    };
  } else if (interval === '1W') {
    pointsCount = 7;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    labelFormat = (i) => days[i % 7];
  } else if (interval === '1M') {
    pointsCount = 30;
    labelFormat = (i) => `Day ${i + 1}`;
  } else if (interval === '1Y') {
    pointsCount = 12;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    labelFormat = (i) => months[i % 12];
  } else if (interval === 'ALL') {
    pointsCount = 5;
    const years = ['2022', '2023', '2024', '2025', '2026'];
    labelFormat = (i) => years[i % 5];
  }

  const data = [];
  let currentPrice = basePrice * 0.95;
  
  const getNoise = (index, stepSeed) => {
    const val = Math.sin(seed + index * 13 + stepSeed * 37) * 0.5 + Math.cos(seed - index * 7 + stepSeed * 17) * 0.5;
    return val;
  };

  const trend = (seed % 2 === 0 ? 0.002 : 0.005) * (seed % 3 === 0 ? -1 : 1);

  for (let i = 0; i < pointsCount; i++) {
    const noise = getNoise(i, interval.charCodeAt(0));
    const pctChange = trend + noise * 0.02;
    currentPrice = currentPrice * (1 + pctChange);
    
    if (currentPrice < 10) currentPrice = 10;

    data.push({
      label: labelFormat(i),
      price: Math.round(currentPrice * 100) / 100
    });
  }

  if (data.length > 0) {
    const diff = basePrice - data[data.length - 1].price;
    for (let i = 0; i < data.length; i++) {
      const adjustment = (diff * (i + 1)) / data.length;
      data[i].price = Math.round((data[i].price + adjustment) * 100) / 100;
    }
  }

  return data;
};

const getDeterministicStockDetails = (symbol) => {
  let codeSum = 0;
  for (let i = 0; i < symbol.length; i++) {
    codeSum += symbol.charCodeAt(i);
  }
  
  const isPositive = codeSum % 3 !== 0; // 66% positive
  const changeValue = ((codeSum % 40) / 10) + 0.1; // 0.1% to 4.0%
  const changePercent = isPositive ? `+${changeValue.toFixed(2)}%` : `-${changeValue.toFixed(2)}%`;
  
  const points = [];
  const startY = 15;
  points.push({ x: 0, y: startY });
  
  let currentY = startY;
  for (let i = 1; i <= 6; i++) {
    const x = i * 16.6;
    const variance = ((codeSum * i) % 12) - 6; // -6 to +6
    let targetY = currentY + variance;
    
    if (targetY < 2) targetY = 2;
    if (targetY > 28) targetY = 28;
    
    if (i === 6) {
      if (isPositive) {
        targetY = Math.min(targetY, 12);
      } else {
        targetY = Math.max(targetY, 18);
      }
    }
    
    points.push({ x, y: targetY });
    currentY = targetY;
  }
  
  const pathD = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
  
  return {
    isPositive,
    changePercent,
    pathD
  };
};

const StocksPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [now, setNow] = useState(new Date());
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
  
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [activeTemplateId, setActiveTemplateId] = useState(() => {
    const saved = localStorage.getItem('activeTemplateId');
    return saved ? JSON.parse(saved) : '';
  });
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [suggestedStocks, setSuggestedStocks] = useState([]);
  
  // Buying list stores: { symbol, name, price, quantity, sector }
  const [buyingList, setBuyingList] = useState([]);
  
  // Pop-out Modal trending tickers state hooks
  const [selectedTrendingStock, setSelectedTrendingStock] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [timeInterval, setTimeInterval] = useState('1D');

  // Dynamic trending picks state and hourly transition checker
  const [trendingPicks, setTrendingPicks] = useState(() => getHourlyTopPicks(new Date()));
  const lastHourRef = useRef(new Date().getHours());

  useEffect(() => {
    const currentHour = now.getHours();
    if (currentHour !== lastHourRef.current) {
      lastHourRef.current = currentHour;
      setTrendingPicks(getHourlyTopPicks(now));
      showToast('Trending picks dynamically rotated for the new hour! 🕒', 'success');
    }
  }, [now]);

  const profileRef = useRef(null);
  const templateDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Clock updates
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Dropdown dismissal
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

  // Show customized toasts
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/templates');
        if (response.ok) {
          const data = await response.json();
          setSavedTemplates(data);
          const savedTplId = localStorage.getItem('activeTemplateId');
          if (!savedTplId && data.length > 0) {
            setActiveTemplateId(data[0].id);
          }
          localStorage.setItem('budgetTemplates', JSON.stringify(data));
          return;
        }
      } catch (e) {
        console.error('Failed to fetch templates in StocksPage, checking localStorage fallback', e);
      }
      
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
    };

    fetchTemplates();
    setSuggestedStocks(getDiversifiedSuggestions());
  }, []);

  // Re-sync template configuration when template selection changes
  useEffect(() => {
    if (activeTemplateId !== '') {
      localStorage.setItem('activeTemplateId', JSON.stringify(activeTemplateId));
    }
  }, [activeTemplateId]);

  // Sync buyingList to localStorage
  useEffect(() => {
    localStorage.setItem('stocksBuyingList', JSON.stringify(buyingList));
  }, [buyingList]);

  // Load stocks for the active template from backend persistence
  useEffect(() => {
    if (!activeTemplateId || savedTemplates.length === 0) return;

    const loadStocks = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/stocks/${activeTemplateId}`);
        if (response.ok) {
          const list = await response.json();
          setBuyingList(list);
          if (investmentCategory) {
            syncBuyingListToExpenses(list);
          }
        }
      } catch (err) {
        console.error('Failed to load stocks from backend:', err);
      }
    };

    loadStocks();
  }, [activeTemplateId, savedTemplates]);

  // Derived budget values
  const activeTemplate = savedTemplates.find(t => t.id === activeTemplateId) || savedTemplates[0];
  const monthlyIncome = activeTemplate?.income || 0;
  
  // Find Investments category
  const investmentCategory = activeTemplate?.categories?.find(c =>
    c.name.toLowerCase().includes('invest')
  ) || activeTemplate?.categories?.find(c => c.icon === 'TrendingUp');

  const investmentPercentage = investmentCategory ? investmentCategory.percentage : 0;
  const investmentBudget = (monthlyIncome * investmentPercentage) / 100;
  const investmentRatio = monthlyIncome > 0 ? (investmentBudget / monthlyIncome) * 100 : 0;

  // Calculate Buying List totals
  const totalCuratedCost = buyingList.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const remainingBudget = investmentBudget - totalCuratedCost;

  // Sync stocks in Buying List to global expense logs
  const syncBuyingListToExpenses = (newBuyingList) => {
    if (!investmentCategory || !activeTemplateId) return;

    try {
      const savedLogs = localStorage.getItem('expenseLogs');
      let logs = savedLogs ? JSON.parse(savedLogs) : [];

      // Filter out all existing stock expenses for this active template + investment category
      logs = logs.filter(
        log =>
          !(
            log.templateId === activeTemplateId &&
            log.categoryId === investmentCategory.id &&
            log.isStock === true
          )
      );

      // Map Buying List items into stock expense objects
      const newStockExpenses = newBuyingList.map(item => ({
        id: `stock-${item.symbol}-${activeTemplateId}`,
        name: `${item.symbol} Stock (${item.quantity} shares)`,
        amount: item.price * item.quantity,
        categoryId: investmentCategory.id,
        templateId: activeTemplateId,
        isStock: true,
        stockSymbol: item.symbol
      }));

      // Merge and save
      const updatedLogs = [...logs, ...newStockExpenses];
      localStorage.setItem('expenseLogs', JSON.stringify(updatedLogs));
    } catch (e) {
      console.error('Error syncing buying list to expense logs:', e);
    }
  };

  // Helper to save stocks list to backend
  const saveStocksToBackend = async (list) => {
    if (!activeTemplateId) return;
    try {
      await fetch(`http://localhost:5000/api/stocks/${activeTemplateId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(list)
      });
    } catch (err) {
      console.error('Failed to save stocks to backend:', err);
    }
  };

  // Helper to update list, sync to global expenses and persist to backend
  const updateBuyingListAndSync = (newList) => {
    setBuyingList(newList);
    syncBuyingListToExpenses(newList);
    saveStocksToBackend(newList);
  };

  // Add stock to Buying List
  const handleAddStock = (stock) => {
    if (!investmentCategory) {
      return showToast('Please add an "Investments" category to your active template first!', 'error');
    }

    const existing = buyingList.find(s => s.symbol === stock.symbol);
    const addedCost = stock.price;

    if (totalCuratedCost + addedCost > investmentBudget) {
      return showToast(
        `Action Blocked: Adding ${stock.symbol} exceeds your remaining Investment budget of ₹${remainingBudget.toLocaleString('en-IN')}!`,
        'error'
      );
    }

    let updatedList;
    if (existing) {
      updatedList = buyingList.map(s =>
        s.symbol === stock.symbol ? { ...s, quantity: s.quantity + 1 } : s
      );
    } else {
      updatedList = [...buyingList, { ...stock, quantity: 1 }];
    }

    updateBuyingListAndSync(updatedList);
    showToast(`Added ${stock.symbol} to your curated Buying List. 📈`, 'success');
  };

  // Update quantity of stock in list
  const handleUpdateQuantity = (symbol, delta) => {
    const item = buyingList.find(s => s.symbol === symbol);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      handleRemoveStock(symbol);
      return;
    }

    const costDifference = item.price * delta;
    if (costDifference > 0 && totalCuratedCost + costDifference > investmentBudget) {
      return showToast(
        `Blocked: Upgrading ${symbol} count exceeds your remaining Investment budget!`,
        'error'
      );
    }

    const updatedList = buyingList.map(s =>
      s.symbol === symbol ? { ...s, quantity: newQty } : s
    );

    updateBuyingListAndSync(updatedList);
  };

  // Remove stock from Buying List
  const handleRemoveStock = (symbol) => {
    const updatedList = buyingList.filter(s => s.symbol !== symbol);
    updateBuyingListAndSync(updatedList);
    showToast(`Removed ticker ${symbol} from Buying List.`, 'success');
  };

  // Refresh suggested stocks batch
  const handleRefreshSuggestions = () => {
    setSuggestedStocks(getDiversifiedSuggestions());
    showToast('Suggestions refreshed with balanced sector diversity! 🔄', 'success');
  };

  // Generate dynamic advisory content based strictly on Investment & Monthly Income
  const getAdvisorNode = () => {
    if (!investmentCategory) {
      return (
        <div className="flex items-start gap-3.5 p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 shadow-sm animate-fadeIn">
          <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">No Investment Category Detected</h4>
            <p className="text-xs opacity-90 mt-0.5">
              The active template <strong>"{activeTemplate?.name || 'Default'}"</strong> lacks an allocated <strong>"Investments"</strong> category. Navigate to the <strong>Budget</strong> section to create one with a custom percentage.
            </p>
          </div>
        </div>
      );
    }

    if (investmentRatio < 10) {
      return (
        <div className="flex items-start gap-3.5 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 shadow-sm animate-fadeIn">
          <AlertCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Investment Allocation is Low ({investmentRatio.toFixed(0)}%)</h4>
            <p className="text-xs opacity-90 mt-0.5">
              Your monthly allocation of <strong>₹{investmentBudget.toLocaleString('en-IN')}</strong> is low relative to your monthly income of <strong>₹{monthlyIncome.toLocaleString('en-IN')}</strong>. Wealth accumulation experts suggest allocating at least 10% to 20% to savings and investments. Consider increasing your investment budget template allocation.
            </p>
          </div>
        </div>
      );
    } else if (investmentRatio > 25) {
      return (
        <div className="flex items-start gap-3.5 p-4 rounded-2xl border border-purple-200 bg-purple-50 text-purple-800 shadow-sm animate-fadeIn">
          <AlertCircle size={20} className="text-purple-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Investment Allocation is Aggressive ({investmentRatio.toFixed(0)}%)</h4>
            <p className="text-xs opacity-90 mt-0.5">
              Your monthly allocation of <strong>₹{investmentBudget.toLocaleString('en-IN')}</strong> is extremely high relative to your monthly income of <strong>₹{monthlyIncome.toLocaleString('en-IN')}</strong>. While aggressive investing builds compounding assets quickly, ensure you retain adequate liquidity to fund your daily living templates.
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-start gap-3.5 p-4 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800 shadow-sm animate-fadeIn">
          <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Perfect Investment Balance ({investmentRatio.toFixed(0)}%)</h4>
            <p className="text-xs opacity-90 mt-0.5">
              Your monthly allocation of <strong>₹{investmentBudget.toLocaleString('en-IN')}</strong> is in the ideal, disciplined range (10% to 25%) relative to your monthly income. You are building compound interest safely while honoring essential cost allocations. Excellent job!
            </p>
          </div>
        </div>
      );
    }
  };

  // Evaluate diversification quality of the current Buying List
  const getDiversificationScore = () => {
    if (buyingList.length === 0) return { label: 'Empty', color: 'text-textMuted bg-gray-100' };
    const sectors = new Set(buyingList.map(s => s.sector));
    const score = sectors.size;
    
    if (score >= 4) return { label: 'Highly Diversified', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (score >= 2) return { label: 'Moderately Diversified', color: 'text-purple-700 bg-purple-50 border-purple-200' };
    return { label: 'Unbalanced (Concentration Risk)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const divScore = getDiversificationScore();
  const formatCurrency = (val) => '₹' + Math.round(val).toLocaleString('en-IN');

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
              <SidebarItem dotColor="bg-primary" label="Stocks" active onClick={() => navigate('/stocks')} />
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

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-borderLight flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-textMuted" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <List size={24} />
            </button>
            <h1 className="text-lg text-textMuted font-medium border-l border-borderLight pl-4 ml-2">Wealth & Stocks</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Active Template Selector */}
            <div className="relative" ref={templateDropdownRef}>
              <button
                onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-bold text-darkNavy flex items-center gap-1.5 focus:outline-none transition-colors"
              >
                <span>Template: {activeTemplate?.name || 'Loading...'}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${templateDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {templateDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-borderLight rounded-xl shadow-xl py-1.5 z-50 animate-fadeIn">
                  {savedTemplates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTemplateId(t.id);
                        setTemplateDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 transition-colors ${activeTemplateId === t.id ? 'text-primary bg-primaryLight/20' : 'text-slate-700'}`}
                    >
                      {t.name} (₹{t.income.toLocaleString('en-IN')})
                    </button>
                  ))}
                </div>
              )}
            </div>

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
                  <button className="w-full text-left px-4 py-2.5 text-xs font-semibold text-primary hover:bg-primaryLight transition-colors" onClick={handleSignOut}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 w-full max-w-7xl mx-auto">
          {/* Welcome Message */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1 text-darkNavy">Stock Portfolio Architect</h2>
            <p className="text-textMuted text-sm">Deploy your Investment budget directly into diversified stock recommendations and log them seamlessly to expenses.</p>
          </div>

          {/* Allocation Advisor Advisory Banners */}
          <div className="mb-8">
            {getAdvisorNode()}
          </div>

          {/* Core Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* LEFT COLUMN: Curated Buying List & Trending Stocks Dashboard */}
            <div className="lg:col-span-1 space-y-8">
              
              {/* Curated Buying List Card */}
              <div className="bg-white rounded-3xl border border-borderLight/80 shadow-lg p-6 space-y-6 relative overflow-hidden">
                {/* Soft decorative accent for Buying List */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-500" />
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                      <Briefcase size={16} className="animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-darkNavy text-base leading-none tracking-tight">Buying List</h3>
                      <p className="text-[10px] text-textMuted mt-1 font-bold uppercase tracking-wider">Your Wealth Cart</p>
                    </div>
                  </div>
                  {buyingList.length > 0 && (
                    <span className={`text-[10px] font-extrabold border px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors ${divScore.color}`}>
                      {divScore.label}
                    </span>
                  )}
                </div>

                {buyingList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-textMuted mb-4 shadow-inner relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-slate-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Scale size={24} className="text-slate-400 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
                    </div>
                    <h4 className="font-bold text-darkNavy text-sm mb-1 tracking-tight">Your buying list is empty</h4>
                    <p className="text-xs text-textMuted max-w-[200px] leading-relaxed">Review suggested stocks on the right to add tickers to your wealth cart.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                    {buyingList.map(item => (
                      <div key={item.symbol} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 hover:border-primary/20 hover:shadow-md transition-all duration-300 group">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-darkNavy tracking-tight group-hover:text-primary transition-colors duration-300">{item.symbol}</span>
                            <span className={`text-[9px] font-bold tracking-wider uppercase border px-1.5 py-0.5 rounded-full ${
                              SECTOR_COLORS[item.sector] || 'bg-slate-100 text-slate-600'
                            }`}>{item.sector}</span>
                          </div>
                          <span className="text-[11px] text-textMuted truncate max-w-[130px] block mt-0.5 font-medium" title={item.name}>{item.name}</span>
                          <span className="text-sm font-black text-darkNavy block mt-1 tracking-tight">{formatCurrency(item.price * item.quantity)}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Quantity controls */}
                          <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden p-0.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.symbol, -1)}
                              className="w-7 h-7 flex items-center justify-center font-black text-textMuted hover:bg-slate-100 hover:text-darkNavy active:bg-slate-200 text-xs rounded-lg transition-all"
                            >
                              -
                            </button>
                            <span className="px-2.5 text-xs font-black text-darkNavy min-w-[24px] text-center select-none">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.symbol, 1)}
                              className="w-7 h-7 flex items-center justify-center font-black text-textMuted hover:bg-slate-100 hover:text-darkNavy active:bg-slate-200 text-xs rounded-lg transition-all"
                            >
                              +
                            </button>
                          </div>

                          {/* Remove */}
                          <button
                            onClick={() => handleRemoveStock(item.symbol)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200"
                            title="Remove from buying list"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Budget constraints summary */}
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5 text-textMuted font-semibold">
                      <Scale size={14} className="text-slate-400" /> Investment Limit:
                    </span>
                    <span className="text-darkNavy font-extrabold">{formatCurrency(investmentBudget)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5 text-textMuted font-semibold">
                      <TrendingUp size={14} className="text-slate-400" /> Curated Cart Cost:
                    </span>
                    <span className="text-emerald-600 font-extrabold">{formatCurrency(totalCuratedCost)}</span>
                  </div>
                  
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex relative shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out relative ${
                        totalCuratedCost > investmentBudget * 0.9
                          ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                          : totalCuratedCost > investmentBudget * 0.6
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                          : 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      }`}
                      style={{ width: `${Math.min(100, investmentBudget > 0 ? (totalCuratedCost / investmentBudget) * 100 : 0)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-semibold pt-1">
                    <span className="text-textMuted">Remaining Capacity:</span>
                    <span className={`font-black text-xs px-2.5 py-1 rounded-lg transition-colors ${
                      remainingBudget < 0 
                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {remainingBudget >= 0 ? formatCurrency(remainingBudget) : `Over Limit by ${formatCurrency(Math.abs(remainingBudget))}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trending Tickers Dashboard Card */}
              <div className="bg-white rounded-3xl border border-borderLight/80 shadow-lg p-6 space-y-6 relative overflow-hidden">
                {/* Soft decorative accent for Trending Tickers */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center border border-purple-500/20 shadow-inner">
                      <TrendingUp size={16} className="animate-pulse text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-darkNavy text-base leading-none tracking-tight">Trending Tickers</h3>
                      <p className="text-[10px] text-textMuted mt-1 font-bold uppercase tracking-wider">Top 10 Picks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-rose-500 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      Live
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-purple-600 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 shadow-sm" title="Refreshes every hour">
                      <Clock size={10} className="animate-pulse" />
                      {59 - now.getMinutes()}m {59 - now.getSeconds()}s
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                  {trendingPicks.map(stock => {
                    const details = getDeterministicStockDetails(stock.symbol);
                    return (
                      <button
                        key={stock.symbol}
                        type="button"
                        onClick={() => {
                          setSelectedTrendingStock(stock);
                          setTimeInterval('1D');
                          setHoveredIndex(null);
                        }}
                        className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 hover:border-purple-500/20 hover:shadow-md transition-all duration-300 group text-left cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-darkNavy tracking-tight group-hover:text-purple-600 transition-colors duration-300">{stock.symbol}</span>
                            <span className={`text-[9px] font-bold tracking-wider uppercase border px-1.5 py-0.5 rounded-full ${
                              SECTOR_COLORS[stock.sector] || 'bg-slate-100 text-slate-600'
                            }`}>{stock.sector}</span>
                          </div>
                          <span className="text-[11px] text-textMuted truncate max-w-[130px] block mt-0.5 font-medium" title={stock.name}>{stock.name}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center shrink-0">
                            <svg className={`w-14 h-6 ${details.isPositive ? 'text-emerald-500' : 'text-rose-500'}`} viewBox="0 0 100 30" fill="none">
                              <path d={details.pathD} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-darkNavy block tracking-tight">{formatCurrency(stock.price)}</span>
                            <span className={`text-[9px] font-black flex items-center justify-end gap-0.5 ${details.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                              <TrendingUp size={8} className={details.isPositive ? '' : 'rotate-180'} />
                              {details.changePercent}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: suggested stocks batch of 10 inside a separate navy container */}
            <div className="lg:col-span-2 bg-darkNavy rounded-3xl p-6 shadow-xl relative overflow-hidden border border-slate-800/80 space-y-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-inner shrink-0">
                    <LineChart size={20} className="text-purple-400 animate-pulse-glow" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg leading-none tracking-tight">Suggested Diversified Pools</h3>
                    <p className="text-xs text-slate-400 mt-1.5 font-medium">Refreshed batch of 10 stocks tailored to match maximum portfolio diversity</p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleRefreshSuggestions}
                  className="px-4 py-2.5 border border-slate-700/80 hover:border-purple-500/40 text-slate-200 hover:text-white bg-slate-800/40 hover:bg-purple-900/20 rounded-xl text-xs font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] duration-200 flex items-center gap-2 cursor-pointer whitespace-nowrap group/refresh"
                >
                  <RefreshCw size={13} className="animate-spin-slow text-purple-400 group-hover/refresh:text-purple-300" /> Refresh suggestions
                </button>
              </div>

              {/* suggested list grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {suggestedStocks.map(stock => {
                  const isInBuyingList = buyingList.find(s => s.symbol === stock.symbol);
                  const details = getDeterministicStockDetails(stock.symbol);
                  return (
                    <div
                      key={stock.symbol}
                      className={`rounded-2xl border p-5 flex flex-col justify-between hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group ${
                        isInBuyingList 
                          ? 'bg-gradient-to-b from-slate-900/90 to-emerald-950/20 border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/30' 
                          : 'bg-slate-900/40 hover:bg-slate-900/70 border-slate-800/80 hover:border-purple-500/40'
                      }`}
                    >
                      {/* Subtle hover background glow radial gradient */}
                      <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      <div className="flex justify-between items-center mb-1 relative z-10">
                        {/* Premium Sector Badge with circular glowing dot */}
                        <span className={`text-[9px] font-black tracking-wider uppercase border pl-2.5 pr-3 py-1 rounded-full flex items-center gap-1.5 transition-colors ${
                          SECTOR_COLORS_DARK[stock.sector] || 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                            SECTOR_DOT_COLORS[stock.sector] || 'bg-slate-400'
                          }`} />
                          {stock.sector}
                        </span>
                        
                        <div className="text-right">
                          <span className="text-lg font-black text-white tracking-tight">{formatCurrency(stock.price)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3 mb-2 relative z-10">
                        {/* Left: Ticker symbol and dynamic % change pill */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-lg tracking-tight group-hover:text-purple-300 transition-colors duration-300">{stock.symbol}</span>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                              details.isPositive 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' 
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                            }`}>
                              <TrendingUp size={10} className={`inline-block ${details.isPositive ? '' : 'rotate-180 text-rose-400'}`} />
                              {details.changePercent}
                            </span>
                          </div>
                          
                          <span className="text-xs text-slate-400 font-medium block mt-1 truncate max-w-[155px]" title={stock.name}>
                            {stock.name}
                          </span>
                        </div>

                        {/* Right: Sparkline graph with smooth filled gradient */}
                        <div className="flex items-center shrink-0">
                          <svg className={`w-20 h-8 ${details.isPositive ? 'text-emerald-400' : 'text-rose-400'} filter drop-shadow-[0_2px_4px_rgba(16,185,129,0.15)]`} viewBox="0 0 100 30" fill="none">
                            <defs>
                              <linearGradient id={`grad-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <path d={details.pathD} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d={`${details.pathD} L 99.6 30 L 0 30 Z`} fill={`url(#grad-${stock.symbol})`} stroke="none" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-800/60 pt-3.5 mt-2 bg-slate-950/20 -mx-5 px-5 relative z-10 transition-colors group-hover:bg-slate-950/30">
                        <span className="text-[10px] text-slate-400 font-bold select-none tracking-wide">1 share = {formatCurrency(stock.price)}</span>
                        
                        <button
                          type="button"
                          onClick={() => handleAddStock(stock)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black shadow-md transition-all duration-300 flex items-center gap-1.5 cursor-pointer transform active:scale-95 group/btn ${
                            isInBuyingList
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-50 hover:text-white shadow-emerald-950/20'
                              : 'bg-purple-600 text-white hover:bg-purple-500 hover:shadow-purple-500/20 shadow-purple-950/20 hover:scale-[1.03]'
                          }`}
                        >
                          <Plus size={11} className="transition-transform duration-300 group-hover/btn:rotate-90" />
                          {isInBuyingList ? 'Add More' : 'Add to List'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Historical Price Pop-out Modal */}
      {selectedTrendingStock && (() => {
        const basePrice = selectedTrendingStock.price;
        const symbol = selectedTrendingStock.symbol;
        const sector = selectedTrendingStock.sector;
        const name = selectedTrendingStock.name;
        
        const data = getHistoricalTimelineData(symbol, timeInterval, basePrice);
        
        const prices = data.map(d => d.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice || 1;
        
        const svgPoints = data.map((d, idx) => {
          const x = (idx / (data.length - 1)) * 500;
          const y = 170 - ((d.price - minPrice) / priceRange) * 140;
          return { x, y, price: d.price, label: d.label };
        });
        
        const linePath = `M ${svgPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`;
        const areaPath = `${linePath} L 500 200 L 0 200 Z`;
        
        const currentDetails = getDeterministicStockDetails(symbol);
        
        const activePoint = hoveredIndex !== null && svgPoints[hoveredIndex] ? svgPoints[hoveredIndex] : svgPoints[svgPoints.length - 1];
        
        let seed = 0;
        for (let i = 0; i < symbol.length; i++) seed += symbol.charCodeAt(i);
        
        const openPrice = Math.round((minPrice + (seed % 10)) * 100) / 100;
        const highPrice = Math.round(maxPrice * 1.002 * 100) / 100;
        const lowPrice = Math.round(minPrice * 0.998 * 100) / 100;
        const volume = selectedTrendingStock.volume || '3.5M';
        const marketCap = formatCurrency(basePrice * 10000000 * (1 + (seed % 5) * 0.2));
        
        let analysisText = "";
        if (currentDetails.isPositive) {
          analysisText = `The structural trend for ${symbol} remains distinctly bullish over the chosen interval. Supported by steady buying momentum in the ${sector} sector, price consolidation indicates robust demand. Experts recommend monitoring support levels near ${formatCurrency(lowPrice)} for dollar-cost-averaging entries.`;
        } else {
          analysisText = `${symbol} is currently navigating a transient pullback within a broader bearish consolidation. Short-term downside pressures are active, reflecting typical profit-booking in the automotive/consumer segments. Support is holding firmly above ${formatCurrency(lowPrice)}, offering long-term accumulation opportunities.`;
        }
        
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
            onClick={() => setSelectedTrendingStock(null)}
          >
            <div
              className="bg-slate-900/95 border border-slate-800/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-scaleUp text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="p-6 border-b border-slate-800/60 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <LineChart size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-lg text-white leading-none tracking-tight">{symbol}</h3>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        SECTOR_COLORS_DARK[sector] || 'bg-slate-800 text-slate-400'
                      }`}>
                        {sector}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium block mt-1">{name}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedTrendingStock(null)}
                  className="w-9 h-9 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/60 hover:rotate-90 transition-all duration-300 font-bold text-lg"
                  title="Close panel"
                >
                  &times;
                </button>
              </div>
              
              <div className="p-6 space-y-6 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {hoveredIndex !== null ? 'Selected Coordinate' : 'Live Valuation'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white tracking-tight tabular-nums">
                        {formatCurrency(activePoint.price)}
                      </span>
                      <span className={`text-xs font-black flex items-center gap-0.5 ${currentDetails.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <TrendingUp size={11} className={currentDetails.isPositive ? '' : 'rotate-180'} />
                        {currentDetails.changePercent}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1 select-none tabular-nums">
                      Timeline Point: {activePoint.label}
                    </span>
                  </div>
                  
                  <div className="flex bg-slate-950/60 border border-slate-800/60 rounded-xl p-1 shrink-0 select-none">
                    {['1D', '1W', '1M', '1Y', 'ALL'].map(tab => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => {
                          setTimeInterval(tab);
                          setHoveredIndex(null);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wider transition-all cursor-pointer ${
                          timeInterval === tab
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-950/20'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="relative bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 overflow-hidden shadow-inner">
                  <div className="absolute inset-0 grid grid-cols-5 grid-rows-3 opacity-10 pointer-events-none">
                    {[...Array(15)].map((_, i) => (
                      <div key={i} className="border-t border-r border-dashed border-slate-400" />
                    ))}
                  </div>
                  
                  <svg className="w-full h-44 overflow-visible relative z-10" viewBox="0 0 500 200" fill="none">
                    <defs>
                      <linearGradient id={`modal-grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    <path d={areaPath} fill={`url(#modal-grad-${symbol})`} stroke="none" className="transition-all duration-500 ease-out" />
                    
                    <path
                      d={linePath}
                      stroke={currentDetails.isPositive ? '#10b981' : '#f43f5e'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-500 ease-out filter drop-shadow-[0_2px_8px_rgba(168,85,247,0.3)]"
                    />
                    
                    {hoveredIndex !== null && (
                      <>
                        <line
                          x1={svgPoints[hoveredIndex].x}
                          y1="0"
                          x2={svgPoints[hoveredIndex].x}
                          y2="200"
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                        <line
                          x1="0"
                          y1={svgPoints[hoveredIndex].y}
                          x2="500"
                          y2={svgPoints[hoveredIndex].y}
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                        <circle
                          cx={svgPoints[hoveredIndex].x}
                          cy={svgPoints[hoveredIndex].y}
                          r="9"
                          fill="rgba(168, 85, 247, 0.4)"
                          className="animate-pulse"
                        />
                        <circle
                          cx={svgPoints[hoveredIndex].x}
                          cy={svgPoints[hoveredIndex].y}
                          r="4"
                          fill="#ffffff"
                          stroke="#a855f7"
                          strokeWidth="2"
                        />
                      </>
                    )}
                  </svg>
                  
                  <div className="absolute inset-0 flex z-20">
                    {svgPoints.map((_, idx) => (
                      <div
                        key={idx}
                        className="flex-1 h-full cursor-crosshair"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/20 border border-slate-800/40 rounded-2xl p-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Open</span>
                    <span className="text-sm font-extrabold text-white mt-1 block tabular-nums">{formatCurrency(openPrice)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">High / Low</span>
                    <span className="text-sm font-extrabold text-white mt-1 block tabular-nums">
                      {formatCurrency(highPrice)} / {formatCurrency(lowPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Volume</span>
                    <span className="text-sm font-extrabold text-white mt-1 block tabular-nums">{volume}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Est. Market Cap</span>
                    <span className="text-sm font-extrabold text-white mt-1 block tabular-nums">{marketCap}</span>
                  </div>
                </div>
                
                <div className="p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 text-purple-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckCircle2 size={16} className="text-purple-400" />
                    <span className="text-xs font-black tracking-wide uppercase">Finance Fox Analyst Brief</span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-85">{analysisText}</p>
                </div>
              </div>
              
              <div className="p-5 bg-slate-950/40 border-t border-slate-800/60 flex items-center justify-between select-none">
                <span className="text-xs text-slate-400 font-medium">Configure allocation from dashboard</span>
                <button
                  type="button"
                  onClick={() => {
                    const matchedPoolStock = STOCKS_POOL.find(s => s.symbol === symbol);
                    if (matchedPoolStock) {
                      handleAddStock(matchedPoolStock);
                      setSelectedTrendingStock(null);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/20 flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
                >
                  <Plus size={14} /> Add to Wealth Cart
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Floating Action Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3.5 rounded-xl border shadow-xl animate-fadeIn ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : <AlertCircle size={16} className="text-rose-500 shrink-0" />}
          <span className="text-xs font-extrabold">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default StocksPage;
