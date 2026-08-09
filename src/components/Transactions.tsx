import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter, Trash2, FileText, Calendar, Wallet as WalletIcon, User, RefreshCw } from 'lucide-react';
import type { Transaction } from '../types';
import { CATEGORIES } from '../data';

interface TransactionsProps {
  transactions: Transaction[];
  handleDelete: (id: string) => void;
  searchQuery?: string;
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

export default function Transactions({ transactions, handleDelete, searchQuery = '', t }: TransactionsProps) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedWallet, setSelectedWallet] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val).replace('PKR', 'Rs.');
  };

  const getCategoryIcon = (catName: string) => {
    const cat = CATEGORIES.find(c => c.name === catName);
    return cat ? cat.icon : '🏷️';
  };
  
  const getCategoryColor = (catName: string) => {
    const cat = CATEGORIES.find(c => c.name === catName);
    return cat ? cat.color : 'bg-slate-100 text-slate-700';
  };

  // Available Wallets for dropdown
  const availableWallets = useMemo(() => {
    const wallets = transactions.map(t => t.wallet);
    return Array.from(new Set(wallets)).sort();
  }, [transactions]);

  // Available Sources / Persons for dropdown
  const availableSources = useMemo(() => {
    const sources = transactions.map(t => t.source).filter(Boolean) as string[];
    return Array.from(new Set(sources)).sort();
  }, [transactions]);

  // Available Categories for dropdown
  const allCategories = useMemo(() => {
    const hardcoded = CATEGORIES.map(c => c.name);
    const txCategories = transactions.map(t => t.category);
    const combined = [...hardcoded, ...txCategories].map(name => {
      const trimmed = name.trim();
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    });
    return Array.from(new Set(combined)).sort();
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        t.note.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.wallet.toLowerCase().includes(query) ||
        (t.source && t.source.toLowerCase().includes(query));
      
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesWallet = selectedWallet === 'all' || t.wallet === selectedWallet;
      const matchesSource = selectedSource === 'all' || t.source === selectedSource;

      const normalizedTxCat = t.category.charAt(0).toUpperCase() + t.category.slice(1).trim();
      const matchesCategory = selectedCategory === 'all' || normalizedTxCat === selectedCategory;

      const matchesDate = !dateFilter || t.date === dateFilter;

      return matchesSearch && matchesType && matchesWallet && matchesSource && matchesCategory && matchesDate;
    });
  }, [transactions, searchQuery, typeFilter, selectedWallet, selectedSource, selectedCategory, dateFilter]);

  const stats = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense };
  }, [filteredTransactions]);

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    filteredTransactions.forEach(t => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  const resetFilters = () => {
    setTypeFilter('all');
    setSelectedWallet('all');
    setSelectedSource('all');
    setSelectedCategory('all');
    setDateFilter('');
  };

  return (
    <motion.div 
      className="max-w-5xl mx-auto space-y-6 pb-20"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* FILTER BAR SECTION */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
        
        {/* Header & Type Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-indigo-500" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Filter Transactions</h3>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${typeFilter === 'all' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500'}`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${typeFilter === 'income' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
            >
              Income
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${typeFilter === 'expense' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-slate-500'}`}
            >
              Expense
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid (Wallet, Source, Category, Date) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* Wallet Filter */}
          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Wallet</label>
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Wallets</option>
              {availableWallets.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          {/* Income Source / Person Filter */}
          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Source / Person</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Sources</option>
              {availableSources.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Specific Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

        </div>

        {/* Reset Filter Button if active */}
        {(typeFilter !== 'all' || selectedWallet !== 'all' || selectedSource !== 'all' || selectedCategory !== 'all' || dateFilter) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
            >
              <RefreshCw size={12} className="mr-1" /> Reset All Filters
            </button>
          </div>
        )}
      </motion.div>

      {/* FILTER SUMMARY CARDS */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-4">
          <p className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Total Income Filtered</p>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{formatCurrency(stats.income)}</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-4">
          <p className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">Total Expense Filtered</p>
          <p className="text-xl font-black text-rose-700 dark:text-rose-300">{formatCurrency(stats.expense)}</p>
        </div>
      </motion.div>

      {/* TRANSACTION HISTORY LIST */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{t.history}</h3>

        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <FileText size={40} className="mx-auto mb-2 opacity-50" />
            <p className="font-bold text-sm">No transactions match your current filters.</p>
            <button onClick={resetFilters} className="mt-3 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a)).map(dateStr => (
              <div key={dateStr} className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-400 text-xs font-extrabold uppercase tracking-wider px-1">
                  <Calendar size={14} />
                  <span>{dateStr}</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {groupedTransactions[dateStr].map(tx => (
                    <div key={tx.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl px-2 transition-colors">
                      <div className="flex items-center space-x-3.5 flex-1 min-w-0 pr-4">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shadow-sm shrink-0 ${getCategoryColor(tx.category)}`}>
                          {getCategoryIcon(tx.category)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{tx.note}</p>
                          
                          {/* Wallet -> Source -> Time Tag (Feature 1) */}
                          <div className="flex items-center space-x-1.5 mt-0.5 flex-wrap">
                            <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                              {tx.wallet} {tx.source ? `→ ${tx.source}` : ''}
                            </span>
                            <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-[11px] text-slate-400 font-semibold">{tx.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex items-center space-x-3 shrink-0">
                        <p className={`text-base font-black ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
