import React from 'react';
import { Wallet, LayoutDashboard, ArrowRightLeft, PieChart, Award, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName: string;
}

export default function Sidebar({ activeTab, setActiveTab, userName }: SidebarProps) {
  return (
    <aside className="hidden md:flex landscape:flex md:flex-col landscape:flex-col w-64 bg-white/70 backdrop-blur-xl border-r border-slate-200/60 p-6 sticky top-0 h-screen shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 overflow-y-auto scrollbar-none">
      <div className="flex items-center space-x-3 mb-10">
        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900">FinTrack</span>
      </div>

      <nav className="flex-1 space-y-2">
        {[
          { id: 'home', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
          { id: 'transactions', icon: <ArrowRightLeft size={20} />, label: 'Transactions' },
          { id: 'analytics', icon: <PieChart size={20} />, label: 'Analytics' },
          { id: 'budgets', icon: <Award size={20} />, label: 'Budgets' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium ${
              activeTab === item.id 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className={`${activeTab === item.id ? 'scale-110' : ''} transition-transform duration-300`}>
              {item.icon}
            </div>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100">
        <button 
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl border text-left transition-all ${
            activeTab === 'settings' 
              ? 'bg-indigo-50 border-indigo-100' 
              : 'bg-slate-50 border-slate-100 hover:border-indigo-200'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
            {userName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">Pro Member</p>
          </div>
          <Settings size={18} className={`${activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-400'} shrink-0`} />
        </button>
      </div>
    </aside>
  );
}
