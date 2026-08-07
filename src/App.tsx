import React, { useState, useMemo, useEffect } from 'react';
import { Search, Bell, Plus, LayoutDashboard, Smartphone, X } from 'lucide-react';
import { INITIAL_TRANSACTIONS, INITIAL_WALLETS, INITIAL_BUDGETS } from './data';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Transactions from './components/Transactions';
import Analytics from './components/Analytics';
import NotificationsPanel, { type AppNotification } from './components/NotificationsPanel';
import WalletsView from './components/WalletsView';
import AddTransactionModal from './components/AddTransactionModal';
import EditProfileModal from './components/EditProfileModal';
import AddWalletModal from './components/AddWalletModal';
import LockScreen from './components/LockScreen';
import AiAssistant from './components/AiAssistant';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  
  // Search State
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auth state
  const [currentUser, setCurrentUser] = useState<string | null>(() => localStorage.getItem('expense_currentUser'));
  const [isLocked, setIsLocked] = useState(!localStorage.getItem('expense_currentUser'));

  // App Preferences & Security
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('expense_darkMode') === 'true');
  const [biometricEnabled, setBiometricEnabled] = useState(() => localStorage.getItem('expense_biometric') === 'true');

  // Profile State
  const [userName, setUserName] = useState(() => localStorage.getItem(`expense_userName_${currentUser}`) || 'User');
  const [userEmail, setUserEmail] = useState(() => currentUser || 'guest@example.com');
  const [userAvatar, setUserAvatar] = useState<string | null>(() => localStorage.getItem(`expense_userAvatar_${currentUser}`));
  
  const [transactions, setTransactions] = useState(() => {
    const user = localStorage.getItem('expense_currentUser') || 'guest';
    const saved = localStorage.getItem(`expense_transactions_${user}`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  const [wallets, setWallets] = useState(() => {
    const user = localStorage.getItem('expense_currentUser') || 'guest';
    const saved = localStorage.getItem(`expense_wallets_${user}`);
    return saved ? JSON.parse(saved) : INITIAL_WALLETS;
  });
  
  const [budgets, setBudgets] = useState(() => {
    const user = localStorage.getItem('expense_currentUser') || 'guest';
    const saved = localStorage.getItem(`expense_budgets_${user}`);
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const user = localStorage.getItem('expense_currentUser') || 'guest';
    const saved = localStorage.getItem(`expense_monthlyBudget_${user}`);
    return saved ? Number(saved) : 50000;
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

  // Reload data when user changes
  useEffect(() => {
    if (currentUser) {
      const savedTx = localStorage.getItem(`expense_transactions_${currentUser}`);
      if (savedTx) setTransactions(JSON.parse(savedTx));
      else setTransactions(INITIAL_TRANSACTIONS);
      
      const savedWallets = localStorage.getItem(`expense_wallets_${currentUser}`);
      if (savedWallets) setWallets(JSON.parse(savedWallets));
      else setWallets(INITIAL_WALLETS);
      
      const savedNotifs = localStorage.getItem(`expense_notifications_${currentUser}`);
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
      
      const savedBudgets = localStorage.getItem(`expense_budgets_${currentUser}`);
      if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
      else setBudgets(INITIAL_BUDGETS);

      const savedMonthly = localStorage.getItem(`expense_monthlyBudget_${currentUser}`);
      setMonthlyBudget(savedMonthly ? Number(savedMonthly) : 50000);

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
  useEffect(() => { if (currentUser) localStorage.setItem(`expense_monthlyBudget_${currentUser}`, String(monthlyBudget)); }, [monthlyBudget, currentUser]);
  useEffect(() => { if (currentUser) localStorage.setItem(`expense_currency_${currentUser}`, currency); }, [currency, currentUser]);
  useEffect(() => { if (currentUser) localStorage.setItem(`expense_budgetAlertLimit_${currentUser}`, String(budgetAlertLimit)); }, [budgetAlertLimit, currentUser]);
  useEffect(() => { localStorage.setItem('expense_biometric', String(biometricEnabled)); }, [biometricEnabled]);
  useEffect(() => { if (currentUser) localStorage.setItem(`expense_notifications_${currentUser}`, JSON.stringify(notifications)); }, [notifications, currentUser]);
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
    setWallets(prev => prev.map(w => {
      if (w.name === newTx.wallet) {
        return {
          ...w,
          balance: newTx.type === 'income' ? w.balance + newTx.amount : w.balance - newTx.amount
        };
      }
      return w;
    }));
    
    setNotifications(prev => [{
      id: Date.now().toString(),
      title: newTx.type === 'income' ? 'Income Added' : 'Expense Recorded',
      message: `${newTx.type === 'income' ? '+' : '-'}Rs. ${newTx.amount} for ${newTx.category} (${newTx.wallet})`,
      time: 'Just now',
      read: false,
      type: newTx.type === 'income' ? 'success' : 'alert'
    }, ...prev]);

    if (newTx.type === 'expense') {
      const currentMonthExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) + newTx.amount;
        
      const alertThreshold = monthlyBudget * (budgetAlertLimit / 100);
      
      if (currentMonthExpenses >= alertThreshold) {
        setNotifications(prev => [{
          id: 'alert_' + Date.now().toString(),
          title: 'Budget Alert',
          message: `You have used ${Math.round((currentMonthExpenses/monthlyBudget)*100)}% of your monthly budget!`,
          time: 'Just now',
          read: false,
          type: 'alert'
        }, ...prev]);
      }
    }
    
    setIsAddModalOpen(false);
  };

  const handleAddNewWallet = (newWallet: any) => {
    setWallets([...wallets, newWallet]);
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
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`min-h-[100dvh] flex justify-center items-start md:items-center md:py-6 font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-[#CBD5E1]'}`}>
      
      {/* Mobile Frame Container */}
      <div className={`w-full max-w-[420px] min-h-[100dvh] md:min-h-0 md:h-[850px] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative md:border-[12px] ring-1 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 border-black ring-slate-800' : 'bg-[#F4F7FE] border-slate-900 ring-slate-800'}`}>
        
        {/* Biometric Lock Screen */}
        {isLocked && (
          <LockScreen onUnlock={(email: string) => {
            localStorage.setItem('expense_currentUser', email);
            setCurrentUser(email);
            setIsLocked(false);
          }} />
        )}
        
        {/* Status Bar (Simulated Mobile Header) */}
        <div className={`hidden md:flex text-white px-6 pt-3 pb-2 justify-between items-center text-xs font-semibold tracking-wide transition-colors ${isDarkMode ? 'bg-black' : 'bg-slate-900'}`}>
          <span>9:41</span>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">5G</span>
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
            <Smartphone className="w-3.5 h-3.5 opacity-80" />
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col overflow-x-hidden relative">
          {/* Background decorative blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] rounded-full bg-indigo-300/30 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[40%] rounded-full bg-purple-300/30 blur-[100px] pointer-events-none" />

          {/* HEADER */}
          <header className={`px-6 py-5 flex justify-between items-center z-10 sticky top-0 backdrop-blur-md border-b transition-colors ${isDarkMode ? 'bg-slate-950/80 border-white/5' : 'bg-[#F4F7FE]/80 border-white/50'}`}>
            {isSearching ? (
              <div className="flex-1 flex items-center relative mr-3">
                <Search className={`absolute left-3 w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} />
                <input 
                  type="text" 
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search here..." 
                  className={`w-full py-2.5 pl-9 pr-4 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors ${isDarkMode ? 'bg-slate-800 text-white placeholder:text-slate-500' : 'bg-white text-slate-900 shadow-sm'}`}
                />
              </div>
            ) : (
              <div>
                <h1 className={`text-2xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {activeTab === 'home' ? 'Overview' : activeTab === 'settings' ? 'Profile' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
                <p className="text-slate-500 text-xs font-medium mt-0.5">Track and manage your finances</p>
              </div>
            )}
            
            <div className="flex items-center space-x-3 shrink-0">
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

          {/* CONTENT - Padding bottom clears the nav bar properly */}
          <div className="flex-1 px-4 py-5 pb-24 overflow-y-auto scrollbar-none relative">
            {activeTab === 'home' ? (
              <Dashboard 
                totalBalance={totalBalance}
                currentMonthIncome={currentMonthIncome}
                currentMonthExpense={currentMonthExpense}
                dailyAvgExpense={dailyAvgExpense}
                wallets={wallets}
                transactions={transactions}
                budgets={budgets}
                monthlyBudget={monthlyBudget}
                setActiveTab={setActiveTab}
                handleDelete={handleDelete}
              />
            ) : activeTab === 'settings' ? (
              <Settings 
                userName={userName} 
                userAvatar={userAvatar}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                biometricEnabled={biometricEnabled}
                setBiometricEnabled={setBiometricEnabled}
                openEditProfile={() => setIsEditProfileOpen(true)}
                openNotifications={() => setIsNotificationsOpen(true)}
                transactions={transactions}
                monthlyBudget={monthlyBudget}
                setMonthlyBudget={setMonthlyBudget}
                currency={currency}
                setCurrency={setCurrency}
                budgetAlertLimit={budgetAlertLimit}
                setBudgetAlertLimit={setBudgetAlertLimit}
              />
            ) : activeTab === 'transactions' ? (
              <Transactions transactions={transactions} handleDelete={handleDelete} searchQuery={searchQuery} />
            ) : activeTab === 'analytics' ? (
              <Analytics transactions={transactions} />
            ) : activeTab === 'ai' ? (
              <AiAssistant transactions={transactions} wallets={wallets} budgets={budgets} userName={userName} monthlyBudget={monthlyBudget} />
            ) : activeTab === 'wallets' ? (
              <WalletsView wallets={wallets} transactions={transactions} openAddWallet={() => setIsAddWalletOpen(true)} searchQuery={searchQuery} />
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
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} handleAddDemoTx={handleAddDemoTx} />
        
        {/* MODALS AND OVERLAYS */}
        <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} notifications={notifications} setNotifications={setNotifications} />
        <AddTransactionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddNewTransaction} wallets={wallets} currency={currency} />
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
      </div>
    </div>
  );
}