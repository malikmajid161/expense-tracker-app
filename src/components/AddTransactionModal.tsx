import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Plus, User } from 'lucide-react';
import { CATEGORIES } from '../data';
import type { Wallet, Transaction } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tx: any) => void;
  wallets?: Wallet[];
  currency?: string;
  transactions?: Transaction[];
  t: any;
}

export default function AddTransactionModal({ isOpen, onClose, onAdd, wallets = [], currency = 'Rs.', transactions = [], t }: AddTransactionModalProps) {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  
  const [category, setCategory] = useState('Groceries');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const [wallet, setWallet] = useState(wallets.length > 0 ? wallets[0].name : 'Cash');
  const [isCustomWallet, setIsCustomWallet] = useState(false);
  const [customWallet, setCustomWallet] = useState('');
  
  const [source, setSource] = useState<string>('');
  const [isAddingNewSource, setIsAddingNewSource] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');

  const [note, setNote] = useState('');

  // Find currently selected wallet object
  const selectedWalletObj = useMemo(() => {
    const currentWalletName = isCustomWallet ? customWallet : wallet;
    return wallets.find(w => w.name === currentWalletName);
  }, [wallets, wallet, isCustomWallet, customWallet]);

  // Available income sources for selected wallet
  const availableSources = useMemo(() => {
    if (!selectedWalletObj || !selectedWalletObj.sources) return [];
    return selectedWalletObj.sources;
  }, [selectedWalletObj]);

  // Update default source when wallet changes
  useEffect(() => {
    if (availableSources.length > 0) {
      setSource(availableSources[0].name);
    } else {
      setSource('');
    }
  }, [availableSources, wallet]);

  // Available categories for current type
  const availableCategories = useMemo(() => {
    const defaults = CATEGORIES.filter(c => c.type === type).map(c => c.name);
    const historyCats = transactions
      .filter(t => t.type === type)
      .map(t => t.category);

    return Array.from(new Set([...defaults, ...historyCats])).sort();
  }, [type, transactions]);

  // Available wallets
  const availableWallets = useMemo(() => {
    const propWallets = wallets.map(w => w.name);
    const historyWallets = transactions.map(t => t.wallet);
    return Array.from(new Set([...propWallets, ...historyWallets])).sort();
  }, [wallets, transactions]);

  // Reset local state when opened
  useEffect(() => {
    if (isOpen) {
      setType('expense');
      setAmount('');
      setCategory('Groceries');
      setIsCustomCategory(false);
      setCustomCategory('');
      
      const defaultW = wallets.length > 0 ? wallets[0].name : 'Cash';
      setWallet(defaultW);
      setIsCustomWallet(false);
      setCustomWallet('');

      const firstWObj = wallets.find(w => w.name === defaultW);
      if (firstWObj && firstWObj.sources && firstWObj.sources.length > 0) {
        setSource(firstWObj.sources[0].name);
      } else {
        setSource('');
      }

      setIsAddingNewSource(false);
      setNewSourceName('');
      setNote('');
    }
  }, [isOpen, wallets]);

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    setIsCustomCategory(false);
    if (newType === 'income') {
      setCategory('Salary');
    } else {
      setCategory('Groceries');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    
    let finalCategory = isCustomCategory ? customCategory : category;
    const finalWallet = isCustomWallet ? customWallet : wallet;
    const finalSource = isAddingNewSource && newSourceName.trim() ? newSourceName.trim() : source;

    if (!finalCategory || !finalWallet) {
      alert("Please provide a category and wallet");
      return;
    }

    finalCategory = finalCategory.trim();
    if (finalCategory) {
      finalCategory = finalCategory.charAt(0).toUpperCase() + finalCategory.slice(1);
    }
    
    const now = new Date();
    onAdd({
      id: Date.now().toString(),
      amount: Number(amount),
      type,
      category: finalCategory,
      wallet: finalWallet,
      source: finalSource || undefined,
      note: note || 'New Transaction',
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRecurring: false
    });
    
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80]"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 h-[88%] bg-white dark:bg-slate-900 rounded-t-[2.5rem] z-[90] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{t.add} {type === 'income' ? t.income : t.expense}</h3>
              <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
              <form id="add-tx-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Type Toggle */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                  <button type="button" onClick={() => handleTypeChange('expense')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${type === 'expense' ? 'bg-white dark:bg-slate-900 text-rose-500 shadow-sm' : 'text-slate-500'}`}>
                    {t.expense}
                  </button>
                  <button type="button" onClick={() => handleTypeChange('income')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${type === 'income' ? 'bg-white dark:bg-slate-900 text-emerald-500 shadow-sm' : 'text-slate-500'}`}>
                    {t.income}
                  </button>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.amount} ({currency})</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    required
                    className="w-full text-4xl font-extrabold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none border-b-2 border-slate-100 dark:border-slate-800 focus:border-indigo-500 pb-2 transition-colors bg-transparent"
                  />
                </div>

                {/* Category & Wallet */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Category */}
                  <div className="flex flex-col space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{t.category}</label>
                    <select 
                      value={isCustomCategory ? 'other' : category}
                      onChange={(e) => {
                        if (e.target.value === 'other') setIsCustomCategory(true);
                        else {
                          setIsCustomCategory(false);
                          setCategory(e.target.value);
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      {availableCategories.map(catName => (
                        <option key={catName} value={catName}>{catName}</option>
                      ))}
                      <option value="other">Other (Custom)</option>
                    </select>
                    {isCustomCategory && (
                      <input 
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Type category..."
                        required
                        className="w-full bg-indigo-50/50 dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-2 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    )}
                  </div>
                  
                  {/* Parent Wallet */}
                  <div className="flex flex-col space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{t.wallet}</label>
                    <select 
                      value={isCustomWallet ? 'other' : wallet}
                      onChange={(e) => {
                        if (e.target.value === 'other') {
                          setIsCustomWallet(true);
                          setSource('');
                        } else {
                          setIsCustomWallet(false);
                          setWallet(e.target.value);
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      {availableWallets.map(wName => (
                        <option key={wName} value={wName}>{wName}</option>
                      ))}
                      <option value="other">Other (Custom)</option>
                    </select>
                    {isCustomWallet && (
                      <input 
                        type="text"
                        value={customWallet}
                        onChange={(e) => setCustomWallet(e.target.value)}
                        placeholder="Type wallet..."
                        required
                        className="w-full bg-indigo-50/50 dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-2 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    )}
                  </div>
                </div>

                {/* Sub-Wallet / Income Source Selector (Feature 1) */}
                <div className="flex flex-col space-y-2 p-4 bg-indigo-50/40 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100/80 dark:border-indigo-800/50">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center">
                      <User size={14} className="mr-1.5" /> Income Source / Sub-Wallet
                    </label>
                    <span className="text-[10px] font-bold text-indigo-500">Tracked Separately</span>
                  </div>

                  {!isAddingNewSource ? (
                    <div className="flex items-center space-x-2">
                      <select 
                        value={source}
                        onChange={(e) => {
                          if (e.target.value === '__add_new__') {
                            setIsAddingNewSource(true);
                            setNewSourceName('');
                          } else {
                            setSource(e.target.value);
                          }
                        }}
                        className="flex-1 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {availableSources.length > 0 ? (
                          availableSources.map(s => (
                            <option key={s.id} value={s.name}>
                              {s.name} ({currency} {s.balance.toLocaleString()})
                            </option>
                          ))
                        ) : (
                          <option value="">General (Main Wallet Balance)</option>
                        )}
                        {availableSources.length > 0 && <option value="">General (Main Wallet)</option>}
                        <option value="__add_new__">+ Add New Source / Person</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewSource(true)}
                        className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shrink-0"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <input 
                        type="text"
                        autoFocus
                        value={newSourceName}
                        onChange={(e) => setNewSourceName(e.target.value)}
                        placeholder="e.g. Ahmed's Salary / Ali's Cash"
                        className="flex-1 bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setIsAddingNewSource(false)}
                        className="p-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {type === 'expense' 
                      ? 'Expense will deduct directly from this specific source balance.' 
                      : 'Income will credit directly into this specific source balance.'}
                  </p>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.note}</label>
                  <input 
                    type="text" 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What was this for?"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800">
              <button 
                type="submit" 
                form="add-tx-form"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-all active:scale-95"
              >
                <Check size={20} className="mr-2" /> {t.save}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
