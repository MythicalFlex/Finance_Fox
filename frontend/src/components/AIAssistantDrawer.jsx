import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  X, 
  Send, 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle 
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

const AIAssistantDrawer = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const [isOpen, setIsOpen] = useState(false);

  const getTopStocksForSavings = (savings) => {
    let affordableStocks = STOCKS_POOL.filter(stock => stock.price <= savings);
    if (affordableStocks.length === 0) {
      affordableStocks = [...STOCKS_POOL].sort((a, b) => a.price - b.price);
    } else {
      affordableStocks.sort((a, b) => b.price - a.price);
    }
    return affordableStocks.slice(0, 3);
  };
  const [chatHistory, setChatHistory] = useState([
    { 
      role: 'ai', 
      content: "Hello! I am your Finance Fox AI Assistant. I can read your budget templates, expense records, and active EMIs to answer questions and run deterministic financial reasoning. Feel free to ask me questions like 'Can I buy a laptop for ₹30,000?', 'What is my savings rate?', or 'Am I over budget?'." 
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [openReasoningIndex, setOpenReasoningIndex] = useState(null);
  const chatBottomRef = useRef(null);
  const drawerRef = useRef(null);

  // Financial Summary State
  const [summaryData, setSummaryData] = useState({
    income: 60000,
    expenses: 0,
    emis: 0,
    netSavings: 60000,
    activeTemplateName: 'Default'
  });

  const suggestionChips = [
    "Can I buy a tablet for ₹15,000?",
    "What is my savings rate?",
    "Am I over budget?",
    "Show my debt load",
    "Can I afford a trip for ₹25,000?",
    "Is my debt ratio safe?"
  ];

  // Auto Scroll Chat
  useEffect(() => {
    if (chatHistory.length > 1 || aiTyping) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, aiTyping]);

  // Fetch metrics on mount and when drawer opens
  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchMetrics();
    }
  }, [isOpen]);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Get active template
      const templateRes = await fetch('http://localhost:5000/api/templates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let income = 60000;
      let templateName = 'Default';
      if (templateRes.ok) {
        const templates = await templateRes.json();
        if (templates.length > 0) {
          templates.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          income = templates[0].income;
          templateName = templates[0].name;
        }
      }

      // Get expenses
      const expenseRes = await fetch('http://localhost:5000/api/expenses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let totalExpenses = 0;
      if (expenseRes.ok) {
        const expenses = await expenseRes.json();
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const currentMonthExpenses = expenses.filter(e => {
          const date = e.date ? new Date(e.date) : (e.createdAt ? new Date(e.createdAt) : new Date());
          return date >= startOfMonth;
        });
        totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
      }

      // Get EMIs
      const emiRes = await fetch('http://localhost:5000/api/emis', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let totalEMIs = 0;
      if (emiRes.ok) {
        const emis = await emiRes.json();
        const activeEMIs = emis.filter(e => Number(e.paidTenure) < Number(e.totalTenure));
        totalEMIs = activeEMIs.reduce((sum, e) => sum + Number(e.amount), 0);
      }

      setSummaryData({
        income,
        expenses: totalExpenses,
        emis: totalEMIs,
        netSavings: income - totalExpenses - totalEMIs,
        activeTemplateName: templateName
      });
    } catch (e) {
      console.error('Failed to fetch user metrics in AI Assistant Drawer:', e);
    }
  };

  const handleSendChat = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || aiTyping) return;

    const userText = chatInput.trim();
    setChatInput('');
    await executeChat(userText);
  };

  const handleSendSuggestion = async (text) => {
    if (aiTyping) return;
    await executeChat(text);
  };

  const executeChat = async (textToSend) => {
    setChatHistory(prev => [...prev, { role: 'user', content: textToSend }]);
    setAiTyping(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: textToSend })
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, {
          role: 'ai',
          content: data.explanation,
          structuredResponse: {
            intent: data.intent,
            calculations: data.calculations,
            structuredAdvice: data.structuredAdvice
          }
        }]);
        fetchMetrics();
      } else {
        const errorData = await response.json();
        setChatHistory(prev => [...prev, {
          role: 'ai',
          content: `Error: ${errorData.error || 'Failed to connect with financial assistant.'}`
        }]);
      }
    } catch (err) {
      console.error('AI chat fetch error:', err);
      setChatHistory(prev => [...prev, {
        role: 'ai',
        content: "Oops! I encountered an error trying to connect to the server. Please make sure the backend is running."
      }]);
    } finally {
      setAiTyping(false);
    }
  };

  const toggleReasoning = (index) => {
    setOpenReasoningIndex(openReasoningIndex === index ? null : index);
  };

  // Close drawer when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(e.target) && !e.target.closest('.ask-fox-btn')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 group ask-fox-btn">
        {/* Tooltip / Popup */}
        {!isOpen && (
          <div className="absolute right-0 bottom-full mb-3 hidden group-hover:flex flex-col items-center animate-fadeIn pointer-events-none">
            <div className="bg-darkNavy text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xl border border-slate-700/50 whitespace-nowrap flex items-center gap-2">
              <span className="text-sm">🦊</span>
              <span>Ask Fox</span>
            </div>
            {/* Tooltip Arrow */}
            <div className="w-2.5 h-2.5 bg-darkNavy border-r border-b border-slate-700/50 rotate-45 -mt-1.5" />
          </div>
        )}

        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className={`w-14 h-14 bg-darkNavy rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 relative ${isOpen ? 'ring-2 ring-primary ring-offset-2' : 'group-hover:shadow-primary/20 group-hover:shadow-2xl'}`}
          aria-label="Toggle AI Financial Assistant"
        >
          {isOpen ? (
            <X className="text-primary w-6 h-6 animate-fadeIn" />
          ) : (
            <img src="/logo.png" alt="Fox Logo" className="w-8 h-8 object-contain select-none" />
          )}
          {!isOpen && (
            <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-primary rounded-full border-2 border-darkNavy animate-pulse"></div>
          )}
        </button>
      </div>

      {/* Slide-in Drawer Window */}
      <div 
        ref={drawerRef}
        className={`fixed top-0 right-0 h-screen w-full sm:w-[440px] bg-white border-l border-borderLight shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primaryLight text-primary flex items-center justify-center shadow-inner">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-darkNavy text-sm leading-none flex items-center gap-1.5">
                Finance Fox AI
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
              </h3>
              <p className="text-[9px] text-textMuted mt-0.5 font-bold uppercase tracking-wider">Gemini Reasoning Engine</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-textMuted hover:text-darkNavy transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Metrics Quick View */}
        <div className="bg-slate-55 bg-slate-50/50 border-b border-gray-100 px-4 py-3 flex-shrink-0">
          <div className="flex justify-between items-center text-[10px] text-textMuted uppercase font-bold mb-1.5">
            <span>Live Profile Summary</span>
            <span className="text-primary font-black">{summaryData.activeTemplateName}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
            <div className="bg-white p-1.5 rounded border border-slate-100/80">
              <div className="text-[8px] text-textMuted uppercase font-semibold">Income</div>
              <div className="font-bold text-darkNavy truncate">₹{summaryData.income.toLocaleString()}</div>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-100/80">
              <div className="text-[8px] text-textMuted uppercase font-semibold">Expenses</div>
              <div className="font-bold text-rose-500 truncate">₹{summaryData.expenses.toLocaleString()}</div>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-100/80">
              <div className="text-[8px] text-textMuted uppercase font-semibold">Surplus</div>
              <div className={`font-bold truncate ${summaryData.netSavings >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                ₹{summaryData.netSavings.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fadeIn`}>
              <span className="text-[8px] uppercase font-bold text-textMuted tracking-wider mb-0.5">
                {msg.role === 'user' ? 'You' : 'Fox Assistant'}
              </span>
              
              <div className={`p-3 rounded-2xl max-w-[90%] leading-relaxed shadow-sm text-xs ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none font-medium' 
                  : 'bg-slate-50 text-textDark rounded-tl-none font-medium border border-slate-100'
              }`}>
                <p className="whitespace-pre-line">{msg.content}</p>
                {msg.role === 'ai' && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 text-[9px] text-textMuted italic leading-tight">
                    Investments in securities market are subject to market risks , read all documents carefully before investing
                  </div>
                )}
              </div>
              
              {/* Reasoning & Advice (Only inside drawer context) */}
              {msg.role === 'ai' && msg.structuredResponse && (
                <div className="mt-2 w-full max-w-[90%] space-y-2">
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-55 bg-slate-50/50 shadow-inner">
                    <button
                      type="button"
                      onClick={() => toggleReasoning(index)}
                      className="w-full px-3 py-1.5 flex justify-between items-center text-[9px] font-extrabold text-slate-500 uppercase hover:bg-slate-100 transition-colors"
                    >
                      <span className="flex items-center gap-1">🔍 Reasoning Step</span>
                      <span>{openReasoningIndex === index ? 'Hide ▲' : 'View ▼'}</span>
                    </button>
                    
                    {openReasoningIndex === index && (
                      <div className="p-3 border-t border-slate-200 text-[11px] space-y-2.5 bg-white text-textMuted font-semibold animate-fadeIn">
                        <div>
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider block mb-0.5">Intent</span>
                          <span className="inline-block px-2 py-0.5 bg-primaryLight text-primary rounded-full font-black text-[9px] uppercase">
                            {msg.structuredResponse.intent}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider block mb-0.5">Variables</span>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 font-mono text-[9px] bg-slate-50 p-2 rounded border border-slate-100 text-slate-600">
                            <div>Income:</div>
                            <div className="text-right text-darkNavy">₹{msg.structuredResponse.calculations.income.toLocaleString()}</div>
                            <div>Expenses:</div>
                            <div className="text-right text-darkNavy">₹{msg.structuredResponse.calculations.totalExpenses.toLocaleString()}</div>
                            <div>EMIs:</div>
                            <div className="text-right text-darkNavy">₹{msg.structuredResponse.calculations.totalEMIs.toLocaleString()}</div>
                            <div>Net Savings:</div>
                            <div className="text-right text-primary font-black">₹{msg.structuredResponse.calculations.netSavings.toLocaleString()}</div>
                          </div>
                        </div>

                        {msg.structuredResponse.intent === 'affordability' && (
                          <div className="bg-slate-50 p-2 rounded border border-slate-100 font-mono text-[9px] text-darkNavy space-y-0.5">
                            <div>Target Price: <strong>₹{msg.structuredResponse.calculations.targetAmount?.toLocaleString()}</strong></div>
                            <div>Affordable: <strong>{msg.structuredResponse.calculations.affordable ? 'Yes' : 'No'}</strong></div>
                            <div>Timeline: <strong>{msg.structuredResponse.calculations.monthsNeeded} month(s)</strong></div>
                          </div>
                        )}
                        {msg.structuredResponse.intent === 'savings_rate' && (
                          <div className="bg-slate-50 p-2 rounded border border-slate-100 font-mono text-[9px] text-darkNavy space-y-0.5">
                            <div>Savings Rate: <strong>{msg.structuredResponse.calculations.savingsRate}%</strong></div>
                            <div>Rating: <strong>{msg.structuredResponse.calculations.rating}</strong></div>
                          </div>
                        )}
                        {msg.structuredResponse.intent === 'debt_load' && (
                          <div className="bg-slate-50 p-2 rounded border border-slate-100 font-mono text-[9px] text-darkNavy space-y-0.5">
                            <div>EMI Ratio: <strong>{msg.structuredResponse.calculations.emiRatio}%</strong></div>
                            <div>Total Debt: <strong>₹{msg.structuredResponse.calculations.totalOutstandingDebt?.toLocaleString()}</strong></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {msg.structuredResponse.structuredAdvice && msg.structuredResponse.structuredAdvice.length > 0 && (
                    <div className="space-y-1">
                      {msg.structuredResponse.structuredAdvice.map((adv, idx) => (
                        <div
                          key={idx}
                          className={`px-3 py-2 rounded-xl text-[10px] font-bold border flex items-start gap-2 leading-relaxed shadow-sm ${
                            adv.type === 'success'
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                              : adv.type === 'warning'
                              ? 'bg-amber-50 border-amber-100 text-amber-700'
                              : adv.type === 'danger'
                              ? 'bg-rose-50 border-rose-100 text-rose-700'
                              : 'bg-blue-50 border-blue-100 text-blue-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1 ${
                            adv.type === 'success'
                              ? 'bg-emerald-500'
                              : adv.type === 'warning'
                              ? 'bg-amber-500'
                              : adv.type === 'danger'
                              ? 'bg-rose-500'
                              : 'bg-blue-500'
                          }`} />
                          <span className="flex-1">{adv.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {aiTyping && (
            <div className="flex items-center gap-1 bg-slate-100 p-2.5 rounded-2xl w-14 justify-center">
              <span className="w-1 h-1 rounded-full bg-current animate-bounce" />
              <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
              <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input & Suggestions Footer */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0 bg-white">
          {/* Quick suggestions */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar scroll-smooth">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendSuggestion(chip)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 hover:border-primary/20 hover:text-primary transition-all rounded-full whitespace-nowrap text-[9px] text-textMuted font-black uppercase shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Form input */}
          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask Finance Fox AI..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-darkNavy"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || aiTyping}
              className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1 shrink-0"
            >
              <span>Ask</span>
              <Send size={11} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AIAssistantDrawer;
