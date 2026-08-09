import React from 'react';
import { Home, ArrowRightLeft, Plus, PieChart, User, Bot } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleAddDemoTx: () => void;
  t: any;
}

export default function BottomNav({ activeTab, setActiveTab, handleAddDemoTx, t }: BottomNavProps) {
  const items = [
    { id: 'home', icon: <Home size={20} />, label: t.dashboard },
    { id: 'transactions', icon: <ArrowRightLeft size={20} />, label: t.activity },
    { id: 'add', icon: <Plus size={26} />, isAction: true, label: t.add },
    { id: 'ai', icon: <Bot size={20} />, label: t.ai },
    { id: 'analytics', icon: <PieChart size={20} />, label: t.stats },
    { id: 'settings', icon: <User size={20} />, label: t.profile },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/80 pb-5 pt-2 px-1.5 flex justify-around items-center z-40 rounded-b-[2.5rem] shadow-lg h-22">
      {items.map(item => (
        item.isAction ? (
          <div key="add" className="flex flex-col items-center relative -top-4">
            <button
              onClick={handleAddDemoTx}
              className="w-13 h-13 sm:w-14 sm:h-14 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all shrink-0 border-4 border-slate-50 dark:border-slate-950"
            >
              {item.icon}
            </button>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 tracking-tight">
              {item.label}
            </span>
          </div>
        ) : (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-w-[46px] ${
              activeTab === item.id 
                ? 'text-indigo-600 dark:text-indigo-400 font-bold' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
            }`}
          >
            <div className={`transition-transform duration-200 ${activeTab === item.id ? 'scale-110' : 'scale-100'}`}>
              {item.icon}
            </div>
            <span className={`text-[10px] mt-0.5 tracking-tight truncate max-w-[54px] text-center ${
              activeTab === item.id ? 'font-bold opacity-100' : 'font-medium opacity-80'
            }`}>
              {item.label}
            </span>
          </button>
        )
      ))}
    </nav>
  );
}
