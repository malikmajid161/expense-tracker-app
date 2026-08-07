import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter, Trash2, FileText, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import type { Transaction } from '../types';
import { CATEGORIES } from '../data';

interface TransactionsProps {
  transactions: Transaction[];
  handleDelete: (id: string) => void;
  searchQuery?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }
};

export default function Transactions({ transactions, handleDelete, searchQuery = '' }: TransactionsProps) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.note.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.wallet.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchQuery, typeFilter, selectedCategory]);

  return (
    <motion.div 
      className="max-w-5xl mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Filters */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100/60 dark:border-slate-800 space-y-4">
        
        {/* Filter Chips & Dropdown */}
        <div className="flex flex-col gap-3">
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {['all', 'income', 'expense'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all snap-center shrink-0 ${
                  typeFilter === t 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer w-full"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Transaction List */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100/60 dark:border-slate-800 min-h-[400px]">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Transaction History</h3>
        
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-500" />
            </div>
            <p className="text-lg font-bold text-slate-600 dark:text-slate-300">No transactions found</p>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-slate-100/80 dark:divide-slate-800">
            {filteredTransactions.map(tx => (
              <motion.div variants={itemVariants} key={tx.id} className="group flex items-center justify-between py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all rounded-xl px-2 -mx-2">
                <div className="flex items-center space-x-3 flex-1 min-w-0 pr-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-sm shrink-0 ${getCategoryColor(tx.category)}`}>
                    {getCategoryIcon(tx.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{tx.note}</p>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">{tx.wallet}</span>
                      <span className="text-[10px] text-slate-300 dark:text-slate-600 shrink-0">•</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium shrink-0">{tx.date}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center space-x-2 shrink-0">
                  <div>
                    <p className={`text-sm font-extrabold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{tx.category}</span>
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
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
