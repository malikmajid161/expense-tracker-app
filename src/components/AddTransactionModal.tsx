import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { CATEGORIES } from '../data';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tx: any) => void;
}

export default function AddTransactionModal({ isOpen, onClose, onAdd }: AddTransactionModalProps) {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[3].name); // Default Groceries
  const [note, setNote] = useState('');
  const [wallet, setWallet] = useState('Meezan Bank');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    
    onAdd({
      id: Date.now().toString(),
      amount: Number(amount),
      type,
      category,
      wallet,
      note: note || 'New Transaction',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false
    });
    
    // Reset form
    setAmount('');
    setNote('');
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
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] rounded-b-[3rem] md:rounded-[2.5rem]"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 h-[85%] bg-white rounded-t-[2.5rem] z-[90] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-extrabold text-slate-900">New Transaction</h3>
              <button onClick={onClose} className="p-2 bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
              <form id="add-tx-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Type Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                  <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${type === 'expense' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-500'}`}>
                    Expense
                  </button>
                  <button type="button" onClick={() => setType('income')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${type === 'income' ? 'bg-white text-emerald-500 shadow-sm' : 'text-slate-500'}`}>
                    Income
                  </button>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount (Rs)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    required
                    className="w-full text-4xl font-extrabold text-slate-900 placeholder:text-slate-300 focus:outline-none border-b-2 border-slate-100 focus:border-indigo-500 pb-2 transition-colors bg-transparent"
                  />
                </div>

                {/* Category & Wallet */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      {CATEGORIES.filter(c => c.type === type).map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Wallet</label>
                    <select 
                      value={wallet}
                      onChange={(e) => setWallet(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Meezan Bank">Meezan Bank</option>
                      <option value="JazzCash">JazzCash</option>
                      <option value="Easypaisa">Easypaisa</option>
                    </select>
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Note / Description</label>
                  <input 
                    type="text" 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What was this for?"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-400"
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100">
              <button 
                type="submit" 
                form="add-tx-form"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-all active:scale-95"
              >
                <Check size={20} className="mr-2" /> Save Transaction
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
