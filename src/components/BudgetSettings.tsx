import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Bell, AlertTriangle, ShieldCheck, Plus, Edit2, Check, X, ArrowLeft, Sparkles, Calendar, Clock } from 'lucide-react';
import type { Budget, Transaction } from '../types';

interface BudgetSettingsProps {
  dailyBudget: number;
  setDailyBudget: (limit: number) => void;
  monthlyBudget: number;
  setMonthlyBudget: (limit: number) => void;
  budgets: Budget[];
  onUpdateBudget: (id: string, updates: Partial<Budget>) => void;
  onAddBudget?: (newBudget: Omit<Budget, 'id' | 'spent'>) => void;
  transactions: Transaction[];
  currency: string;
  onBack?: () => void;
  t: any;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 30 } }
};

export default function BudgetSettings({
  dailyBudget,
  setDailyBudget,
  monthlyBudget,
  setMonthlyBudget,
  budgets,
  onUpdateBudget,
  onAddBudget,
  transactions,
  currency,
  onBack,
  t
}: BudgetSettingsProps) {
  const [editingCategoryBudget, setEditingCategoryBudget] = useState<Budget | null>(null);
  const [tempDailyLimit, setTempDailyLimit] = useState('');
  const [tempMonthlyLimit, setTempMonthlyLimit] = useState('');
  
  const [editingOverall, setEditingOverall] = useState<'daily' | 'monthly' | null>(null);
  const [overallInputValue, setOverallInputValue] = useState('');

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const formatCurrency = (val: number) => {
    return `${currency} ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(val)}`;
  };

  // Today's Expense Calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpense = transactions
    .filter(t => t.type === 'expense' && t.date === todayStr)
    .reduce((sum, t) => sum + t.amount, 0);

  // Current Month's Expense Calculation
  const currentMonthStr = todayStr.substring(0, 7);
  const currentMonthExpense = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonthStr))
    .reduce((sum, t) => sum + t.amount, 0);

  const dailyPercent = Math.min(100, Math.round((todayExpense / (dailyBudget || 1)) * 100));
  const monthlyPercent = Math.min(100, Math.round((currentMonthExpense / (monthlyBudget || 1)) * 100));

  const handleSaveCategoryBudget = () => {
    if (!editingCategoryBudget) return;
    const dLim = parseInt(tempDailyLimit.replace(/[^0-9]/g, ''), 10) || 0;
    const mLim = parseInt(tempMonthlyLimit.replace(/[^0-9]/g, ''), 10) || 0;

    onUpdateBudget(editingCategoryBudget.id, {
      dailyLimit: dLim,
      limit: mLim
    });

    setEditingCategoryBudget(null);
    showToast(`${editingCategoryBudget.category} budget limits updated!`);
  };

  const handleSaveOverallLimit = () => {
    const val = parseInt(overallInputValue.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(val) && val > 0) {
      if (editingOverall === 'daily') {
        setDailyBudget(val);
        showToast('Daily spending limit updated!');
      } else if (editingOverall === 'monthly') {
        setMonthlyBudget(val);
        showToast('Monthly spending limit updated!');
      }
      setEditingOverall(null);
    }
  };

  return (
    <div className="relative min-h-full w-full pb-24">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white px-5 py-2.5 rounded-full shadow-2xl z-[500] text-xs font-bold border border-slate-700 whitespace-nowrap flex items-center space-x-2"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="max-w-3xl mx-auto space-y-6 px-4 pt-2"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center">
                <Target size={22} className="mr-2.5 text-indigo-500" /> Budget Settings
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Daily & Monthly Limits with Smart Threshold Alerts</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 px-3 py-1.5 rounded-xl">
            <Bell size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Smart Alerts</span>
          </div>
        </div>

        {/* OVERALL LIMITS GRID (DAILY & MONTHLY) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Daily Limit Card */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center font-bold">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Limit</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Today's Target</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingOverall('daily');
                  setOverallInputValue(String(dailyBudget));
                }}
                className="p-2 rounded-xl text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
              >
                <Edit2 size={16} />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(todayExpense)}</span>
                <span className="text-xs font-bold text-slate-400">/ {formatCurrency(dailyBudget)}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dailyPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full transition-colors ${
                    dailyPercent >= 100 
                      ? 'bg-gradient-to-r from-rose-500 to-red-600' 
                      : dailyPercent >= 80 
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500' 
                      : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Remaining Today</span>
              <span className={`font-black ${todayExpense >= dailyBudget ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {todayExpense >= dailyBudget ? 'Limit Exceeded!' : formatCurrency(Math.max(0, dailyBudget - todayExpense))}
              </span>
            </div>

            {/* Threshold Badge */}
            {dailyPercent >= 80 && (
              <div className={`mt-3 p-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                dailyPercent >= 100 
                  ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 border border-rose-200 dark:border-rose-800/50' 
                  : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 border border-amber-200 dark:border-amber-800/50'
              }`}>
                <AlertTriangle size={16} className="shrink-0" />
                <span>{dailyPercent >= 100 ? '🚨 Daily limit exceeded! Local alert triggered.' : '⚠️ 80% of daily limit reached!'}</span>
              </div>
            )}
          </motion.div>

          {/* Monthly Limit Card */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center font-bold">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Limit</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Overall Target</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingOverall('monthly');
                  setOverallInputValue(String(monthlyBudget));
                }}
                className="p-2 rounded-xl text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
              >
                <Edit2 size={16} />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(currentMonthExpense)}</span>
                <span className="text-xs font-bold text-slate-400">/ {formatCurrency(monthlyBudget)}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${monthlyPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full transition-colors ${
                    monthlyPercent >= 100 
                      ? 'bg-gradient-to-r from-rose-500 to-red-600' 
                      : monthlyPercent >= 80 
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500' 
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Remaining This Month</span>
              <span className={`font-black ${currentMonthExpense >= monthlyBudget ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {currentMonthExpense >= monthlyBudget ? 'Limit Exceeded!' : formatCurrency(Math.max(0, monthlyBudget - currentMonthExpense))}
              </span>
            </div>

            {/* Threshold Badge */}
            {monthlyPercent >= 80 && (
              <div className={`mt-3 p-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                monthlyPercent >= 100 
                  ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 border border-rose-200 dark:border-rose-800/50' 
                  : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 border border-amber-200 dark:border-amber-800/50'
              }`}>
                <AlertTriangle size={16} className="shrink-0" />
                <span>{monthlyPercent >= 100 ? '🚨 Monthly limit exceeded!' : '⚠️ 80% of monthly budget used!'}</span>
              </div>
            )}
          </motion.div>

        </div>

        {/* NOTIFICATION THRESHOLD RULES BANNER */}
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-[2rem] p-5 text-white shadow-md relative overflow-hidden flex items-center justify-between border border-slate-700">
          <div className="flex items-center space-x-3.5 z-10">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white">Active Alert Notifications</h4>
              <p className="text-xs text-slate-300 font-medium">App triggers local toast notifications at 80% & 100% budget thresholds.</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 shrink-0">Active</span>
        </motion.div>

        {/* PER-CATEGORY BUDGET LIMITS SECTION */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex justify-between items-center px-1 pt-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Category Limits</h3>
              <p className="text-xs text-slate-400 font-semibold">Set individual daily & monthly limits per category</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map(budget => {
              // Calculate category today expense
              const catTodayExpense = transactions
                .filter(t => t.type === 'expense' && t.category === budget.category && t.date === todayStr)
                .reduce((s, t) => s + t.amount, 0);

              // Calculate category month expense
              const catMonthExpense = transactions
                .filter(t => t.type === 'expense' && t.category === budget.category && t.date.startsWith(currentMonthStr))
                .reduce((s, t) => s + t.amount, 0);

              const catDailyLimit = budget.dailyLimit || Math.round(budget.limit / 30);
              const catDailyPercent = Math.min(100, Math.round((catTodayExpense / (catDailyLimit || 1)) * 100));
              const catMonthPercent = Math.min(100, Math.round((catMonthExpense / (budget.limit || 1)) * 100));

              return (
                <motion.div
                  key={budget.id}
                  variants={itemVariants}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 hover:border-indigo-200 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xl flex items-center justify-center">
                        {budget.icon}
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{budget.category}</h4>
                        <p className="text-[11px] font-bold text-slate-400">Daily: {formatCurrency(catDailyLimit)} • Monthly: {formatCurrency(budget.limit)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingCategoryBudget(budget);
                        setTempDailyLimit(String(catDailyLimit));
                        setTempMonthlyLimit(String(budget.limit));
                      }}
                      className="p-2 rounded-xl text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>

                  {/* Daily Category Bar */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-400 font-semibold">Today ({catDailyPercent}%)</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(catTodayExpense)} / {formatCurrency(catDailyLimit)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${catDailyPercent}%` }}
                        className={`h-full rounded-full ${catDailyPercent >= 100 ? 'bg-rose-500' : catDailyPercent >= 80 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                      />
                    </div>
                  </div>

                  {/* Monthly Category Bar */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-400 font-semibold">Monthly ({catMonthPercent}%)</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(catMonthExpense)} / {formatCurrency(budget.limit)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${catMonthPercent}%` }}
                        className={`h-full rounded-full ${catMonthPercent >= 100 ? 'bg-rose-500' : catMonthPercent >= 80 ? 'bg-amber-400' : 'bg-indigo-500'}`}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </motion.div>

      {/* EDIT OVERALL LIMIT MODAL */}
      <AnimatePresence>
        {editingOverall && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl w-full max-w-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize">
                  Edit {editingOverall} Limit
                </h3>
                <button onClick={() => setEditingOverall(null)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {editingOverall === 'daily' ? 'Daily Target Limit' : 'Monthly Target Limit'} ({currency})
                  </label>
                  <input
                    type="number"
                    value={overallInputValue}
                    onChange={(e) => setOverallInputValue(e.target.value)}
                    className="mt-1.5 w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border rounded-xl text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter limit..."
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button onClick={() => setEditingOverall(null)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold">Cancel</button>
                <button onClick={handleSaveOverallLimit} className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <Check size={18} className="mr-1" /> Save Limit
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* EDIT CATEGORY BUDGET MODAL */}
        {editingCategoryBudget && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl w-full max-w-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{editingCategoryBudget.icon}</span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{editingCategoryBudget.category}</h3>
                </div>
                <button onClick={() => setEditingCategoryBudget(null)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Daily Limit ({currency})</label>
                  <input
                    type="number"
                    value={tempDailyLimit}
                    onChange={(e) => setTempDailyLimit(e.target.value)}
                    className="mt-1.5 w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Monthly Limit ({currency})</label>
                  <input
                    type="number"
                    value={tempMonthlyLimit}
                    onChange={(e) => setTempMonthlyLimit(e.target.value)}
                    className="mt-1.5 w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 15000"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button onClick={() => setEditingCategoryBudget(null)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold">Cancel</button>
                <button onClick={handleSaveCategoryBudget} className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <Check size={18} className="mr-1" /> Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
