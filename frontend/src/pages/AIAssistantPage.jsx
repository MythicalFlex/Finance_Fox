import React, { useState, useEffect, useRef } from 'react';
import { 
  List, 
  IndianRupee, 
  Calendar,
  Send,
  Sparkles,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Home,
  FileText,
  PieChart,
  Calculator
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

const AIAssistantPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [userInitials, setUserInitials] = useState('U');
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Chatbot states
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
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Auto Scroll Chat
  useEffect(() => {
    if (chatHistory.length > 1 || aiTyping) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, aiTyping]);

  // Fetch verified user metrics from DB to display alongside
  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get active template
      const templateRes = await fetch('http://localhost:5000/api/templates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let income = 60000;
      let templateName = 'Default';
      if (templateRes.ok) {
        const templates = await templateRes.json();
        if (templates.length > 0) {
          // Sort by updated time
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
      console.error('Failed to fetch user metrics in AI Assistant Page:', e);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

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
        // Refresh metrics if context might have updated
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
              <SidebarItem dotColor="bg-gray-200" label="Overview" onClick={() => navigate('/dashboard')} icon={Home} />
              <SidebarItem dotColor="bg-gray-200" label="Expenses" onClick={() => navigate('/expenses')} icon={List} />
              <SidebarItem dotColor="bg-gray-200" label="Expense History" onClick={() => navigate('/expense-history')} icon={FileText} />
              <SidebarItem dotColor="bg-primary" label="AI Assistant" active icon={Sparkles} />
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
            <h1 className="text-lg text-textMuted font-medium border-l border-borderLight pl-4 ml-2">AI Financial Assistant</h1>
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
                  <div className="mx-3 my-1 border-t border-gray-150" />
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

        {/* Content View */}
        <div className="flex-1 overflow-y-auto w-full">
          <div className="p-6 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Chat Interface */}
          <div className="lg:col-span-3 flex flex-col bg-white border border-borderLight rounded-3xl shadow-lg p-6 h-[calc(100vh-12rem)] min-h-[500px]">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primaryLight text-primary flex items-center justify-center shadow-inner">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-darkNavy text-base leading-none">Conversational AI Center</h3>
                  <p className="text-[10px] text-textMuted mt-1 font-bold uppercase tracking-wider">Gemini 2.5 Flash Reasoning Engine</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-success bg-successLight border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
                API Connected
              </span>
            </div>

            {/* Message Timelines */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 text-sm no-scrollbar">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fadeIn`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] uppercase font-bold text-textMuted tracking-wider">
                      {msg.role === 'user' ? 'You' : 'Finance Fox Assistant'}
                    </span>
                  </div>
                  
                  <div className={`p-4 rounded-2xl max-w-[85%] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none font-medium' 
                      : 'bg-slate-50 text-textDark rounded-tl-none font-medium border border-slate-100'
                  }`}>
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                  
                  {/* Collapsible reasoning drawers and advice */}
                  {msg.role === 'ai' && msg.structuredResponse && (
                    <div className="mt-3 w-full max-w-[85%] space-y-2">
                      
                      {/* Collapsible reasoning details */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-inner">
                        <button
                          type="button"
                          onClick={() => toggleReasoning(index)}
                          className="w-full px-4 py-2 flex justify-between items-center text-[10px] font-extrabold text-slate-500 uppercase hover:bg-slate-100 transition-colors"
                        >
                          <span className="flex items-center gap-1">🔍 Deterministic Reasoning Step</span>
                          <span>{openReasoningIndex === index ? 'Hide Calculations ▲' : 'View Calculations ▼'}</span>
                        </button>
                        
                        {openReasoningIndex === index && (
                          <div className="p-4 border-t border-slate-200 text-xs space-y-3 bg-white text-textMuted font-semibold animate-fadeIn">
                            <div>
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Classified Intent</span>
                              <span className="inline-block px-3 py-1 bg-primaryLight text-primary rounded-full font-black text-[10px] uppercase">
                                {msg.structuredResponse.intent}
                              </span>
                            </div>
                            
                            <div>
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Database Variables Queried</span>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600">
                                <div>Monthly Income:</div>
                                <div className="text-right text-darkNavy font-bold">₹{msg.structuredResponse.calculations.income.toLocaleString()}</div>
                                <div>Total Expenses this Month:</div>
                                <div className="text-right text-darkNavy font-bold">₹{msg.structuredResponse.calculations.totalExpenses.toLocaleString()}</div>
                                <div>Total Monthly EMI Outflow:</div>
                                <div className="text-right text-darkNavy font-bold">₹{msg.structuredResponse.calculations.totalEMIs.toLocaleString()}</div>
                                <div>Net Remaining Savings:</div>
                                <div className="text-right text-primary font-black">₹{msg.structuredResponse.calculations.netSavings.toLocaleString()}</div>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Reasoning Calculations</span>
                              <div className="space-y-1.5 text-xs font-mono text-darkNavy">
                                {msg.structuredResponse.intent === 'affordability' && (
                                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <div>Item Target Price: <span className="font-bold">₹{msg.structuredResponse.calculations.targetAmount?.toLocaleString()}</span></div>
                                    <div>Affordable Immediately: <span className="font-bold">{msg.structuredResponse.calculations.affordable ? 'Yes' : 'No'}</span></div>
                                    <div>Savings timeline: <span className="font-bold">{msg.structuredResponse.calculations.monthsNeeded} month(s)</span></div>
                                    <div className="text-[10px] text-textMuted italic mt-1 border-t pt-1">Math: Target Price / Net Savings</div>
                                  </div>
                                )}
                                {msg.structuredResponse.intent === 'savings_rate' && (
                                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <div>Savings Rate: <span className="font-bold">{msg.structuredResponse.calculations.savingsRate}%</span></div>
                                    <div>Health Evaluation: <span className="font-bold text-primary">{msg.structuredResponse.calculations.rating}</span></div>
                                    <div className="text-[10px] text-textMuted italic mt-1 border-t pt-1">Math: (Net surplus / Monthly Income) * 100</div>
                                  </div>
                                )}
                                {msg.structuredResponse.intent === 'budget_status' && (
                                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <div>Total categories over limit: <span className="font-bold text-danger">{msg.structuredResponse.calculations.overBudgetCategories}</span></div>
                                    <div className="text-[10px] text-textMuted italic mt-1 border-t pt-1">Math: Sum category expenses & compare vs budget allocation %</div>
                                  </div>
                                )}
                                {msg.structuredResponse.intent === 'debt_load' && (
                                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <div>EMI load ratio: <span className="font-bold">{msg.structuredResponse.calculations.emiRatio}%</span></div>
                                    <div>Total Outstanding Debt Principal: <span className="font-bold">₹{msg.structuredResponse.calculations.totalOutstandingDebt?.toLocaleString()}</span></div>
                                    <div className="text-[10px] text-textMuted italic mt-1 border-t pt-1">Math: (EMIs outflow / Monthly Income) * 100</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Structured Advice cards */}
                      {msg.structuredResponse.structuredAdvice && msg.structuredResponse.structuredAdvice.length > 0 && (
                        <div className="space-y-2">
                          {msg.structuredResponse.structuredAdvice.map((adv, idx) => (
                            <div
                              key={idx}
                              className={`px-4 py-3 rounded-2xl text-xs font-bold border flex items-start gap-2.5 leading-relaxed shadow-sm ${
                                adv.type === 'success'
                                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                  : adv.type === 'warning'
                                  ? 'bg-amber-50 border-amber-100 text-amber-700'
                                  : adv.type === 'danger'
                                  ? 'bg-rose-50 border-rose-100 text-rose-700'
                                  : 'bg-blue-50 border-blue-100 text-blue-700'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
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
                <div className="flex items-center gap-1 bg-slate-100 p-3 rounded-2xl w-16 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Query suggestion chips */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar scroll-smooth">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendSuggestion(chip)}
                  className="px-3.5 py-1.5 bg-gray-50 border border-gray-200 hover:border-primary/20 hover:text-primary transition-all rounded-full whitespace-nowrap text-[10px] text-textMuted font-black uppercase shrink-0 shadow-sm"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendChat} className="flex gap-3 border-t border-gray-100 pt-3">
              <input
                type="text"
                placeholder="Ask your Fox Financial Assistant..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-darkNavy"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || aiTyping}
                className="bg-primary hover:bg-orange-600 text-white px-5 py-3 rounded-2xl text-sm font-extrabold transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>Ask AI</span>
                <Send size={14} />
              </button>
            </form>
          </div>

          {/* Right Section: Real-Time Account Metrics Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Account surplus summary */}
            <div className="bg-darkNavy text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              
              <h3 className="font-bold text-gray-300 text-sm mb-4">Live Profile Surplus</h3>
              
              <div className="mb-6">
                <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Active Template</div>
                <div className="font-black text-sm text-primaryLight">{summaryData.activeTemplateName}</div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Monthly Income:</span>
                  <span className="font-bold text-white">₹{summaryData.income.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Expenses this Month:</span>
                  <span className="font-bold text-rose-400">₹{summaryData.expenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Monthly EMI Outflow:</span>
                  <span className="font-bold text-rose-400">₹{summaryData.emis.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-3 font-bold">
                  <span className="text-white">Net Surplus Savings:</span>
                  <span className={summaryData.netSavings >= 0 ? "text-emerald-400 font-extrabold" : "text-rose-400 font-extrabold"}>
                    ₹{summaryData.netSavings.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick tips panel */}
            <div className="bg-white border border-borderLight rounded-3xl p-6 shadow-md space-y-4">
              <h4 className="font-black text-darkNavy text-sm flex items-center gap-1.5">
                <HelpCircle size={16} className="text-primary" />
                <span>Assistant Tips</span>
              </h4>
              
              <ul className="text-xs text-textMuted space-y-2.5 font-semibold leading-relaxed">
                <li className="flex gap-2">
                  <ArrowRight size={14} className="text-primary shrink-0 mt-0.5" />
                  <span>The assistant uses real data. Verify your templates and expense logs to get accurate calculations.</span>
                </li>
                <li className="flex gap-2">
                  <ArrowRight size={14} className="text-primary shrink-0 mt-0.5" />
                  <span>Ask about specific purchase prices to activate the <strong>Affordability</strong> calculator.</span>
                </li>
                <li className="flex gap-2">
                  <ArrowRight size={14} className="text-primary shrink-0 mt-0.5" />
                  <span>All mathematics executed under the hood is <strong>deterministic</strong> and visible in the reasoning drawer.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>
      </main>
    </div>
  );
};

export default AIAssistantPage;
