import { CurrencyContext } from './currency';
import { useState, useMemo, useEffect } from 'react';
import { Search, Bell, LayoutDashboard, X } from 'lucide-react';
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
import { deviceKey, useLocalState, localDate } from './storage';
import type { Transaction, Wallet } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);

  // Search State
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isLocked, setIsLocked] = useState(true);
  const [storageError, setStorageError] = useState('');
  const [isDarkMode, setIsDarkMode] = useLocalState('expense_darkMode', false, setStorageError);
  const [userName, setUserName] = useLocalState(deviceKey('userName'), 'User', setStorageError);
  const [userAvatar, setUserAvatar] = useLocalState<string | null>(deviceKey('userAvatar'), null, setStorageError);
  const [transactions, setTransactions] = useLocalState<Transaction[]>(deviceKey('transactions'), INITIAL_TRANSACTIONS, setStorageError);
  const [wallets, setWallets] = useLocalState<Wallet[]>(deviceKey('wallets'), INITIAL_WALLETS, setStorageError);
  const [budgets] = useLocalState(deviceKey('budgets'), INITIAL_BUDGETS, setStorageError);
  const [monthlyBudget, setMonthlyBudget] = useLocalState(deviceKey('monthlyBudget'), 50000, setStorageError);
  const [currency, setCurrency] = useLocalState(deviceKey('currency'), 'Rs.', setStorageError);
  const [budgetAlertLimit, setBudgetAlertLimit] = useLocalState(deviceKey('budgetAlertLimit'), 80, setStorageError);
  const [notifications, setNotifications] = useLocalState<AppNotification[]>(deviceKey('notifications'), [], setStorageError);
  useEffect(() => { document.documentElement.classList.toggle('dark', isDarkMode); }, [isDarkMode]);
  const monthTransactions = transactions.filter(t => t.date.slice(0, 7) === localDate().slice(0, 7));
  const liveBudgets = budgets.map(b => ({ ...b, spent: monthTransactions.filter(t => t.type === 'expense' && t.category === b.category).reduce((sum, t) => sum + t.amount, 0) }));

  // Reset search when changing tabs
  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  const totalBalance = useMemo(() => wallets.reduce((acc, w) => acc + w.balance, 0), [wallets]);

  const currentMonthIncome = useMemo(() => {
    return monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  }, [monthTransactions]);

  const currentMonthExpense = useMemo(() => {
    return monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  }, [monthTransactions]);

  const dailyAvgExpense = useMemo(() => {
    const daysInMonth = new Date().getDate();
    return Math.round(currentMonthExpense / (daysInMonth || 1));
  }, [currentMonthExpense]);

  const handleAddDemoTx = () => {
    setIsAddModalOpen(true);
  };

  const handleAddNewTransaction = (newTx: any) => {
    setTransactions(prev => [newTx, ...prev]);
    if (!wallets.some(w => w.name === newTx.wallet)) {
      setWallets(prev => [...prev, { id: crypto.randomUUID(), name: newTx.wallet, balance: newTx.type === 'income' ? newTx.amount : -newTx.amount, type: 'cash', icon: '💵', color: 'from-indigo-500 to-purple-600' }]);
    } else setWallets(prev => prev.map(w => {
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
      message: `${newTx.type === 'income' ? '+' : '-'}${currency} ${newTx.amount} for ${newTx.category} (${newTx.wallet})`,
      time: 'Just now',
      read: false,
      type: newTx.type === 'income' ? 'success' : 'alert'
    }, ...prev]);

    if (newTx.type === 'expense' && newTx.date.slice(0, 7) === localDate().slice(0, 7)) {
      const currentMonthExpenses = transactions
        .filter(t => t.type === 'expense' && t.date.slice(0, 7) === localDate().slice(0, 7))
        .reduce((sum, t) => sum + t.amount, 0) + newTx.amount;

      const alertThreshold = monthlyBudget * (budgetAlertLimit / 100);

      if (currentMonthExpenses >= alertThreshold) {
        setNotifications(prev => [{
          id: 'alert_' + Date.now().toString(),
          title: 'Budget Alert',
          message: `You have used ${Math.round((currentMonthExpenses/Math.max(1, monthlyBudget))*100)}% of your monthly budget!`,
          time: 'Just now',
          read: false,
          type: 'alert'
        }, ...prev]);
      }
    }

    setIsAddModalOpen(false);
  };

  const handleAddNewWallet = (newWallet: any) => {
    if (wallets.some(w => w.name.toLowerCase() === newWallet.name.trim().toLowerCase())) { alert('A wallet with this name already exists.'); return; }
    setWallets(prev => [...prev, newWallet]);
    setNotifications(prev => [{
      id: Date.now().toString(),
      title: 'New Wallet Created',
      message: `${newWallet.name} has been added with an initial balance of ${currency} ${newWallet.balance}.`,
      time: 'Just now',
      read: false,
      type: 'info'
    }, ...prev]);
  };

  const handleDelete = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx || !window.confirm('Delete this transaction? Its wallet balance will be updated.')) return;
    setWallets(prev => prev.map(w => w.name === tx.wallet ? { ...w, balance: w.balance + (tx.type === 'expense' ? tx.amount : -tx.amount) } : w));
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <CurrencyContext.Provider value={currency}><div className={`h-[100dvh] w-full overflow-hidden flex justify-center items-start font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-[#CBD5E1]'}`}>

      {/* Mobile Frame Container */}
      <div className={`w-full max-w-[1200px] h-[100dvh] shadow-2xl overflow-hidden flex flex-col relative  ring-1 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 border-black ring-slate-800' : 'bg-[#F4F7FE] border-slate-900 ring-slate-800'}`}>

        {isLocked && <LockScreen onUnlock={() => setIsLocked(false)} />}
        {storageError && <div role="alert" className="bg-rose-100 text-rose-900 p-4 text-sm">{storageError}</div>}
        {/* MAIN CONTENT AREA */}
        <main inert={isLocked} className="flex-1 flex flex-col overflow-x-hidden relative">
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
                aria-label="Search" onClick={() => { setActiveTab('transactions'); setIsSearching(!isSearching); }}
                className={`relative p-2.5 rounded-full shadow-sm hover:shadow-md transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-500 hover:text-indigo-600'}`}
              >
                {isSearching ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </button>
              <button
                aria-label="Notifications" onClick={() => setIsNotificationsOpen(true)}
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
                budgets={liveBudgets}
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
                onLock={() => setIsLocked(true)}
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
              <Analytics transactions={monthTransactions} />
            ) : activeTab === 'ai' ? (
              <AiAssistant transactions={transactions} wallets={wallets} budgets={liveBudgets} userName={userName} monthlyBudget={monthlyBudget} />
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
        {!isLocked && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} handleAddDemoTx={handleAddDemoTx} />}

        {/* MODALS AND OVERLAYS */}
        <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} notifications={notifications} setNotifications={setNotifications} />
        <AddTransactionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddNewTransaction} wallets={wallets} currency={currency} />
        <AddWalletModal isOpen={isAddWalletOpen} onClose={() => setIsAddWalletOpen(false)} onAdd={handleAddNewWallet} />
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          userName={userName}
          setUserName={setUserName}
          userAvatar={userAvatar}
          setUserAvatar={setUserAvatar}
        />
      </div>
    </div></CurrencyContext.Provider>
  );
}
