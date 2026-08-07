import React, { useState, useMemo } from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, Plus, Search, Filter, 
  PieChart, BarChart2, Settings, Shield, Bell, FileText, 
  ArrowUpRight, ArrowDownLeft, Calendar, Tag, ChevronRight, 
  Trash2, Edit3, Award, DollarSign, Smartphone, Check, X,
  RefreshCw, Lock, Sparkles, CreditCard, Layers, ArrowRightLeft,
  ChevronDown, Sun, Moon, Info, Download, AlertCircle
} from 'lucide-react';

// Color Design Tokens (Light Finance Theme)
// Primary: #6C63FF | Accent (Income): #10B981 | Danger (Expense): #EF4444
// Background: #F8FAFC | Card Surface: #FFFFFF | Text: #0F172A

const INITIAL_TRANSACTIONS = [
  { id: '1', amount: 250000, type: 'income', category: 'Salary', wallet: 'Meezan Bank', note: 'Monthly Salary - Tech Corp', date: '2026-08-01', isRecurring: true },
  { id: '2', amount: 14500, type: 'expense', category: 'Groceries', wallet: 'Meezan Bank', note: 'Al-Fatah Supermarket', date: '2026-08-05', isRecurring: false },
  { id: '3', amount: 3200, type: 'expense', category: 'Dining Out', wallet: 'JazzCash', note: 'Dinner with friends at BBQ Tonight', date: '2026-08-06', isRecurring: false },
  { id: '4', amount: 8500, type: 'expense', category: 'Utilities', wallet: 'Easypaisa', note: 'KE Electricity Bill', date: '2026-08-04', isRecurring: true },
  { id: '5', amount: 12000, type: 'income', category: 'Freelance', wallet: 'JazzCash', note: 'Logo Design Project', date: '2026-08-03', isRecurring: false },
  { id: '6', amount: 4500, type: 'expense', category: 'Fuel', wallet: 'Cash', note: 'PSO Fuel Station Tank Refill', date: '2026-08-02', isRecurring: false },
  { id: '7', amount: 20000, type: 'expense', category: 'Shopping', wallet: 'Meezan Bank', note: 'New Sneakers Outlet', date: '2026-07-29', isRecurring: false },
];

const INITIAL_WALLETS = [
  { id: 'w1', name: 'Cash', balance: 18500, type: 'cash', icon: '💵', color: 'from-amber-400 to-orange-500' },
  { id: 'w2', name: 'Meezan Bank', balance: 215000, type: 'bank', icon: '🏦', color: 'from-blue-600 to-indigo-700' },
  { id: 'w3', name: 'JazzCash', balance: 14200, type: 'mobile', icon: '📱', color: 'from-red-500 to-rose-600' },
  { id: 'w4', name: 'Easypaisa', balance: 8600, type: 'mobile', icon: '📲', color: 'from-emerald-500 to-teal-600' }
];

const INITIAL_BUDGETS = [
  { id: 'b1', category: 'Groceries', limit: 40000, spent: 14500, icon: '🛒' },
  { id: 'b2', category: 'Dining Out', limit: 15000, spent: 11200, icon: '🍔' },
  { id: 'b3', category: 'Fuel', limit: 12000, spent: 9500, icon: '⛽' },
  { id: 'b4', category: 'Shopping', limit: 25000, spent: 28000, icon: '🛍️' }, // Over budget test
];

const INITIAL_GOALS = [
  { id: 'g1', title: 'MacBook Pro M3', targetAmount: 450000, savedAmount: 280000, deadline: '2026-11-30', icon: '💻' },
  { id: 'g2', title: 'Northern Trip', targetAmount: 120000, savedAmount: 95000, deadline: '2026-09-15', icon: '🏔️' },
  { id: 'g3', title: 'Emergency Fund', targetAmount: 500000, savedAmount: 320000, deadline: '2026-12-31', icon: '🛡️' }
];

