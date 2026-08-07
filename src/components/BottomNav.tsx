import React from 'react';
import { Home, ArrowRightLeft, Plus, PieChart, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleAddDemoTx: () => void;
}

export default function BottomNav({ activeTab, setActiveTab, handleAddDemoTx }: BottomNavProps) {
  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200/50 pb-safe pt-2 px-6 flex justify-between items-center z-50">
      {[
        { id: 'home', icon: <Home size={24} /> },
        { id: 'transactions', icon: <ArrowRightLeft size={24} /> },
        { id: 'add', icon: <Plus size={28} />, isAction: true },
        { id: 'analytics', icon: <PieChart size={24} /> },
        { id: 'settings', icon: <User size={24} /> },
      ].map(item => (
        item.isAction ? (
          <button key="add" onClick={handleAddDemoTx} className="relative -top-6 w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-300 hover:scale-105 active:scale-95 transition-all shrink-0">
            {item.icon}
          </button>
        ) : (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id!)}
            className={`p-3 rounded-2xl transition-all ${
              activeTab === item.id 
                ? 'text-indigo-600' 
                : 'text-slate-400 hover:text-slate-600'
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
