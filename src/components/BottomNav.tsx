import React from 'react';
import { Home, ArrowRightLeft, Plus, PieChart, User, Bot } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleAddDemoTx: () => void;
  isVisible: boolean;
}

export default function BottomNav({ activeTab, setActiveTab, handleAddDemoTx, isVisible }: BottomNavProps) {
  return (
    <nav className={`absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800 pb-safe pt-2 px-4 flex justify-between items-center z-50 rounded-b-[2.5rem] transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
      {[
        { id: 'home', icon: <Home size={22} /> },
        { id: 'transactions', icon: <ArrowRightLeft size={22} /> },
        { id: 'add', icon: <Plus size={28} />, isAction: true },
        { id: 'ai', icon: <Bot size={22} /> },
        { id: 'analytics', icon: <PieChart size={22} /> },
        { id: 'settings', icon: <User size={22} /> },
      ].map(item => (
        item.isAction ? (
          <button key="add" onClick={handleAddDemoTx} className="relative -top-6 w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-300 dark:shadow-indigo-900/50 hover:scale-105 active:scale-95 transition-all shrink-0">
            {item.icon}
          </button>
        ) : (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id!)}
            className={`p-2 rounded-2xl transition-all ${
              activeTab === item.id 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <div className={`${activeTab === item.id ? 'scale-110' : ''} transition-transform`}>
              {item.icon}
            </div>
          </button>
        )
      ))}
    </nav>
  );
}