const CATEGORIES = [
  { name: 'Salary', icon: '💼', type: 'income', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Freelance', icon: '💻', type: 'income', color: 'bg-teal-100 text-teal-700' },
  { name: 'Investments', icon: '📈', type: 'income', color: 'bg-blue-100 text-blue-700' },
  { name: 'Groceries', icon: '🛒', type: 'expense', color: 'bg-amber-100 text-amber-700' },
  { name: 'Dining Out', icon: '🍔', type: 'expense', color: 'bg-orange-100 text-orange-700' },
  { name: 'Shopping', icon: '🛍️', type: 'expense', color: 'bg-purple-100 text-purple-700' },
  { name: 'Fuel', icon: '⛽', type: 'expense', color: 'bg-rose-100 text-rose-700' },
  { name: 'Utilities', icon: '⚡', type: 'expense', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Health', icon: '💊', type: 'expense', color: 'bg-red-100 text-red-700' },
  { name: 'Entertainment', icon: '🎬', type: 'expense', color: 'bg-indigo-100 text-indigo-700' },
];

export default function App() {
  // State
  const [activeTab, setActiveTab] = useState('home');
  const [currency] = useState('PKR');
  const [userName] = useState('Mujtaba');
  
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [wallets, setWallets] = useState(INITIAL_WALLETS);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [goals, setGoals] = useState(INITIAL_GOALS);

  // Modals & Sheets State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all, income, expense
  const [selectedCategory, setSelectedCategory] = useState('all');

  // New Transaction Form State
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('expense');
  const [txCategory, setTxCategory] = useState('Groceries');
  const [txWallet, setTxWallet] = useState('Meezan Bank');
  const [txNote, setTxNote] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txIsRecurring, setTxIsRecurring] = useState(false);

  // Transfer State
  const [fromWallet, setFromWallet] = useState('Meezan Bank');
  const [toWallet, setToWallet] = useState('JazzCash');
  const [transferAmount, setTransferAmount] = useState('');

  // Goal Contribution State
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');

  // Calculated Metrics
  const totalBalance = useMemo(() => wallets.reduce((acc, w) => acc + w.balance, 0), [wallets]);
  
  const currentMonthIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const currentMonthExpense = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const dailyAvgExpense = useMemo(() => {
    const daysInMonth = new Date().getDate();
    return Math.round(currentMonthExpense / (daysInMonth || 1));
  }, [currentMonthExpense]);

  // Handlers
  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!txAmount || parseFloat(txAmount) <= 0) return;

    const numAmount = parseFloat(txAmount);
    const newTx = {
      id: Date.now().toString(),
      amount: numAmount,
      type: txType,
      category: txCategory,
      wallet: txWallet,
      note: txNote || `${txCategory} Payment`,
      date: txDate,
      isRecurring: txIsRecurring,
    };

    // Update transactions
    setTransactions([newTx, ...transactions]);

    // Update corresponding wallet balance
    setWallets(prevWallets => prevWallets.map(w => {
      if (w.name === txWallet) {
        return {
          ...w,
          balance: txType === 'income' ? w.balance + numAmount : w.balance - numAmount
        };
      }
      return w;
    }));

    // Update budget spent if expense
    if (txType === 'expense') {
      setBudgets(prevBudgets => prevBudgets.map(b => {
        if (b.category === txCategory) {
          return { ...b, spent: b.spent + numAmount };
        }
        return b;
      }));
    }

    // Reset Form & Close
    setTxAmount('');
    setTxNote('');
    setIsAddModalOpen(false);
  };

  const handleDeleteTransaction = (id) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    // Revert Wallet balance
    setWallets(prev => prev.map(w => {
      if (w.name === tx.wallet) {
        return {
          ...w,
          balance: tx.type === 'income' ? w.balance - tx.amount : w.balance + tx.amount
        };
      }
      return w;
    }));

    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleWalletTransfer = (e) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    if (!amount || amount <= 0 || fromWallet === toWallet) return;

    const source = wallets.find(w => w.name === fromWallet);
    if (!source || source.balance < amount) {
      alert("Insufficient funds in selected wallet!");
      return;
    }

    setWallets(prev => prev.map(w => {
      if (w.name === fromWallet) return { ...w, balance: w.balance - amount };
      if (w.name === toWallet) return { ...w, balance: w.balance + amount };
      return w;
    }));

    setTransferAmount('');
    setIsTransferModalOpen(false);
  };

  const handleGoalContribution = (e) => {
    e.preventDefault();
    const amount = parseFloat(contributionAmount);
    if (!amount || !selectedGoal) return;

    setGoals(prev => prev.map(g => {
      if (g.id === selectedGoal.id) {
        return { ...g, savedAmount: Math.min(g.targetAmount, g.savedAmount + amount) };
      }
      return g;
    }));

    setContributionAmount('');
    setSelectedGoal(null);
    setIsGoalModalOpen(false);
  };

  // Format PKR
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val).replace('PKR', 'Rs.');
  };

  // Category Icon helper
  const getCategoryIcon = (catName) => {
    const cat = CATEGORIES.find(c => c.name === catName);
    return cat ? cat.icon : '🏷️';
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.note.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.wallet.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchQuery, typeFilter, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex justify-center items-start md:py-6 p-0">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen md:min-h-[860px] md:max-h-[900px] md:rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative">
        
        {/* Status Bar (Simulated Mobile Header) */}
        <div className="bg-slate-900 text-white px-6 pt-3 pb-2 flex justify-between items-center text-xs font-semibold tracking-wide">
          <span>9:41</span>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">OFFLINE</span>
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
            <Smartphone className="w-3.5 h-3.5 opacity-80" />
          </div>
        </div>

        {/* Top App Bar */}
        <div className="bg-white px-5 py-3 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-200">
              M
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Assalam-o-Alaikum</p>
              <h1 className="text-base font-bold text-slate-900 leading-none">Hi {userName} 👋</h1>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => alert("Notification center: All systems operational. Off-line data auto-synced with local Hive database.")}
              className="p-2 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-slate-100 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>
          </div>
        </div>

        {/* Main Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-5">
          
          {/* TAB 1: HOME / DASHBOARD */}
          {activeTab === 'home' && (
            <>
              {/* Hero Balance Card (Light Theme Purple Gradient) */}
              <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-5 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-indigo-100 uppercase tracking-wider">Total Net Balance</span>
                  <span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-white font-medium">
                    Light Mode
                  </span>
                </div>
                <div className="text-3xl font-extrabold font-mono tracking-tight mb-4">
                  {formatCurrency(totalBalance)}
                </div>

                {/* Income vs Expense Mini Stats */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/15">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-300 border border-emerald-400/30">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-indigo-100 font-medium">Income</p>
                      <p className="text-sm font-bold font-mono text-emerald-300">{formatCurrency(currentMonthIncome)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-rose-500/20 rounded-xl text-rose-300 border border-rose-400/30">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-indigo-100 font-medium">Expense</p>
                      <p className="text-sm font-bold font-mono text-rose-300">{formatCurrency(currentMonthExpense)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-4 gap-2">
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-white p-3 rounded-2xl shadow-xs border border-slate-100 flex flex-col items-center hover:bg-slate-50 transition-all active:scale-95"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">Add Tx</span>
                </button>

                <button 
                  onClick={() => setIsTransferModalOpen(true)}
                  className="bg-white p-3 rounded-2xl shadow-xs border border-slate-100 flex flex-col items-center hover:bg-slate-50 transition-all active:scale-95"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">Transfer</span>
                </button>

                <button 
                  onClick={() => setActiveTab('analytics')}
                  className="bg-white p-3 rounded-2xl shadow-xs border border-slate-100 flex flex-col items-center hover:bg-slate-50 transition-all active:scale-95"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">Analytics</span>
                </button>

                <button 
                  onClick={() => setActiveTab('budgets')}
                  className="bg-white p-3 rounded-2xl shadow-xs border border-slate-100 flex flex-col items-center hover:bg-slate-50 transition-all active:scale-95"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">Budgets</span>
                </button>
              </div>

              {/* Daily Burn Rate Banner */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-300">Daily Average Spend</p>
                    <p className="text-sm font-bold font-mono text-white">{formatCurrency(dailyAvgExpense)} <span className="text-[10px] text-slate-400 font-normal">/ day</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-1 rounded-md font-medium">On Track</span>
                </div>
              </div>

              {/* Wallets Quick Preview Slider */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <h3 className="text-sm font-bold text-slate-900">Wallets & Accounts</h3>
                  <button onClick={() => setActiveTab('budgets')} className="text-xs font-semibold text-indigo-600 hover:underline">Manage</button>
                </div>
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
                  {wallets.map(w => (
                    <div key={w.id} className="min-w-[140px] bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs flex-shrink-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg">{w.icon}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{w.type}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 truncate">{w.name}</p>
                      <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">{formatCurrency(w.balance)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions List */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
                  <button onClick={() => setActiveTab('transactions')} className="text-xs font-semibold text-indigo-600 hover:underline">View All</button>
                </div>

                <div className="space-y-2.5">
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                          {getCategoryIcon(tx.category)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{tx.note}</p>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-[10px] text-slate-400">{tx.wallet}</span>
                            <span className="text-[10px] text-slate-300">•</span>
                            <span className="text-[10px] text-slate-400">{tx.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-bold font-mono ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        <span className="text-[9px] text-slate-400 capitalize">{tx.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: TRANSACTIONS LIST */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Transactions History</h2>
                <p className="text-xs text-slate-500">Filter, search and review all recorded entries</p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search by note, category or wallet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Type Filter Chips */}
              <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
                {['all', 'income', 'expense'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                      typeFilter === t 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Category Dropdown Filter */}
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">Category Filter:</span>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(c => (
                    <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              {/* Transaction List */}
              <div className="space-y-2.5">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No transactions found</p>
                    <p className="text-[11px] text-slate-400">Try adjusting your search filters</p>
                  </div>
                ) : (
                  filteredTransactions.map(tx => (
                    <div key={tx.id} className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between group hover:border-indigo-200 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                          {getCategoryIcon(tx.category)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{tx.note}</p>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{tx.wallet}</span>
                            <span className="text-[10px] text-slate-400">{tx.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className={`text-xs font-bold font-mono ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </p>
                          <span className="text-[9px] text-slate-400 capitalize">{tx.category}</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Spending Insights</h2>
                <p className="text-xs text-slate-500">Visual breakdowns & category distribution</p>
              </div>

              {/* Donut Chart Mock (Category Distribution) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 mb-3">Expenses Breakdown</h3>
                <div className="flex items-center justify-around py-2">
                  <div className="relative w-32 h-32 rounded-full border-[12px] border-indigo-600 border-t-rose-500 border-r-amber-400 flex items-center justify-center shadow-inner">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 font-semibold">Total Spent</p>
                      <p className="text-xs font-bold font-mono text-slate-900">{formatCurrency(currentMonthExpense)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                      <span className="font-medium text-slate-600">Shopping (45%)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                      <span className="font-medium text-slate-600">Groceries (30%)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                      <span className="font-medium text-slate-600">Dining Out (15%)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                      <span className="font-medium text-slate-600">Others (10%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Comparison Bar Chart */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold text-slate-800">6-Month Trend</h3>
                  <div className="flex space-x-2 text-[10px]">
                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-indigo-600 mr-1"></span>Income</span>
                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-rose-400 mr-1"></span>Expense</span>
                  </div>
                </div>
                <div className="flex justify-between items-end h-32 pt-4 px-2 border-b border-slate-100">
                  {[
                    { m: 'Mar', inc: 60, exp: 40 },
                    { m: 'Apr', inc: 70, exp: 55 },
                    { m: 'May', inc: 65, exp: 45 },
                    { m: 'Jun', inc: 80, exp: 60 },
                    { m: 'Jul', inc: 90, exp: 70 },
                    { m: 'Aug', inc: 100, exp: 50 },
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center space-y-1">
                      <div className="flex items-end space-x-1">
                        <div style={{ height: `${bar.inc * 0.9}px` }} className="w-2 bg-indigo-600 rounded-t-sm"></div>
                        <div style={{ height: `${bar.exp * 0.9}px` }} className="w-2 bg-rose-400 rounded-t-sm"></div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{bar.m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Spending Categories List */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 mb-3">Top Category Spends</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Shopping', amount: 28000, pct: 42, color: 'bg-purple-500' },
                    { name: 'Groceries', amount: 14500, pct: 28, color: 'bg-amber-500' },
                    { name: 'Dining Out', amount: 11200, pct: 18, color: 'bg-orange-500' },
                  ].map(item => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{item.name}</span>
                        <span className="font-mono text-slate-900">{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BUDGETS, WALLETS & GOALS */}
          {activeTab === 'budgets' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Budgets & Goals</h2>
                <p className="text-xs text-slate-500">Limits, active wallets and savings targets</p>
              </div>

              {/* Budget Progress Section */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-900">Monthly Category Budgets</h3>
                  <span className="text-[10px] text-slate-400">Auto Resets Monthly</span>
                </div>

                <div className="space-y-3 pt-1">
                  {budgets.map(b => {
                    const pct = Math.min(100, Math.round((b.spent / b.limit) * 100));
                    const isOver = b.spent > b.limit;
                    return (
                      <div key={b.id} className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800">{b.icon} {b.category}</span>
                          <span className={`font-mono font-semibold ${isOver ? 'text-rose-600' : 'text-slate-600'}`}>
                            {formatCurrency(b.spent)} / <span className="text-slate-400">{formatCurrency(b.limit)}</span>
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${isOver ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        {isOver && (
                          <p className="text-[10px] text-rose-600 flex items-center font-medium">
                            <AlertCircle className="w-3 h-3 mr-1" /> Over budget by {formatCurrency(b.spent - b.limit)}!
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Savings Goals Section */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-900">Savings Goals</h3>
                  <button 
                    onClick={() => alert("Goal creation wizard ready!")} 
                    className="text-xs text-indigo-600 font-semibold flex items-center"
                  >
                    <Plus className="w-3.5 h-3.5 mr-0.5" /> New Goal
                  </button>
                </div>

                <div className="space-y-2.5">
                  {goals.map(g => {
                    const pct = Math.round((g.savedAmount / g.targetAmount) * 100);
                    return (
                      <div key={g.id} className="p-3 border border-slate-100 rounded-xl flex justify-between items-center bg-slate-50/50">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-800">{g.icon} {g.title}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {formatCurrency(g.savedAmount)} / {formatCurrency(g.targetAmount)}
                          </p>
                          <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600" style={{ width: `${pct}%` }} />
                          </div>
                        </div>

                        <button
                          onClick={() => { setSelectedGoal(g); setIsGoalModalOpen(true); }}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-100"
                        >
                          Contribute
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">App Settings</h2>
                <p className="text-xs text-slate-500">Preferences, Security & Local Database</p>
              </div>

              {/* Profile Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
                    M
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{userName}</h3>
                    <p className="text-xs text-slate-400">Default Currency: PKR (Rs.)</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                  Offline Active
                </span>
              </div>

              {/* Preferences List */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden divide-y divide-slate-100">
                <div className="p-3.5 flex justify-between items-center text-xs font-medium text-slate-700">
                  <span className="flex items-center"><Sun className="w-4 h-4 mr-2 text-amber-500" /> Light Mode Theme</span>
                  <span className="text-indigo-600 font-bold text-[11px]">Active</span>
                </div>

                <div className="p-3.5 flex justify-between items-center text-xs font-medium text-slate-700">
                  <span className="flex items-center"><Lock className="w-4 h-4 mr-2 text-indigo-500" /> PIN Lock Protection</span>
                  <input type="checkbox" defaultChecked className="toggle-checkbox rounded" />
                </div>

                <button 
                  onClick={() => alert("Data exported to PDF / CSV successfully!")}
                  className="w-full p-3.5 flex justify-between items-center text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <span className="flex items-center"><Download className="w-4 h-4 mr-2 text-emerald-500" /> Export Summary PDF / CSV</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button 
                  onClick={() => {
                    if (confirm("Reset local Hive storage data?")) {
                      setTransactions([]);
                      alert("Database cleared!");
                    }
                  }}
                  className="w-full p-3.5 flex justify-between items-center text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                >
                  <span className="flex items-center"><Trash2 className="w-4 h-4 mr-2 text-rose-500" /> Clear Local Data</span>
                  <ChevronRight className="w-4 h-4 text-rose-300" />
                </button>
              </div>

              {/* App Meta Info */}
              <div className="text-center py-4 text-slate-400 text-[11px]">
                <p className="font-semibold text-slate-500">Flutter Expense Tracker Blueprint</p>
                <p>Hive Local DB • Version 1.0.0 (Build 42)</p>
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM NAVIGATION BAR */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-3 py-2 flex justify-around items-center z-20">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center py-1 px-2 ${activeTab === 'home' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          <button 
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center py-1 px-2 ${activeTab === 'transactions' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Tx List</span>
          </button>

          {/* Floating Quick Add Button */}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-300 transform -translate-y-3 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>

          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center py-1 px-2 ${activeTab === 'analytics' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Analytics</span>
          </button>

          <button 
            onClick={() => setActiveTab('budgets')}
            className={`flex flex-col items-center py-1 px-2 ${activeTab === 'budgets' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
          >
            <Award className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Budgets</span>
          </button>
        </div>

        {/* MODAL: ADD TRANSACTION BOTTOM SHEET */}
        {isAddModalOpen && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-end animate-fade-in">
            <div className="w-full bg-white rounded-t-3xl p-5 space-y-4 shadow-2xl max-h-[85%] overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Add New Transaction</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-4">
                {/* Type Selector (Income / Expense) */}
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTxType('expense')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${txType === 'expense' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600'}`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('income')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${txType === 'income' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600'}`}
                  >
                    Income
                  </button>
                </div>

                {/* Amount Field */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Amount (PKR)</label>
                  <input 
                    type="number"
                    placeholder="0.00"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full text-2xl font-bold font-mono text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Category Grid Picker */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Category</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.filter(c => c.type === txType).map(cat => (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setTxCategory(cat.name)}
                        className={`p-2 rounded-xl text-center border transition-all ${
                          txCategory === cat.name 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' 
                            : 'border-slate-100 bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="text-base block mb-0.5">{cat.icon}</span>
                        <span className="text-[10px] block truncate">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wallet Picker */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Select Wallet</label>
                  <select 
                    value={txWallet}
                    onChange={(e) => setTxWallet(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    {wallets.map(w => (
                      <option key={w.id} value={w.name}>{w.icon} {w.name} ({formatCurrency(w.balance)})</option>
                    ))}
                  </select>
                </div>

                {/* Note Field */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Note / Description</label>
                  <input 
                    type="text"
                    placeholder="e.g. Al-Fatah Grocery items"
                    value={txNote}
                    onChange={(e) => setTxNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                {/* Save Button */}
                <button 
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-98"
                >
                  Save Transaction
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: WALLET TRANSFER */}
        {isTransferModalOpen && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 w-full max-w-xs space-y-4 shadow-2xl">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Transfer Funds</h3>
                <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleWalletTransfer} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">From Wallet</label>
                  <select 
                    value={fromWallet}
                    onChange={(e) => setFromWallet(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-medium"
                  >
                    {wallets.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">To Wallet</label>
                  <select 
                    value={toWallet}
                    onChange={(e) => setToWallet(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-medium"
                  >
                    {wallets.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Transfer Amount (PKR)</label>
                  <input 
                    type="number"
                    required
                    placeholder="0.00"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm font-mono font-bold"
                  />
                </div>

                <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md">
                  Confirm Transfer
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: GOAL CONTRIBUTION */}
        {isGoalModalOpen && selectedGoal && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 w-full max-w-xs space-y-4 shadow-2xl">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Add Savings to {selectedGoal.title}</h3>
                <button onClick={() => setIsGoalModalOpen(false)} className="text-slate-400"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleGoalContribution} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Contribution Amount (PKR)</label>
                  <input 
                    type="number"
                    required
                    placeholder="0.00"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm font-mono font-bold"
                  />
                </div>

                <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md">
                  Deposit Funds
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}