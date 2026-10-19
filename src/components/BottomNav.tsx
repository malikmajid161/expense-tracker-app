import { Home, ArrowRightLeft, Plus, PieChart, User, Wallet } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleAddDemoTx: () => void;
}

export default function BottomNav({ activeTab, setActiveTab, handleAddDemoTx }: BottomNavProps) {
  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800 pb-safe pt-2 px-2 grid grid-cols-6 items-center justify-items-center z-40 ">
      {[
        { id: 'home', icon: <Home size={22} /> },
        { id: 'transactions', icon: <ArrowRightLeft size={22} /> },
        { id: 'add', icon: <Plus size={28} />, isAction: true },
        { id: 'wallets', icon: <Wallet size={22} /> },
        { id: 'analytics', icon: <PieChart size={22} /> },
        { id: 'settings', icon: <User size={22} /> },
      ].map(item => (
        item.isAction ? (
          <button key="add" aria-label="Add transaction" title="Add transaction" onClick={handleAddDemoTx} className="relative -top-6 w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-300 dark:shadow-indigo-900/50 hover:scale-105 active:scale-95 transition-all shrink-0">
            {item.icon}
          </button>
        ) : (
          <button
            key={item.id}
            aria-label={item.id === 'home' ? 'Overview' : item.id}
            aria-current={activeTab === item.id ? 'page' : undefined}
            onClick={() => setActiveTab(item.id!)}
            className={`min-w-0 w-full flex flex-col items-center p-1 rounded-2xl transition-all ${
              activeTab === item.id
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <div className={`${activeTab === item.id ? 'scale-110' : ''} transition-transform`}>
              {item.icon}
            </div>
            <span className="text-xs mt-1 block capitalize">{item.id === 'home' ? 'Home' : item.id === 'transactions' ? 'Activity' : item.id}</span>
          </button>
        )
      ))}
    </nav>
  );
}
