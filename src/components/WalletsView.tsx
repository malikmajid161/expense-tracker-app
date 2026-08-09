import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CreditCard, ChevronRight, Activity, Smartphone, Landmark, Trash2, X, ArrowUpRight, ArrowDownLeft, Edit2, User, Layers } from 'lucide-react';
import type { Wallet, Transaction } from '../types';

interface WalletsViewProps {
  wallets: Wallet[];
  transactions: Transaction[];
  openAddWallet?: () => void;
  searchQuery?: string;
  onDeleteWallet?: (id: string) => void;
  onRenameWallet?: (id: string, newName: string) => void;
  onAddSubSource?: (walletId: string, name: string, initialBalance: number) => void;
  onDeleteSubSource?: (walletId: string, sourceId: string) => void;
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

export default function WalletsView({
  wallets,
  transactions,
  openAddWallet,
  searchQuery = '',
  onDeleteWallet,
  onRenameWallet,
  onAddSubSource,
  onDeleteSubSource,
  t
}: WalletsViewProps) {
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const [addingSourceToWalletId, setAddingSourceToWalletId] = useState<string | null>(null);
  const [newSubSourceName, setNewSubSourceName] = useState('');
  const [newSubSourceBalance, setNewSubSourceBalance] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val).replace('PKR', 'Rs.');
  };

  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

  const getWalletTransactions = (walletName: string, limit?: number) => {
    const filtered = transactions.filter(t => t.wallet === walletName);
    return limit ? filtered.slice(0, limit) : filtered;
  };

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'bank': return <Landmark size={20} />;
      case 'mobile': return <Smartphone size={20} />;
      default: return <CreditCard size={20} />;
    }
  };

  const handleRenameSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (newName.trim()) {
      onRenameWallet?.(id, newName.trim());
      setIsRenaming(null);
      setNewName('');
    }
  };

  const handleAddSourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addingSourceToWalletId && newSubSourceName.trim()) {
      const bal = parseInt(newSubSourceBalance.replace(/[^0-9]/g, ''), 10) || 0;
      onAddSubSource?.(addingSourceToWalletId, newSubSourceName.trim(), bal);
      setAddingSourceToWalletId(null);
      setNewSubSourceName('');
      setNewSubSourceBalance('');
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
          <button onClick={() => openAddWallet?.()} className="flex-1 bg-indigo-500 hover:bg-indigo-600 transition-colors py-2.5 rounded-xl text-sm font-bold flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Plus size={18} className="mr-1.5" /> Add Wallet
          </button>
        </div>
      </motion.div>

      <div className="flex justify-between items-center px-1">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t.wallets}</h3>
        <span className="text-xs font-semibold text-slate-400">{wallets.length} Accounts</span>
      </div>

      {/* Wallet List */}
      <div className="space-y-4">
        {filteredWallets.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p className="font-medium">No {t.wallets.toLowerCase()} found matching your search.</p>
          </div>
        ) : (
          filteredWallets.map(wallet => {
            const recentTxs = getWalletTransactions(wallet.name, 3);
            const sources = wallet.sources || [];

            return (
              <motion.div variants={itemVariants} key={wallet.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group">
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => setSelectedWallet(wallet)}
                >
                  <div className="flex items-center space-x-4 flex-1 pr-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${wallet.color} shadow-sm shrink-0`}>
                      {getWalletIcon(wallet.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {isRenaming === wallet.id ? (
                        <form onSubmit={(e) => handleRenameSubmit(e, wallet.id)} className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            autoFocus
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onBlur={() => setIsRenaming(null)}
                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-base font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </form>
                      ) : (
                        <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">{wallet.name}</h4>
                      )}
                      <div className="flex items-center space-x-2 mt-0.5">
                        <p className="text-sm font-extrabold text-slate-900 dark:text-white">{formatCurrency(wallet.balance)}</p>
                        <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                        <p className="text-[11px] font-semibold text-slate-400 capitalize">{wallet.type}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRenaming(wallet.id);
                        setNewName(wallet.name);
                      }}
                      className="p-1.5 rounded-full text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
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

                {/* Sub-Wallets / Income Sources Section (Feature 1) */}
                <div className="bg-indigo-50/40 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 px-5 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center">
                      <User size={12} className="mr-1" /> Income Sources ({sources.length})
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddingSourceToWalletId(wallet.id);
                        setNewSubSourceName('');
                        setNewSubSourceBalance('');
                      }}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
                    >
                      <Plus size={12} className="mr-0.5" /> Add Source
                    </button>
                  </div>

                  {sources.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {sources.map(s => (
                        <div key={s.id} className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-700 px-3 py-1.5 rounded-xl flex items-center space-x-2 text-xs shadow-2xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{s.name}</span>
                          <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{formatCurrency(s.balance)}</span>
                          {onDeleteSubSource && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Remove source ${s.name}?`)) {
                                  onDeleteSubSource(wallet.id, s.id);
                                }
                              }}
                              className="text-slate-300 hover:text-rose-500 ml-1"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 font-medium italic">No sub-sources added. Transactions will use main wallet balance.</p>
                  )}
                </div>

                {/* Mini recent history */}
                {recentTxs.length > 0 && (
                  <div className="bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 px-5 py-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                      <Activity size={12} className="mr-1" /> Recent Activity
                    </p>
                    <div className="space-y-2">
                      {recentTxs.map(tx => (
                        <div key={tx.id} className="flex justify-between items-center text-xs">
                          <div className="flex items-center space-x-1.5 truncate pr-2">
                            <span className="font-semibold text-slate-600 dark:text-slate-300 truncate">{tx.note}</span>
                            {tx.source && (
                              <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded">
                                {tx.source}
                              </span>
                            )}
                          </div>
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

      {/* ADD INCOME SOURCE MODAL */}
      <AnimatePresence>
        {addingSourceToWalletId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl w-full max-w-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Add Income Source</h3>
                <button onClick={() => setAddingSourceToWalletId(null)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddSourceSubmit} className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Source / Person Name</label>
                  <input
                    type="text"
                    required
                    value={newSubSourceName}
                    onChange={(e) => setNewSubSourceName(e.target.value)}
                    placeholder="e.g. Ahmed's Salary / Ali's Cash"
                    className="mt-1.5 w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Initial Balance (PKR)</label>
                  <input
                    type="number"
                    value={newSubSourceBalance}
                    onChange={(e) => setNewSubSourceBalance(e.target.value)}
                    placeholder="e.g. 25000"
                    className="mt-1.5 w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center">
                  <Plus size={18} className="mr-1" /> Create Source
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wallet Details Modal */}
      <AnimatePresence>
        {selectedWallet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWallet(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 h-[82%] bg-white dark:bg-slate-900 rounded-t-[2.5rem] z-[110] flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${selectedWallet.color}`}>
                    {getWalletIcon(selectedWallet.type)}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{selectedWallet.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedWallet.type} Account</p>
                  </div>
                </div>
                <button onClick={() => setSelectedWallet(null)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
                <div className="mb-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Balance</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(selectedWallet.balance)}</p>
                </div>

                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 px-1">Transaction History</h4>

                <div className="space-y-4">
                  {getWalletTransactions(selectedWallet.name).length === 0 ? (
                    <div className="py-10 text-center">
                      <Activity size={40} className="mx-auto text-slate-200 dark:text-slate-700 mb-3" />
                      <p className="text-sm font-bold text-slate-400">No transactions recorded yet.</p>
                    </div>
                  ) : (
                    getWalletTransactions(selectedWallet.name).map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-50 dark:border-slate-700/50 shadow-sm">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {tx.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.note}</p>
                            <p className="text-[10px] font-bold text-slate-400">
                              {tx.date} • {tx.time || '00:00'} {tx.source ? `• ${tx.source}` : ''}
                            </p>
                          </div>
                        </div>
                        <p className={`text-sm font-black ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
