import React from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, ChevronRight, Plus, Info, Sparkles, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Transaction, Wallet as WalletType, Budget } from '../types';
import { CATEGORIES } from '../data';

interface DashboardProps {
  totalBalance: number;
  currentMonthIncome: number;
  currentMonthExpense: number;
  dailyAvgExpense: number;
  wallets: WalletType[];
  transactions: Transaction[];
  budgets: Budget[];
  monthlyBudget: number;
  currency: string;
  setActiveTab: (tab: string) => void;
  handleDelete: (id: string) => void;
}

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }
};

export default function Dashboard({
  totalBalance, currentMonthIncome, currentMonthExpense, dailyAvgExpense,
  wallets, transactions, budgets, monthlyBudget, currency, setActiveTab, handleDelete
}: DashboardProps) {

  const formatCurrency = (val: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(val);
    return `${currency} ${formatted}`;
  };

  const getCategoryIcon = (catName: string) => {
    const cat = CATEGORIES.find(c => c.name === catName);
    return cat ? cat.icon : '🏷️';
  };
  
  const getCategoryColor = (catName: string) => {
    const cat = CATEGORIES.find(c => c.name === catName);
    return cat ? cat.color : 'bg-slate-100 text-slate-700';
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* TOP STATS ROW */}
      <div className="flex flex-col gap-6">
        {/* Total Balance Card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2rem] bg-slate-900 dark:bg-black text-white p-7 shadow-2xl shadow-indigo-900/20 dark:shadow-none group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500 rounded-full blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500 rounded-full blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2 text-indigo-200">
                <Wallet className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wide uppercase">Available Funds</span>
              </div>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10">{currency.replace('.', '')}</span>
            </div>
            
            <h2 className="text-4xl font-extrabold tracking-tight mb-8">
              {formatCurrency(totalBalance)}
            </h2>
            
            <div className="flex items-center justify-between pt-5 border-t border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-indigo-200 font-medium mb-0.5">Income</p>
                  <p className="text-sm font-bold text-white">{formatCurrency(currentMonthIncome)}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                  <ArrowUpRight className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <p className="text-xs text-indigo-200 font-medium mb-0.5">Expense</p>
                  <p className="text-sm font-bold text-white">{formatCurrency(currentMonthExpense)}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Wallets Scroll Row */}
        <motion.div variants={itemVariants} className="flex flex-col min-w-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Your Wallets</h3>
            <button 
              onClick={() => setActiveTab('wallets')}
              className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center"
            >
              Manage <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
          <motion.div 
            className="flex-1 flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x"
            variants={containerVariants}
          >
            {wallets.map(w => (
              <motion.div 
                variants={itemVariants}
                key={w.id} 
                onClick={() => setActiveTab('wallets')}
                className={`min-w-[180px] md:min-w-[220px] rounded-3xl p-5 text-white shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 snap-center bg-gradient-to-br ${w.color} cursor-pointer`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-50 transition-opacity">
                  <span className="text-4xl filter drop-shadow-md">{w.icon}</span>
                </div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-1 bg-white/20 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md mb-2 border border-white/10">
                      {w.type}
                    </span>
                    <p className="text-sm font-semibold opacity-90">{w.name}</p>
                  </div>
                  <p className="text-2xl font-extrabold mt-6 tracking-tight drop-shadow-sm">{formatCurrency(w.balance)}</p>
                </div>
              </motion.div>
            ))}
            
            <motion.button 
              variants={itemVariants} 
              onClick={() => setActiveTab('wallets')}
              className="min-w-[140px] rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30 transition-all snap-center"
            >
              <Plus className="w-8 h-8 mb-2" />
              <span className="font-semibold text-sm">Add New</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* TWO COLUMN LAYOUT: Transactions & Budgets (NOW SINGLE COLUMN) */}
      <div className="flex flex-col gap-6">
        
        {/* Recent Transactions List */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100/60 dark:border-slate-800 min-w-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Transactions</h3>
            <button onClick={() => setActiveTab('transactions')} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl transition-colors">
              View All
            </button>
          </div>
          
          <div className="space-y-0 divide-y divide-slate-100/80 dark:divide-slate-800">
            {transactions.slice(0, 6).map(tx => (
              <motion.div variants={itemVariants} key={tx.id} className="group flex items-center justify-between py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all rounded-xl px-2 -mx-2">
                <div className="flex items-center space-x-3 flex-1 min-w-0 pr-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-sm shrink-0 ${getCategoryColor(tx.category)}`}>
                    {getCategoryIcon(tx.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{tx.note}</p>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="text-[11px] font-semibold text-slate-500 truncate">{tx.wallet}</span>
                      <span className="text-[10px] text-slate-300 dark:text-slate-600 shrink-0">•</span>
                      <span className="text-[11px] text-slate-400 font-medium shrink-0">{tx.date}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center space-x-2 shrink-0">
                  <div>
                    <p className={`text-sm font-extrabold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{tx.category}</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(tx.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-slate-300 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
            
            {transactions.length === 0 && (
              <div className="py-6 text-center text-sm font-medium text-slate-400">
                No recent transactions. Add one to get started!
              </div>
            )}
          </div>
        </motion.div>

        {/* Budgets & Quick Analytics */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Monthly Budgets Mini Widget */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Spending Limits</h3>
              <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                <Info size={18} />
              </button>
            </div>
            <div className="space-y-5">
              {/* Overall Monthly Budget */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold mb-2 gap-2">
                  <span className="flex items-center text-slate-700 dark:text-slate-300 shrink-0">
                    <span className="mr-2 opacity-80">💰</span> <span className="truncate">Monthly Spending Limit</span>
                  </span>
                  <span className="text-slate-900 dark:text-white text-right whitespace-nowrap flex items-center justify-end">
                    <span className="text-slate-400 font-medium text-[10px] mr-1.5 uppercase tracking-wider">Spent</span>
                    {formatCurrency(currentMonthExpense)} 
                    <span className="text-slate-400 font-medium text-[10px] ml-1">/ {formatCurrency(monthlyBudget)}</span>
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.round((currentMonthExpense / (monthlyBudget || 1)) * 100))}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    className={`h-full rounded-full ${currentMonthExpense >= monthlyBudget ? 'bg-rose-500' : (currentMonthExpense / (monthlyBudget || 1)) > 0.8 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                  />
                </div>
                <div className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 flex justify-between items-center">
                  <span>{currentMonthExpense >= monthlyBudget ? 'Limit Exceeded!' : 'Remaining Limit'}</span>
                  <span className={currentMonthExpense >= monthlyBudget ? 'text-rose-500 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
                    {formatCurrency(Math.max(0, monthlyBudget - currentMonthExpense))}
                  </span>
                </div>
              </div>
              <div className="w-full h-px bg-slate-100 dark:bg-slate-800 my-2" />
              
              {budgets.map(budget => {
                const spent = transactions
                  .filter(t => t.category === budget.category && t.type === 'expense')
                  .reduce((acc, t) => acc + t.amount, 0);
                const percent = Math.min(100, Math.round((spent / budget.limit) * 100));
                const isNearLimit = percent > 80;
                const isOverLimit = percent >= 100;

                return (
                  <div key={budget.id}>
                    <div className="flex justify-between items-center text-sm font-semibold mb-2 gap-2">
                      <span className="flex items-center text-slate-700 dark:text-slate-300 shrink-0">
                        <span className="mr-2 opacity-80">{budget.icon}</span> <span className="truncate">{budget.category}</span>
                      </span>
                      <span className="text-slate-900 dark:text-white text-right whitespace-nowrap flex items-center justify-end">
                        <span className="text-slate-400 font-medium text-[10px] mr-1.5 uppercase tracking-wider">Spent</span>
                        {formatCurrency(spent)} 
                        <span className="text-slate-400 font-medium text-[10px] ml-1">/ {formatCurrency(budget.limit)}</span>
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                        className={`h-full rounded-full ${isOverLimit ? 'bg-rose-500' : isNearLimit ? 'bg-amber-400' : 'bg-indigo-500'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Daily Spend Ad */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-slate-800 to-slate-950 dark:from-indigo-900 dark:to-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden border border-slate-700 dark:border-indigo-500/20"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
            <Sparkles className="w-8 h-8 text-indigo-400 mb-4" />
            <p className="text-indigo-200 text-sm font-medium mb-1">Average Daily Spend</p>
            <p className="text-3xl font-extrabold mb-4">{formatCurrency(dailyAvgExpense)}</p>
            <button 
              onClick={() => setActiveTab('analytics')}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-colors text-sm shadow-lg shadow-indigo-500/25"
            >
              View Detailed Insights
            </button>
          </motion.div>
        </motion.div>

      </div>
    </motion.div>
  );
}
