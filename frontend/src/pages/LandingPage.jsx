import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight, BarChart3, Shield, Zap, Lock, Sparkles, Target, PieChart, TrendingUp, Calculator, Lightbulb } from 'lucide-react';

const LandingPage = () => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const fullText = "Master Your Money With Intelligent Insights.";
  const firstPartLength = 23;

  useEffect(() => {
    let timer;
    const startTimeout = setTimeout(() => {
      let index = 0;
      timer = setInterval(() => {
        index++;
        setDisplayedLength(index);
        if (index >= fullText.length) {
          clearInterval(timer);
          setTimeout(() => setIsTyping(false), 800);
        }
      }, 30);
    }, 150);

    return () => {
      clearTimeout(startTimeout);
      if (timer) clearInterval(timer);
    };
  }, []);

  const displayedFirstPart = fullText.slice(0, Math.min(displayedLength, firstPartLength));
  const displayedSecondPart = displayedLength > firstPartLength
    ? fullText.slice(firstPartLength, displayedLength)
    : "";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0B1120] text-white font-sans selection:bg-primary/30 selection:text-white">
      {/* Background Gradients & Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[180px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navigation */}
      <nav className="w-full px-6 py-6 md:px-12 flex justify-between items-center z-20 border-b border-white/5 bg-[#0B1120]/40 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Finance Fox Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-extrabold tracking-tight text-white">Finance Fox</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/login">
            <Button variant="ghost" className="hover:bg-white/10 hover:text-white text-sm font-medium">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm" className="shadow-lg shadow-primary/20 hover:scale-105 transition-all">Sign up</Button>
          </Link>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24">

          {/* Left Side Column */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/40 border border-slate-700/60 text-xs font-semibold text-primary mb-6 shadow-[0_0_20px_rgba(249,115,22,0.08)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Designed for Modern Money Management
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-[72px] font-black tracking-tight leading-[1.05] mb-6 text-white min-h-[3.15em] sm:min-h-[auto]">
              {displayedFirstPart}
              {displayedSecondPart && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                  {displayedSecondPart}
                </span>
              )}
              {isTyping && (
                <span className="inline-block w-[3px] h-[0.85em] ml-1 bg-primary animate-pulse align-middle" style={{ verticalAlign: 'middle', marginTop: '-0.15em' }}></span>
              )}
            </h1>

            {/* Supporting Text */}
            <p className="text-base md:text-[18px] text-textMuted max-w-lg mb-10 leading-relaxed">
              Track expenses, monitor investments, automate budgeting, and achieve your financial goals from one intelligent platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12 w-full sm:w-auto">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full gap-2 shadow-xl shadow-primary/30 hover:scale-105 transition-all">
                  Get Started <ArrowRight size={18} />
                </Button>
              </Link>
            </div>

            {/* Small Trust Indicators */}
            <div className="flex flex-wrap gap-6 items-center border-t border-slate-800/60 pt-8 w-full text-xs text-textMuted font-bold uppercase tracking-wider">
              <div className="flex items-center gap-2 hover:text-white transition-colors duration-200 cursor-default">
                <Lightbulb size={14} className="text-primary" />
                <span>Smart Expense Tracking</span>
              </div>
              <div className="flex items-center gap-2 hover:text-white transition-colors duration-200 cursor-default">
                <TrendingUp size={14} className="text-primary" />
                <span>Real-Time Analytics</span>
              </div>
              <div className="flex items-center gap-2 hover:text-white transition-colors duration-200 cursor-default">
                <Sparkles size={14} className="text-primary" />
                <span>AI Insights</span>
              </div>
            </div>
          </div>

          {/* Right Side Column (Premium Dashboard Mockup) */}
          <div className="lg:col-span-6 w-full relative flex justify-center lg:justify-end group">
            {/* Glowing radial orange background blur */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-orange-500/25 rounded-[40px] blur-3xl pointer-events-none group-hover:scale-105 transition-transform duration-500"></div>

            {/* Main Glassmorphic Dashboard Panel */}
            <div className="w-full max-w-[540px] bg-[#0B132B]/60 backdrop-blur-xl border border-slate-850 rounded-[32px] p-6 shadow-2xl relative z-10 transition-all duration-300 hover:border-slate-700/80">

              {/* Dashboard Top Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <img src="/logo.png" alt="Finance Fox Logo" className="w-6 h-6 object-contain" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-primary tracking-widest uppercase leading-none">Finance</span>
                    <span className="text-[11px] font-black text-white tracking-wider leading-none mt-0.5">FOX</span>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-900/80 text-[10px] text-textMuted font-bold border border-slate-800">
                  Overview
                </div>
              </div>

              {/* Metrics Row (Total Balance & Savings) */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-2xl flex flex-col justify-between hover:bg-slate-900/60 transition-colors">
                  <span className="text-[10px] uppercase font-bold text-textMuted tracking-wider">Total Balance</span>
                  <span className="text-2xl font-black text-white font-mono mt-1">₹2,45,230</span>
                  <span className="text-[9px] text-emerald-500 font-extrabold flex items-center gap-0.5 mt-2">
                    ↑ 8.3% vs last month
                  </span>
                </div>

                <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-2xl flex flex-col justify-between hover:bg-slate-900/60 transition-colors">
                  <span className="text-[10px] uppercase font-bold text-textMuted tracking-wider">Monthly Savings</span>
                  <span className="text-2xl font-black text-white font-mono mt-1">₹32,450</span>
                  <div className="w-full bg-slate-850 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full w-[65%]"></div>
                  </div>
                </div>
              </div>

              {/* Chart & AI Score Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-5">

                {/* SVG Glowing Line Chart */}
                <div className="md:col-span-8 bg-slate-900/40 border border-slate-800/50 p-4 rounded-2xl flex flex-col justify-between hover:bg-slate-900/60 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-bold text-textMuted tracking-wider">Balance Trend</span>
                    <span className="text-[9px] text-primary font-extrabold bg-primary/10 px-1.5 py-0.5 rounded-md">Live</span>
                  </div>
                  <div className="w-full h-24 mt-2">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 200 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3.5" floodColor="#f97316" floodOpacity="0.6" />
                        </filter>
                      </defs>
                      {/* Gradient Area under Chart */}
                      <path d="M 0 100 Q 25 75 50 85 T 100 50 T 150 35 T 200 15 L 200 100 L 0 100 Z" fill="url(#chartGradient)" />
                      {/* Chart Stroke */}
                      <path d="M 0 100 Q 25 75 50 85 T 100 50 T 150 35 T 200 15" fill="none" stroke="#f97316" strokeWidth="2.5" filter="url(#glow)" strokeLinecap="round" />
                      {/* Interactive Data Dots */}
                      <circle cx="50" cy="85" r="3" fill="#f97316" stroke="#fff" strokeWidth="1" />
                      <circle cx="100" cy="50" r="3" fill="#f97316" stroke="#fff" strokeWidth="1" />
                      <circle cx="150" cy="35" r="3" fill="#f97316" stroke="#fff" strokeWidth="1" />
                      <circle cx="200" cy="15" r="4.5" fill="#f97316" stroke="#fff" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>

                {/* AI Score Radial Indicator */}
                <div className="md:col-span-4 bg-slate-900/40 border border-slate-800/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-slate-900/60 transition-colors">
                  <span className="text-[10px] uppercase font-bold text-textMuted tracking-wider mb-3">AI Score</span>
                  <div className="relative w-18 h-18 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-primary" strokeWidth="3.5" strokeDasharray="92, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute text-center flex flex-col justify-center">
                      <span className="text-base font-black text-white font-mono leading-none">92</span>
                      <span className="text-[7px] text-textMuted font-bold leading-none mt-0.5">/100</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Row (Cash Flow/Budget & Transactions) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Cash Flow & Budget */}
                <div className="flex flex-col gap-4">
                  {/* Cash Flow split card */}
                  <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-2xl hover:bg-slate-900/60 transition-colors">
                    <span className="text-[10px] uppercase font-bold text-textMuted tracking-wider">Cash Flow</span>
                    <div className="space-y-2 mt-2.5">
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-white mb-0.5">
                          <span>Income</span>
                          <span className="font-mono text-emerald-500">₹85,000</span>
                        </div>
                        <div className="w-full bg-slate-850 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full w-[100%]"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-white mb-0.5">
                          <span>Expenses</span>
                          <span className="font-mono text-orange-500">₹52,550</span>
                        </div>
                        <div className="w-full bg-slate-850 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-primary rounded-full w-[62%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Budget card */}
                  <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-2xl hover:bg-slate-900/60 transition-colors flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-textMuted tracking-wider">Budget Utilized</span>
                      <span className="text-xs font-black text-white font-mono">75%</span>
                    </div>
                    <div className="w-full bg-slate-850 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full w-[75%]"></div>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions List */}
                <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-2xl hover:bg-slate-900/60 transition-colors flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-textMuted tracking-wider mb-2">Recent Transactions</span>
                  <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar max-h-[140px]">
                    {[
                      { name: "Salary", amount: "+₹85,000", type: "income", date: "Income", dotColor: "bg-emerald-500" },
                      { name: "Fuel", amount: "-₹2,000", type: "expense", date: "Transport", dotColor: "bg-blue-500" },
                      { name: "Amazon", amount: "-₹1,250", type: "expense", date: "Shopping", dotColor: "bg-purple-500" },
                      { name: "Swiggy", amount: "-₹450", type: "expense", date: "Food", dotColor: "bg-orange-500" }
                    ].map((tx, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-800/40 last:border-0 hover:bg-slate-800/10 rounded px-1 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tx.dotColor}`}></span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate leading-none mb-0.5">{tx.name}</span>
                            <span className="text-[9px] text-textMuted leading-none block">{tx.date}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black font-mono shrink-0 pl-1 ${tx.type === 'income' ? 'text-emerald-500' : 'text-slate-350'}`}>
                          {tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Features Section (3x2 responsive grid of dark glass cards) */}
        <div className="w-full mt-24 md:mt-32 mb-16 max-w-7xl mx-auto px-6 md:px-12 text-center">
          <div className="mb-16">
            <h2 className="text-3xl md:text-[48px] font-black text-white tracking-tight mb-4">
              Intelligent Features for Smart Capital
            </h2>
            <p className="text-textMuted text-base md:text-[18px] max-w-2xl mx-auto">
              Smarter Insights. Better Decisions. Stronger Finances.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto w-full text-left">
            {[
              { icon: Zap, title: "Smart Expense Tracking", desc: "Automatically categorize and analyze spending patterns." },
              { icon: Sparkles, title: "AI Financial Assistant", desc: "Get personalized recommendations to save and invest smarter." },
              { icon: TrendingUp, title: "Investment Insights", desc: "Monitor portfolio performance with real-time analytics." },
              { icon: PieChart, title: "Budget Planning", desc: "Create monthly budgets and track progress." },
              { icon: Target, title: "Goal Tracking", desc: "Track savings goals with milestone indicators." },
              { icon: Calculator, title: "Calculations Done Easy", desc: "Powerful financial calculators designed for everyday use." }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-3xl bg-slate-900/30 backdrop-blur-md border border-slate-800/80 hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-primary/5 group">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon size={22} color="#f97316" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-textMuted leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-textMuted text-xs border-t border-slate-900 mt-20 z-10 w-full">
        &copy; {new Date().getFullYear()} Finance Fox. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
