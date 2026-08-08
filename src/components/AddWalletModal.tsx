import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import type { Wallet } from '../types';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (wallet: Wallet) => void;
}

export default function AddWalletModal({ isOpen, onClose, onAdd }: AddWalletModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'bank' | 'mobile' | 'cash'>('bank');
  const [balance, setBalance] = useState('');

  const handleTypeChange = (newType: 'bank' | 'mobile' | 'cash') => {
    setType(newType);
    if (newType === 'cash' && !name) {
      setName('Cash');
    } else if (name === 'Cash' && newType !== 'cash') {
      setName('');
    }
  };

  const getPlaceholder = () => {
    if (type === 'bank') return "e.g. Standard Chartered";
    if (type === 'mobile') return "e.g. JazzCash or EasyPaisa";
    return "e.g. Petty Cash";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    // Auto assign colors based on type
    let color = 'from-indigo-500 to-purple-600';
    let icon = '🏦';
    if (type === 'cash') {
      color = 'from-emerald-400 to-teal-500';
      icon = '💵';
    } else if (type === 'mobile') {
      color = 'from-rose-500 to-pink-600';
      icon = '📱';
    }

    onAdd({
      id: Date.now().toString(),
      name,
      type,
      balance: Number(balance) || 0,
      color,
      icon
    });
    
    setName('');
    setBalance('');
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
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-[2.5rem] z-[90] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Add New Wallet</h3>
              <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <form id="add-wallet-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Wallet Type */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                  <button type="button" onClick={() => handleTypeChange('bank')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${type === 'bank' ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                    Bank
                  </button>
                  <button type="button" onClick={() => handleTypeChange('mobile')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${type === 'mobile' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                    Mobile
                  </button>
                  <button type="button" onClick={() => handleTypeChange('cash')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${type === 'cash' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                    Cash
                  </button>
                </div>

                {/* Wallet Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Wallet Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={getPlaceholder()}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                {/* Initial Balance */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Initial Balance (Rs)</label>
                  <input 
                    type="number" 
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="0"
                    required
                    className="w-full text-4xl font-extrabold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none border-b-2 border-slate-100 dark:border-slate-800 focus:border-indigo-500 pb-2 transition-colors bg-transparent"
                  />
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800">
              <button 
                type="submit" 
                form="add-wallet-form"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-all active:scale-95"
              >
                <Check size={20} className="mr-2" /> Create Wallet
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
