import React from 'react';
import { motion } from 'framer-motion';
import { Plus, CreditCard, ChevronRight, Activity, Smartphone, Landmark, Trash2 } from 'lucide-react';
import type { Wallet, Transaction } from '../types';

interface WalletsViewProps {
  wallets: Wallet[];
  transactions: Transaction[];
  openAddWallet?: () => void;
  searchQuery?: string;
  setActiveTab?: (tab: string) => void;
  setSearchQuery?: (query: string) => void;
  onDeleteWallet?: (id: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }
};

export default function WalletsView({ wallets, transactions, openAddWallet, searchQuery = '', setActiveTab, setSearchQuery, onDeleteWallet }: WalletsViewProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val).replace('PKR', 'Rs.');
  };

  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

  const getWalletTransactions = (walletName: string) => {
    return transactions.filter(t => t.wallet === walletName).slice(0, 3);
  };

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'bank': return <Landmark size={20} />;
      case 'mobile': return <Smartphone size={20} />;
      default: return <CreditCard size={20} />;
    }
  };

  const filteredWallets = wallets.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      className="max-w-md mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Total Balance Card */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <p className="text-slate-400 text-sm font-medium mb-1">Total Available Balance</p>
        <h2 className="text-3xl font-extrabold tracking-tight">{formatCurrency(totalBalance)}</h2>
        <div className="mt-6 flex gap-3">
          <button className="flex-1 bg-white/10 hover:bg-white/20 transition-colors py-2.5 rounded-xl text-sm font-bold flex items-center justify-center">
            <Plus size={18} className="mr-1.5" /> Transfer
          </button>
          <button onClick={() => openAddWallet?.()} className="flex-1 bg-indigo-500 hover:bg-indigo-600 transition-colors py-2.5 rounded-xl text-sm font-bold flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Plus size={18} className="mr-1.5" /> Add Wallet
          </button>
        </div>
      </motion.div>

      <h3 className="text-lg font-bold text-slate-800 dark:text-white pt-2 px-1">Active Wallets</h3>

      {/* Wallet List */}
      <div className="space-y-4">
        {filteredWallets.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p className="font-medium">No wallets found matching your search.</p>
          </div>
        ) : (
          filteredWallets.map(wallet => {
            const recentTxs = getWalletTransactions(wallet.name);
            return (
              <motion.div variants={itemVariants} key={wallet.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group">
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => {
                    if (setActiveTab && setSearchQuery) {
                      setSearchQuery(wallet.name);
                      setActiveTab('transactions');
                    }
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${wallet.color} shadow-sm`}>
                      {getWalletIcon(wallet.type)}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{wallet.name}</h4>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <p className="text-sm font-extrabold text-slate-900 dark:text-white">{formatCurrency(wallet.balance)}</p>
                        <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                        <p className="text-[11px] font-semibold text-slate-400 capitalize">{wallet.type} Account</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent opening transactions
                        if (window.confirm(`Are you sure you want to delete ${wallet.name}? This will also delete all its transactions.`)) {
                          onDeleteWallet?.(wallet.id);
                        }
                      }}
                      className="p-1.5 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </div>
                
                {/* Mini recent history for the wallet */}
                {recentTxs.length > 0 && (
                  <div className="bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 px-5 py-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                      <Activity size={12} className="mr-1" /> Recent Activity
                    </p>
                    <div className="space-y-2">
                      {recentTxs.map(tx => (
                        <div key={tx.id} className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-600 dark:text-slate-300 truncate pr-4">{tx.note}</span>
                          <span className={`font-bold shrink-0 ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-400'}`}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
