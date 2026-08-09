import React, { useState, useMemo, useEffect } from 'react';
import { Search, Bell, Plus, LayoutDashboard, Smartphone, X, Languages, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TRANSLATIONS } from './data';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import SettingsView from './components/SettingsView';
import Transactions from './components/Transactions';
import Analytics from './components/Analytics';
import NotificationsPanel, { type AppNotification } from './components/NotificationsPanel';
import WalletsView from './components/WalletsView';
import AddTransactionModal from './components/AddTransactionModal';
import EditProfileModal from './components/EditProfileModal';
import AddWalletModal from './components/AddWalletModal';
import LockScreen from './components/LockScreen';
import AiAssistant from './components/AiAssistant';
import BudgetSettings from './components/BudgetSettings';
import { App as CapacitorApp } from '@capacitor/app';
import type { Budget, Wallet as WalletType } from './types';
import { supabase } from './supabase';

const DEFAULT_WALLETS: WalletType[] = [
  { id: 'w1', name: 'Cash Wallet', balance: 0, color: 'bg-emerald-500' },
  { id: 'w2', name: 'UBL Bank', balance: 0, color: 'bg-blue-600' },
  { id: 'w3', name: 'JazzCash', balance: 0, color: 'bg-rose-500' },
  { id: 'w4', name: 'EasyPaisa', balance: 0, color: 'bg-green-500' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  // Language State
  const [language, setLanguage] = useState(() => localStorage.getItem('expense_language') || 'en');
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  // Search State
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auth state
  const [currentUser, setCurrentUser] = useState<string | null>(() => localStorage.getItem('expense_currentUser'));
  const [isLocked, setIsLocked] = useState(!localStorage.getItem('expense_currentUser'));

  // App Preferences & Security
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('expense_darkMode') === 'true');
  const [biometricEnabled, setBiometricEnabled] = useState(() => localStorage.getItem('expense_biometric') === 'true');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => localStorage.getItem('expense_2fa') === 'true');

  // Profile State
  const [userName, setUserName] = useState(() => localStorage.getItem(`expense_userName_${currentUser}`) || 'User');
  const [userEmail, setUserEmail] = useState(() => currentUser || 'guest@example.com');
  const [userAvatar, setUserAvatar] = useState<string | null>(() => localStorage.getItem(`expense_userAvatar_${currentUser}`));
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const user = localStorage.getItem('expense_currentUser') || 'guest';
    const saved = localStorage.getItem(`expense_transactions_${user}`);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [wallets, setWallets] = useState<WalletType[]>(() => {
    const user = localStorage.getItem('expense_currentUser') || 'guest';
    const saved = localStorage.getItem(`expense_wallets_${user}`);
    return saved ? JSON.parse(saved) : DEFAULT_WALLETS;
  });
  
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const user = localStorage.getItem('expense_currentUser') || 'guest';
    const saved = localStorage.getItem(`expense_budgets_${user}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyBudget, setDailyBudget] = useState(() => {
    const user = localStorage.getItem('expense_currentUser') || 'guest';
    const saved = localStorage.getItem(`expense_dailyBudget_${user}`);
    return saved ? Number(saved) : 1500;
  });

  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const user = localStorage.getItem('expense_currentUser') || 'guest';
    const saved = localStorage.getItem(`expense_monthlyBudget_${user}`);
    return saved ? Number(saved) : 30000;
  });

  const [currency, setCurrency] = useState(() => {
    const user = localStorage.getItem('expense_currentUser') || 'guest';
    return localStorage.getItem(`expense_currency_${user}`) || 'Rs.';
  });

  const [budgetAlertLimit, setBudgetAlertLimit] = useState(() => {
    const user = localStorage.getItem('expense_currentUser') || 'guest';
    const saved = localStorage.getItem(`expense_budgetAlertLimit_${user}`);
    return saved ? Number(saved) : 80;
  });
  
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const user = localStorage.getItem('expense_currentUser') || 'guest';
    const saved = localStorage.getItem(`expense_notifications_${user}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Supabase Auth Listener for OAuth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email || 'user@fintrack.app';
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0];
        const avatar = session.user.user_metadata?.avatar_url || null;
        
        localStorage.setItem('expense_currentUser', email);
        localStorage.setItem(`expense_userName_${email}`, name);
        if (avatar) localStorage.setItem(`expense_userAvatar_${email}`, avatar);
        
        setCurrentUser(email);
        setUserName(name);
        setUserAvatar(avatar);
        setIsLocked(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const email = session.user.email || 'user@fintrack.app';
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0];
        const avatar = session.user.user_metadata?.avatar_url || null;
        
        localStorage.setItem('expense_currentUser', email);
        localStorage.setItem(`expense_userName_${email}`, name);
        if (avatar) localStorage.setItem(`expense_userAvatar_${email}`, avatar);
        
        setCurrentUser(email);
        setUserName(name);
        setUserAvatar(avatar);
        setIsLocked(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Reload data when user changes
  useEffect(() => {
    if (currentUser) {
      const savedTx = localStorage.getItem(`expense_transactions_${currentUser}`);
      if (savedTx) setTransactions(JSON.parse(savedTx));
      else setTransactions([]);
      
      const savedWallets = localStorage.getItem(`expense_wallets_${currentUser}`);
      if (savedWallets) setWallets(JSON.parse(savedWallets));
      else setWallets(DEFAULT_WALLETS);
      
      const savedNotifs = localStorage.getItem(`expense_notifications_${currentUser}`);
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
      
      const savedBudgets = localStorage.getItem(`expense_budgets_${currentUser}`);
      if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
      else setBudgets([]);

      const savedDaily = localStorage.getItem(`expense_dailyBudget_${currentUser}`);
      setDailyBudget(savedDaily ? Number(savedDaily) : 1500);

      const savedMonthly = localStorage.getItem(`expense_monthlyBudget_${currentUser}`);
      setMonthlyBudget(savedMonthly ? Number(savedMonthly) : 30000);

      setCurrency(localStorage.getItem(`expense_currency_${currentUser}`) || 'Rs.');
      
      const savedLimit = localStorage.getItem(`expense_budgetAlertLimit_${currentUser}`);
      setBudgetAlertLimit(savedLimit ? Number(savedLimit) : 80);

      setUserName(localStorage.getItem(`expense_userName_${currentUser}`) || currentUser.split('@')[0]);
      setUserEmail(currentUser);
      setUserAvatar(localStorage.getItem(`expense_userAvatar_${currentUser}`));
    }
  }, [currentUser]);

  // Persist state
  useEffect(() => { if (currentUser) localStorage.setItem(`expense_userName_${currentUser}`, userName); }, [userName, currentUser]);
  useEffect(() => { if (currentUser && userAvatar) localStorage.setItem(`expense_userAvatar_${currentUser}`, userAvatar); }, [userAvatar, currentUser]);
  useEffect(() => { if (currentUser) localStorage.setItem(`expense_transactions_${currentUser}`, JSON.stringify(transactions)); }, [transactions, currentUser]);
  useEffect(() => { if (currentUser) localStorage.setItem(`expense_wallets_${currentUser}`, JSON.stringify(wallets)); }, [wallets, currentUser]);
  useEffect(() => { if (currentUser) localStorage.setItem(`expense_budgets_${currentUser}`, JSON.stringify(budgets)); }, [budgets, currentUser]);
  useEffect(() => { if (currentUser) localStorage.setItem(`expense_dailyBudget_${currentUser}`, String(dailyBudget)); }, [dailyBudget, currentUser]);
  useEffect(() => { if (currentUser) localStorage.setItem(`expense_monthlyBudget_${currentUser}`, String(monthlyBudget)); }, [monthlyBudget, currentUser]);
  useEffect(() => { if (currentUser) localStorage.setItem(`expense_currency_${currentUser}`, currency); }, [currency, currentUser]);
  useEffect(() => { if (currentUser) localStorage.setItem(`expense_budgetAlertLimit_${currentUser}`, String(budgetAlertLimit)); }, [budgetAlertLimit, currentUser]);
  useEffect(() => { localStorage.setItem('expense_biometric', String(biometricEnabled)); }, [biometricEnabled]);
  useEffect(() => { localStorage.setItem('expense_2fa', String(twoFactorEnabled)); }, [twoFactorEnabled]);
  useEffect(() => { if (currentUser) localStorage.setItem(`expense_notifications_${currentUser}`, JSON.stringify(notifications)); }, [notifications, currentUser]);
  useEffect(() => { localStorage.setItem('expense_language', language); }, [language]);
  useEffect(() => {
    localStorage.setItem('expense_darkMode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Reset search when changing tabs
  useEffect(() => {
    setIsSearching(false);
    setSearchQuery('');
  }, [activeTab]);

  // Capacitor Hardware Back Button Handler
  useEffect(() => {
    let removeListener: (() => void) | undefined;
    
    CapacitorApp.addListener('backButton', () => {
      if (isAddModalOpen) setIsAddModalOpen(false);
      else if (isAddWalletOpen) setIsAddWalletOpen(false);
      else if (isEditProfileOpen) setIsEditProfileOpen(false);
      else if (isNotificationsOpen) setIsNotificationsOpen(false);
      else if (activeTab !== 'home') setActiveTab('home');
      else {
        CapacitorApp.exitApp();
      }
    }).then(listener => {
      removeListener = () => listener.remove();
    }).catch(err => {
      console.warn('Capacitor backButton listener not supported in web environment', err);
    });

    return () => {
      if (removeListener) removeListener();
    };
  }, [isAddModalOpen, isAddWalletOpen, isEditProfileOpen, isNotificationsOpen, activeTab]);

  const totalBalance = useMemo(() => wallets.reduce((acc, w) => acc + w.balance, 0), [wallets]);
  
  const currentMonthIncome = useMemo(() => {
    return transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const currentMonthExpense = useMemo(() => {
    return transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const dailyAvgExpense = useMemo(() => {
    const daysInMonth = new Date().getDate();
    return Math.round(currentMonthExpense / (daysInMonth || 1));
  }, [currentMonthExpense]);

  const handleAddDemoTx = () => {
    setIsAddModalOpen(true);
  };

  const handleAddNewTransaction = (newTx: any) => {
    setTransactions([newTx, ...transactions]);

    // Check if wallet exists, if not create it
    const walletExists = wallets.some(w => w.name === newTx.wallet);
    const delta = newTx.type === 'income' ? newTx.amount : -newTx.amount;

    if (!walletExists) {
      const newWallet = {
        id: Date.now().toString() + '_auto',
        name: newTx.wallet,
        balance: delta,
        type: 'cash' as const,
        icon: '💰',
        color: 'from-slate-500 to-slate-700',
        sources: newTx.source ? [{ id: 'src_' + Date.now(), name: newTx.source, balance: delta }] : []
      };
      setWallets(prev => [...prev, newWallet]);
    } else {
      setWallets(prev => prev.map(w => {
        if (w.name === newTx.wallet) {
          let updatedSources = w.sources ? [...w.sources] : [];
          
          if (newTx.source) {
            const existingSourceIdx = updatedSources.findIndex(s => s.name === newTx.source);
            if (existingSourceIdx >= 0) {
              updatedSources[existingSourceIdx] = {
                ...updatedSources[existingSourceIdx],
                balance: updatedSources[existingSourceIdx].balance + delta
              };
            } else {
              updatedSources.push({
                id: 'src_' + Date.now(),
                name: newTx.source,
                balance: delta
              });
            }
          }

          return {
            ...w,
            balance: w.balance + delta,
            sources: updatedSources
          };
        }
        return w;
      }));
    }
    
    // Notifications & Threshold Alert Checks
    setNotifications(prev => [{
      id: Date.now().toString(),
      title: newTx.type === 'income' ? 'Income Added' : 'Expense Recorded',
      message: `${newTx.type === 'income' ? '+' : '-'}Rs. ${newTx.amount} for ${newTx.category} (${newTx.wallet}${newTx.source ? ' • ' + newTx.source : ''})`,
      time: 'Just now',
      read: false,
      type: newTx.type === 'income' ? 'success' : 'alert'
    }, ...prev]);

    if (newTx.type === 'expense') {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayExpenses = transactions
        .filter(t => t.type === 'expense' && t.date === todayStr)
        .reduce((sum, t) => sum + t.amount, 0) + newTx.amount;

      if (dailyBudget > 0 && todayExpenses >= dailyBudget * 0.8) {
        const isExceeded = todayExpenses >= dailyBudget;
        setNotifications(prev => [{
          id: 'daily_alert_' + Date.now(),
          title: isExceeded ? 'Daily Limit Exceeded!' : 'Daily Budget Alert',
          message: isExceeded 
            ? `🚨 Daily spending limit of Rs. ${dailyBudget} exceeded! Today: Rs. ${todayExpenses}`
            : `⚠️ 80% of daily limit reached! Today: Rs. ${todayExpenses} / Rs. ${dailyBudget}`,
          time: 'Just now',
          read: false,
          type: 'alert'
        }, ...prev]);
      }

      const currentMonthExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) + newTx.amount;
        
      const alertThreshold = monthlyBudget * (budgetAlertLimit / 100);
      
      if (monthlyBudget > 0 && currentMonthExpenses >= alertThreshold) {
        const isExceeded = currentMonthExpenses >= monthlyBudget;
        setNotifications(prev => [{
          id: 'alert_' + Date.now().toString(),
          title: isExceeded ? 'Monthly Limit Exceeded!' : 'Monthly Budget Alert',
          message: isExceeded
            ? `🚨 Monthly budget of Rs. ${monthlyBudget} exceeded!`
            : `⚠️ ${Math.round((currentMonthExpenses/monthlyBudget)*100)}% of monthly budget reached!`,
          time: 'Just now',
          read: false,
          type: 'alert'
        }, ...prev]);
      }
    }
    
    setIsAddModalOpen(false);
  };

  const handleAddSubSource = (walletId: string, name: string, initialBalance: number) => {
    setWallets(prev => prev.map(w => {
      if (w.id === walletId) {
        const existingSources = w.sources || [];
        const newSource = { id: 'src_' + Date.now(), name, balance: initialBalance };
        return {
          ...w,
          balance: w.balance + initialBalance,
          sources: [...existingSources, newSource]
        };
      }
      return w;
    }));
  };

  const handleDeleteSubSource = (walletId: string, sourceId: string) => {
    setWallets(prev => prev.map(w => {
      if (w.id === walletId) {
        const existingSources = w.sources || [];
        const targetSource = existingSources.find(s => s.id === sourceId);
        const subBal = targetSource ? targetSource.balance : 0;
        return {
          ...w,
          balance: Math.max(0, w.balance - subBal),
          sources: existingSources.filter(s => s.id !== sourceId)
        };
      }
      return w;
    }));
  };

  const handleAddNewWallet = (newWallet: any) => {
    setWallets([...wallets, newWallet]);
    
    if (newWallet.balance > 0) {
      const initialTx = {
        id: Date.now().toString() + '_initial',
        type: 'income',
        amount: newWallet.balance,
        category: 'Salary',
        note: 'Initial Balance',
        date: new Date().toISOString().split('T')[0],
        wallet: newWallet.name
      };
      setTransactions(prev => [initialTx, ...prev]);
    }

    setNotifications(prev => [{
      id: Date.now().toString(),
      title: 'New Wallet Created',
      message: `${newWallet.name} has been added with an initial balance of Rs. ${newWallet.balance}.`,
      time: 'Just now',
      read: false,
      type: 'info'
    }, ...prev]);
  };

  const handleDelete = (id: string) => {
    const txToDelete = transactions.find(t => t.id === id);
    if (!txToDelete) return;

    setTransactions(prev => prev.filter(t => t.id !== id));
    
    setWallets(prev => prev.map(w => {
      if (w.name === txToDelete.wallet) {
        const delta = txToDelete.type === 'income' ? -txToDelete.amount : txToDelete.amount;
        let updatedSources = w.sources ? [...w.sources] : [];

        if (txToDelete.source) {
          const sIdx = updatedSources.findIndex(s => s.name === txToDelete.source);
          if (sIdx >= 0) {
            updatedSources[sIdx] = {
              ...updatedSources[sIdx],
              balance: updatedSources[sIdx].balance + delta
            };
          }
        }

        return {
          ...w,
          balance: w.balance + delta,
          sources: updatedSources
        };
      }
      return w;
    }));
  };

  const handleDeleteWallet = (id: string) => {
    const walletToDelete = wallets.find(w => w.id === id);
    if (!walletToDelete) return;
    
    setWallets(prev => prev.filter(w => w.id !== id));
    setTransactions(prev => prev.filter(t => t.wallet !== walletToDelete.name));
    
    setNotifications(prev => [{
      id: Date.now().toString(),
      title: 'Wallet Deleted',
      message: `${walletToDelete.name} has been removed.`,
      time: 'Just now',
      read: false,
      type: 'alert'
    }, ...prev]);
  };

  const handleRenameWallet = (id: string, newName: string) => {
    const walletToUpdate = wallets.find(w => w.id === id);
    if (!walletToUpdate) return;
    const oldName = walletToUpdate.name;

    setWallets(prev => prev.map(w => w.id === id ? { ...w, name: newName } : w));
    setTransactions(prev => prev.map(t => t.wallet === oldName ? { ...t, wallet: newName } : t));

    setNotifications(prev => [{
      id: Date.now().toString(),
      title: 'Wallet Renamed',
      message: `${oldName} is now ${newName}.`,
      time: 'Just now',
      read: false,
      type: 'info'
    }, ...prev]);
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    setTransactions(prev => prev.map(t => t.category === oldName ? { ...t, category: newName } : t));
    setBudgets(prev => prev.map(b => b.category === oldName ? { ...b, category: newName } : b));

    setNotifications(prev => [{
      id: Date.now().toString(),
      title: 'Category Renamed',
      message: `Transactions and budgets in "${oldName}" moved to "${newName}".`,
      time: 'Just now',
      read: false,
      type: 'info'
    }, ...prev]);
  };

  const handleUpdateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const dateA = new Date(a.date + ' ' + (a.time || '00:00')).getTime();
      const dateB = new Date(b.date + ' ' + (b.time || '00:00')).getTime();
      return dateB - dateA;
    });
  }, [transactions]);

  const sortedWallets = useMemo(() => {
    return [...wallets].sort((a, b) => b.balance - a.balance);
  }, [wallets]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const handleAuthSuccess = (email: string) => {
    setCurrentUser(email);
    localStorage.setItem('expense_currentUser', email);
    setIsLocked(false);
  };

  const contentAreaRef = React.useRef<HTMLDivElement>(null);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Dismiss mobile virtual keyboard
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    // Scroll content area smoothly to top / search area
    if (contentAreaRef.current) {
      contentAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLocked) {
    return (
      <LockScreen 
        biometricEnabled={biometricEnabled}
        onUnlock={() => setIsLocked(false)} 
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <div className={`min-h-screen flex justify-center items-center font-sans select-none transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <div className={`w-full max-w-md md:max-w-4xl h-screen md:h-[92vh] md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden relative border transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-[#F4F7FE] border-slate-200/50'}`}>
        
        {/* MAIN DISPLAY AREA */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* HEADER */}
          <header className={`px-6 py-5 flex justify-between items-center z-10 sticky top-0 backdrop-blur-md border-b transition-colors ${isDarkMode ? 'bg-slate-950/80 border-white/5' : 'bg-[#F4F7FE]/80 border-white/50'}`}>
            {isSearching ? (
              <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center relative mr-3">
                <Search className={`absolute left-3 w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} />
                <input 
                  type="text" 
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit(e);
                    }
                  }}
                  placeholder="Search here..." 
                  className={`w-full py-2.5 pl-9 pr-4 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors ${isDarkMode ? 'bg-slate-800 text-white placeholder:text-slate-500' : 'bg-white text-slate-900 shadow-sm'}`}
                />
              </form>
            ) : (
              <div>
                <h1 className={`text-2xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {activeTab === 'home' ? t.dashboard : activeTab === 'settings' ? t.profile : activeTab === 'budgets' ? 'Budget Limits' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
                <p className="text-slate-500 text-xs font-medium mt-0.5">FinTrack</p>
              </div>
            )}
            
            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => setIsLanguageOpen(true)}
                className={`relative p-2.5 rounded-full shadow-sm hover:shadow-md transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-500 hover:text-indigo-600'}`}
              >
                <Languages className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsSearching(!isSearching)}
                className={`relative p-2.5 rounded-full shadow-sm hover:shadow-md transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-500 hover:text-indigo-600'}`}
              >
                {isSearching ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setIsNotificationsOpen(true)}
                className={`relative p-2.5 rounded-full shadow-sm hover:shadow-md transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-500 hover:text-indigo-600'}`}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && <span className={`absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ${isDarkMode ? 'ring-slate-800' : 'ring-white'}`} />}
              </button>
            </div>
          </header>

          {/* CONTENT AREA */}
          <div ref={contentAreaRef} className="flex-1 px-4 py-5 pb-24 overflow-y-auto scrollbar-none relative">
            {activeTab === 'home' ? (
              <Dashboard 
                totalBalance={totalBalance}
                currentMonthIncome={currentMonthIncome}
                currentMonthExpense={currentMonthExpense}
                dailyAvgExpense={dailyAvgExpense}
                wallets={sortedWallets}
                transactions={sortedTransactions}
                budgets={budgets}
                monthlyBudget={monthlyBudget}
                currency={currency}
                setActiveTab={setActiveTab}
                handleDelete={handleDelete}
                onUpdateBudget={handleUpdateBudget}
                searchQuery={searchQuery}
                t={t}
              />
            ) : activeTab === 'settings' ? (
              <SettingsView
                userName={userName} 
                userAvatar={userAvatar}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                biometricEnabled={biometricEnabled}
                setBiometricEnabled={setBiometricEnabled}
                twoFactorEnabled={twoFactorEnabled}
                setTwoFactorEnabled={setTwoFactorEnabled}
                openEditProfile={() => setIsEditProfileOpen(true)}
                openNotifications={() => setIsNotificationsOpen(true)}
                transactions={sortedTransactions}
                monthlyBudget={monthlyBudget}
                setMonthlyBudget={setMonthlyBudget}
                currency={currency}
                setCurrency={setCurrency}
                budgetAlertLimit={budgetAlertLimit}
                setBudgetAlertLimit={setBudgetAlertLimit}
                onRenameCategory={handleRenameCategory}
                setActiveTab={setActiveTab}
                language={language}
                setLanguage={setLanguage}
              />
            ) : activeTab === 'budgets' ? (
              <BudgetSettings
                dailyBudget={dailyBudget}
                setDailyBudget={setDailyBudget}
                monthlyBudget={monthlyBudget}
                setMonthlyBudget={setMonthlyBudget}
                budgets={budgets}
                onUpdateBudget={handleUpdateBudget}
                transactions={sortedTransactions}
                currency={currency}
                onBack={() => setActiveTab('home')}
                t={t}
              />
            ) : activeTab === 'transactions' ? (
              <Transactions transactions={sortedTransactions} handleDelete={handleDelete} searchQuery={searchQuery} t={t} />
            ) : activeTab === 'analytics' ? (
              <Analytics transactions={sortedTransactions} />
            ) : activeTab === 'ai' ? (
              <AiAssistant transactions={sortedTransactions} wallets={sortedWallets} budgets={budgets} userName={userName} monthlyBudget={monthlyBudget} />
            ) : activeTab === 'wallets' ? (
              <WalletsView 
                wallets={sortedWallets}
                transactions={sortedTransactions}
                openAddWallet={() => setIsAddWalletOpen(true)} 
                searchQuery={searchQuery}
                onDeleteWallet={handleDeleteWallet}
                onRenameWallet={handleRenameWallet}
                onAddSubSource={handleAddSubSource}
                onDeleteSubSource={handleDeleteSubSource}
                t={t}
              />
            ) : (
              <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-2 shadow-sm">
                  <LayoutDashboard size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h2>
                <p className="text-slate-500 text-sm">Navigate back to the Dashboard to see the full experience.</p>
                <button 
                  onClick={() => setActiveTab('home')}
                  className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-full font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 text-sm"
                >
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>
        </main>

        {/* MOBILE BOTTOM NAVIGATION */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} handleAddDemoTx={handleAddDemoTx} t={t} />
        
        {/* MODALS AND OVERLAYS */}
        <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} notifications={notifications} setNotifications={setNotifications} />
        <AddTransactionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddNewTransaction}
          wallets={wallets}
          currency={currency}
          transactions={transactions}
          t={t}
        />
        <AddWalletModal isOpen={isAddWalletOpen} onClose={() => setIsAddWalletOpen(false)} onAdd={handleAddNewWallet} />
        <EditProfileModal 
          isOpen={isEditProfileOpen} 
          onClose={() => setIsEditProfileOpen(false)} 
          userName={userName}
          setUserName={setUserName}
          userEmail={userEmail}
          setUserEmail={setUserEmail}
          userAvatar={userAvatar}
          setUserAvatar={setUserAvatar}
        />

        {/* Language Selection Modal */}
        <AnimatePresence>
          {isLanguageOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsLanguageOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm rounded-[2rem] p-6 z-[210] shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`}
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                      <Languages size={20} />
                    </div>
                    <h3 className="text-lg font-extrabold">{t.selectLang}</h3>
                  </div>
                  <button onClick={() => setIsLanguageOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-2">
                  {[
                    { code: 'en', name: 'English', native: 'English' },
                    { code: 'ur', name: 'Urdu', native: 'اردو' },
                    { code: 'ar', name: 'Arabic', native: 'العربية' },
                    { code: 'es', name: 'Spanish', native: 'Español' },
                    { code: 'fr', name: 'French', native: 'Français' },
                  ].map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLanguageOpen(false);
                      }}
                      className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
                        language === lang.code 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold' 
                          : isDarkMode 
                          ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-medium' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                      }`}
                    >
                      <span className="text-sm">{lang.name} ({lang.native})</span>
                      {language === lang.code && <Check size={18} />}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}