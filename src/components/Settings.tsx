import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Lock, Download, Trash2, ChevronRight, User, Shield, Bell, HelpCircle, FileText, LogOut, Wallet } from 'lucide-react';
import type { Transaction } from '../types';

interface SettingsProps {
  userName: string;
  userAvatar: string | null;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  biometricEnabled: boolean;
  setBiometricEnabled: (enabled: boolean) => void;
  openEditProfile: () => void;
  openNotifications: () => void;
  transactions: Transaction[];
  monthlyBudget: number;
  setMonthlyBudget: (budget: number) => void;
  currency: string;
  setCurrency: (c: string) => void;
  budgetAlertLimit: number;
  setBudgetAlertLimit: (l: number) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }
};

export default function Settings({ 
  userName, userAvatar, isDarkMode, setIsDarkMode, biometricEnabled, setBiometricEnabled, openEditProfile, openNotifications, transactions, monthlyBudget, setMonthlyBudget, currency, setCurrency, budgetAlertLimit, setBudgetAlertLimit 
}: SettingsProps) {

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  
  const [tempBudget, setTempBudget] = useState(String(monthlyBudget));
  const [tempCurrency, setTempCurrency] = useState(currency);
  const [tempLimit, setTempLimit] = useState(String(budgetAlertLimit));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveBudgetSettings = () => {
    const b = parseInt(tempBudget.replace(/[^0-9]/g, ''), 10);
    const l = parseInt(tempLimit.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(b) && b > 0 && !isNaN(l) && l > 0 && l <= 100) {
      setMonthlyBudget(b);
      setCurrency(tempCurrency);
      setBudgetAlertLimit(l);
      setIsBudgetModalOpen(false);
      showToast('Budget settings updated successfully!');
    } else {
      alert("Please enter valid positive numbers. Limit must be 1-100.");
    }
  };

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) {
      showToast('No transactions to export.');
      return;
    }
    
    const headers = ['Date', 'Type', 'Category', 'Wallet', 'Amount', 'Note'];
    const rows = transactions.map(t => [
      t.date, 
      t.type, 
      t.category, 
      t.wallet, 
      t.amount, 
      `"${t.note.replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fintrack_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Export successful!');
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <>
      <motion.div 
        className="max-w-3xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Profile Header Card */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-indigo-200 overflow-hidden">
              {userAvatar ? (
                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{userName}</h3>
              <p className="text-xs font-medium text-slate-400">Free Plan</p>
            </div>
          </div>
          <button onClick={openEditProfile} className="p-2 bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors">
            <ChevronRight size={20} />
          </button>
        </motion.div>

        {/* Settings Sections */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          
          {/* Section 1: Account */}
          <div className="p-4 border-b border-slate-100/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">Account & Security</h4>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <button onClick={openEditProfile} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User size={20} />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Personal Information</span>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </button>
            
            <button onClick={() => {
              setTempBudget(String(monthlyBudget));
              setTempCurrency(currency);
              setTempLimit(String(budgetAlertLimit));
              setIsBudgetModalOpen(true);
            }} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wallet size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Monthly Budget</span>
                  <span className="text-xs text-slate-400">{currency} {monthlyBudget} (Alert at {budgetAlertLimit}%)</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </button>

            <div className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center">
                  <Lock size={20} />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Biometric Lock</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={biometricEnabled}
                  onChange={() => setBiometricEnabled(!biometricEnabled)} 
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>
          </div>

          {/* Section 2: Preferences */}
          <div className="p-4 border-b border-t border-slate-100/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">App Preferences</h4>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <div className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left cursor-pointer" onClick={() => setIsDarkMode(!isDarkMode)}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-amber-50 text-amber-500'}`}>
                  {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{isDarkMode ? 'Dark Theme' : 'Light Theme'}</span>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-lg border transition-colors ${isDarkMode ? 'text-indigo-400 bg-indigo-900/30 border-indigo-500/30' : 'text-indigo-500 bg-indigo-50 border-indigo-100'}`}>
                Active
              </span>
            </div>

            <button onClick={openNotifications} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bell size={20} />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Notifications</span>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </button>
          </div>

          {/* Section 3: Data */}
          <div className="p-4 border-b border-t border-slate-100/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">Data & Storage</h4>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <button onClick={handleExportCSV} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText size={20} />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Export as CSV</span>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </button>
            
            <button onClick={handleExportPDF} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Download size={20} />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Export as PDF</span>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </button>
            
            <button 
              onClick={() => {
                localStorage.removeItem('expense_currentUser');
                window.location.reload();
              }}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LogOut size={20} />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Log Out</span>
              </div>
            </button>
            
            <button 
              onClick={() => setShowConfirmClear(true)} 
              className="w-full p-4 flex items-center justify-between hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trash2 size={20} />
                </div>
                <span className="font-semibold text-rose-600 dark:text-rose-400">Clear Local Storage</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* App Version Info */}
        <motion.div variants={itemVariants} className="text-center pt-4 pb-8 text-slate-400">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-1">FinTrack Mobile</p>
          <p className="text-sm font-medium">Version 2.0.1 (Build 84)</p>
        </motion.div>
      </motion.div>

      {/* Global Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-24 left-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-2xl z-[100] text-sm font-bold whitespace-nowrap border border-slate-700 dark:border-slate-200"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Data Modal */}
      <AnimatePresence>
        {showConfirmClear && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-500 mb-4 mx-auto">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-extrabold text-center text-slate-900 dark:text-white mb-2">Clear All Data?</h3>
              <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">
                This will permanently delete all your transactions, wallets, and settings. This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowConfirmClear(false)}
                  className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="flex-1 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/25 transition-all"
                >
                  Yes, Clear
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Budget Settings Modal */}
      <AnimatePresence>
        {isBudgetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl w-full max-w-sm border border-slate-100 dark:border-slate-800"
            >
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-sm">
                <Wallet size={32} />
              </div>
              <h3 className="text-xl font-extrabold text-center text-slate-900 dark:text-white mb-6">Budget Settings</h3>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">Total Monthly Budget</label>
                  <div className="mt-1.5 relative flex items-center">
                    <select 
                      value={tempCurrency}
                      onChange={(e) => setTempCurrency(e.target.value)}
                      className="absolute left-1 h-10 pl-3 pr-8 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 rounded-l-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none appearance-none"
                    >
                      <option value="Rs.">Rs.</option>
                      <option value="PKR">PKR</option>
                      <option value="$">$ USD</option>
                      <option value="€">€ EUR</option>
                      <option value="£">£ GBP</option>
                    </select>
                    <input 
                      type="number"
                      value={tempBudget}
                      onChange={(e) => setTempBudget(e.target.value)}
                      className="w-full h-12 pl-24 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="e.g. 50000"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">Alert Notification Threshold (%)</label>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 ml-1 mb-2">We will notify you when your expenses reach this percentage of your budget.</p>
                  <div className="mt-1.5 relative flex items-center">
                    <input 
                      type="number"
                      min="1"
                      max="100"
                      value={tempLimit}
                      onChange={(e) => setTempLimit(e.target.value)}
                      className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="e.g. 80"
                    />
                    <span className="absolute right-4 text-slate-400 font-bold">%</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveBudgetSettings}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 dark:shadow-none"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
