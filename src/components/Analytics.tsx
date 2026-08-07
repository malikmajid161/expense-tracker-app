import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart as PieChartIcon, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import type { Transaction } from '../types';

interface AnalyticsProps {
  transactions: Transaction[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }
};

const CHART_COLORS = ['#6366f1', '#f43f5e', '#fbbf24', '#10b981', '#a855f7', '#64748b'];
const TW_BG_COLORS = ['bg-indigo-500', 'bg-rose-500', 'bg-amber-400', 'bg-emerald-500', 'bg-purple-500', 'bg-slate-500'];

export default function Analytics({ transactions }: AnalyticsProps) {

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val).replace('PKR', 'Rs.');
  };

  const currentMonthExpense = useMemo(() => {
    return transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Take top 5
  }, [transactions]);

  const incomeByCategory = useMemo(() => {
    const incomes = transactions.filter(t => t.type === 'income');
    const grouped = incomes.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const highestExpense = expenseByCategory[0] || { name: 'None', amount: 0 };
  const topIncome = incomeByCategory[0] || { name: 'None', amount: 0 };

  // Calculate conic gradient string for the donut chart
  const donutGradient = useMemo(() => {
    if (currentMonthExpense === 0) return 'conic-gradient(#f1f5f9 0% 100%)';
    
    let currentPercent = 0;
    const segments = expenseByCategory.map((cat, i) => {
      const percentage = (cat.amount / currentMonthExpense) * 100;
      const start = currentPercent;
      const end = currentPercent + percentage;
      currentPercent = end;
      return `${CHART_COLORS[i % CHART_COLORS.length]} ${start}% ${end}%`;
    });
    
    // Fill remaining with gray if there are expenses not in the top 5
    if (currentPercent < 100) {
      segments.push(`#f1f5f9 ${currentPercent}% 100%`);
    }
    
    return `conic-gradient(${segments.join(', ')})`;
  }, [expenseByCategory, currentMonthExpense]);

  return (
    <motion.div 
      className="max-w-5xl mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="grid grid-cols-1 gap-6">
        
        {/* Main Expense Chart */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100/60 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
              <PieChartIcon className="w-5 h-5 mr-2 text-indigo-500" /> Expense Breakdown
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center py-6">
            
            {/* CSS Donut Chart */}
            <div 
              className="relative w-48 h-48 rounded-full mb-8 flex items-center justify-center shadow-inner"
              style={{ background: donutGradient }}
            >
              <div className="absolute inset-0 m-4 bg-white dark:bg-slate-900 rounded-full flex flex-col items-center justify-center">
                <p className="text-xs text-slate-400 font-semibold">Total Spent</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">{formatCurrency(currentMonthExpense)}</p>
              </div>
            </div>
            
            {/* Dynamic Legend */}
            <div className="w-full space-y-3 px-2">
              {expenseByCategory.length === 0 ? (
                <div className="text-center text-sm text-slate-400 py-4 font-medium">No expenses recorded yet.</div>
              ) : (
                expenseByCategory.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3">
                      <span className={`w-3.5 h-3.5 rounded-full ${TW_BG_COLORS[i % TW_BG_COLORS.length]}`}></span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {cat.name} ({Math.round((cat.amount / currentMonthExpense) * 100)}%)
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(cat.amount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Trend Card */}
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <Activity className="w-8 h-8 text-indigo-300 mb-4" />
            <h3 className="text-lg font-bold mb-1">Monthly Trend</h3>
            <p className="text-indigo-200 text-sm mb-6">Track your daily activity and monitor your spending trajectory.</p>
            
            <div className="flex items-end justify-between h-24 pt-4 border-b border-white/20 px-2">
              {[60, 80, 45, 90, 50, 75, 65, 40, 85].map((val, i) => (
                <div key={i} className="w-3 bg-white/30 hover:bg-white rounded-t-sm transition-colors cursor-pointer" style={{ height: `${val}%` }}></div>
              ))}
            </div>
          </motion.div>

          {/* Quick Insights */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100/60 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Key Insights</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-xl shrink-0"><TrendingDown className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Highest Expense</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {highestExpense.name !== 'None' ? `${highestExpense.name} at ${formatCurrency(highestExpense.amount)}` : 'No expenses yet'}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-xl shrink-0"><TrendingUp className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Top Income Source</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {topIncome.name !== 'None' ? `${topIncome.name} at ${formatCurrency(topIncome.amount)}` : 'No income yet'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
