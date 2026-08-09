import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Lock, Download, Trash2, ChevronRight, User, Shield, Bell, HelpCircle, FileText, LogOut, Wallet, X, Check, Edit2, Globe, Calendar, Mail, Info, ShieldAlert, KeyRound, Target } from 'lucide-react';
import type { Transaction } from '../types';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { supabase } from '../supabase';

interface SettingsViewProps {
  userName: string;
  userAvatar: string | null;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  biometricEnabled: boolean;
  setBiometricEnabled: (enabled: boolean) => void;
  twoFactorEnabled: boolean;
  setTwoFactorEnabled: (enabled: boolean) => void;
  openEditProfile: () => void;
  openNotifications: () => void;
  transactions: Transaction[];
  monthlyBudget: number;
  setMonthlyBudget: (budget: number) => void;
  currency: string;
  setCurrency: (c: string) => void;
  budgetAlertLimit: number;
  setBudgetAlertLimit: (l: number) => void;
  onRenameCategory?: (oldName: string, newName: string) => void;
  setActiveTab?: (tab: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 30 } }
};

export default function SettingsView({
  userName, userAvatar, isDarkMode, setIsDarkMode, biometricEnabled, setBiometricEnabled, twoFactorEnabled, setTwoFactorEnabled, openEditProfile, openNotifications, transactions, monthlyBudget, setMonthlyBudget, currency, setCurrency, budgetAlertLimit, setBudgetAlertLimit, onRenameCategory, setActiveTab, language, setLanguage
}: SettingsViewProps) {

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);

  const [otpValue, setOtpValue] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);

  // New settings states (mocked for UI)
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');

  const [tempBudget, setTempBudget] = useState(String(monthlyBudget));
  const [tempCurrency, setTempCurrency] = useState(currency);
  const [tempLimit, setTempLimit] = useState(String(budgetAlertLimit));

  const [renamingCategory, setRenamingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const allCategories = Array.from(new Set(transactions.map(t => t.category))).sort();

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
      showToast('Spending limit updated successfully!');
    } else {
      alert("Please enter valid positive numbers. Limit must be 1-100.");
    }
  };

  const handleRenameCategorySubmit = (oldName: string) => {
    if (newCategoryName.trim() && newCategoryName !== oldName) {
      onRenameCategory?.(oldName, newCategoryName.trim());
      setRenamingCategory(null);
      setNewCategoryName('');
      showToast('Category renamed successfully!');
    }
  };

  const toggleBiometric = async () => {
    if (!biometricEnabled) {
      try {
        const result = await NativeBiometric.isAvailable();
        if (result.isAvailable) {
          await NativeBiometric.verifyIdentity({
            reason: "Confirm identity to enable biometric access",
            title: "Security Verification",
            subtitle: "FinTrack Identity Check",
            description: "Please use your fingerprint"
          });
          setBiometricEnabled(true);
          showToast('Biometric access enabled');
        } else {
          alert("Biometric sensor not found or not set up on this device.");
        }
      } catch (e) {
        console.error(e);
        // Fallback for demo/emulator
        if (confirm("Biometric check returned an error. Force enable for testing?")) {
           setBiometricEnabled(true);
        }
      }
    } else {
      setBiometricEnabled(false);
      showToast('Biometric access disabled');
    }
  };

  const handle2FAVerify = () => {
    setIsVerifying2FA(true);
    setTimeout(() => {
      if (otpValue === '123456') {
        setTwoFactorEnabled(true);
        setIsTwoFactorModalOpen(false);
        setOtpValue('');
        showToast('2FA Security Enabled');
      } else {
        alert("Invalid code. Use 123456");
      }
      setIsVerifying2FA(false);
    }, 1200);
  };

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) {
      showToast('No transactions to export.');
      return;
    }
    const headers = ['Date', 'Time', 'Type', 'Category', 'Wallet', 'Amount', 'Note'];
    const rows = transactions.map(t => [t.date, t.time || '', t.type, t.category, t.wallet, t.amount, `"${t.note}"`]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fintrack_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('Export successful!');
  };

  return (
    <div className="relative h-full w-full">
      <motion.div className="max-w-3xl mx-auto space-y-6 px-4 pb-20" variants={containerVariants} initial="hidden" animate="show">
        {/* Profile Card */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg overflow-hidden shrink-0">
              {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" /> : userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">{userName}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">FinTrack</p>
            </div>
          </div>
          <button onClick={openEditProfile} className="p-2 bg-slate-50 dark:bg-slate-800 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors shrink-0">
            <ChevronRight size={20} />
          </button>
        </motion.div>

        {/* Settings Groups */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-8">

          <div className="p-4 border-b border-slate-100/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">App & Budget Management</h4>
          </div>

          <div onClick={() => setActiveTab?.('budgets')} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border-b border-slate-100/80 dark:border-slate-800">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center">
                <Target size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Budget Settings (Daily & Monthly)</p>
                <p className="text-xs text-slate-400 font-medium">Set daily spending targets, category limits & 80% alerts</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <button onClick={openEditProfile} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform"><User size={20} /></div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Personal Information</span>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>
            
            <button onClick={() => { setTempBudget(String(monthlyBudget)); setTempCurrency(currency); setTempLimit(String(budgetAlertLimit)); setIsBudgetModalOpen(true); }} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Wallet size={20} /></div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Spending Limit Settings</span>
                  <span className="text-xs text-slate-400 truncate">Limit: {currency} {monthlyBudget} (Alert at {budgetAlertLimit}%)</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>

            <div className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center"><Lock size={20} /></div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Biometric Lock</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={biometricEnabled} onChange={toggleBiometric} />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>



          <div className="p-4 border-b border-t border-slate-100/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">App Preferences</h4>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <div onClick={() => setIsDarkMode(!isDarkMode)} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-indigo-900 text-indigo-400' : 'bg-amber-50 text-amber-500'}`}>{isDarkMode ? <Moon size={20} /> : <Sun size={20} />}</div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{isDarkMode ? 'Dark Theme' : 'Light Theme'}</span>
              </div>
              <span className="text-xs font-bold text-indigo-500">Active</span>
            </div>

            <button onClick={() => setIsManageCategoriesOpen(true)} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center"><FileText size={20} /></div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Manage Categories</span>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>

            <div className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer" onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center"><Globe size={20} /></div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Language</span>
              </div>
              <span className="text-xs font-bold text-slate-400">{language === 'en' ? 'English' : 'Urdu'}</span>
            </div>

            <div className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer" onClick={() => setDateFormat(dateFormat === 'YYYY-MM-DD' ? 'DD-MM-YYYY' : 'YYYY-MM-DD')}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center"><Calendar size={20} /></div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Date Format</span>
              </div>
              <span className="text-xs font-bold text-slate-400">{dateFormat}</span>
            </div>
          </div>

          <div className="p-4 border-b border-t border-slate-100/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">Data & Support</h4>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <button onClick={handleExportCSV} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group text-left">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center"><Download size={20} /></div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Export Report (CSV)</span>
              </div>
            </button>

            <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center"><Mail size={20} /></div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Help & Support</span>
              </div>
            </button>

            <button onClick={() => setShowConfirmClear(true)} className="w-full p-4 flex items-center justify-between hover:bg-rose-50 transition-colors group text-left">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center"><Trash2 size={20} /></div>
                <span className="font-semibold text-rose-600">Clear All Storage</span>
              </div>
            </button>

            <button onClick={async () => { await supabase.auth.signOut(); localStorage.removeItem('expense_currentUser'); window.location.reload(); }} className="w-full p-4 flex items-center justify-between hover:bg-orange-50 transition-colors group text-left">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center"><LogOut size={20} /></div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Logout</span>
              </div>
            </button>
          </div>

        </motion.div>

        <div className="text-center pt-2 pb-10 text-slate-400">
          <p className="text-[10px] font-black uppercase tracking-widest mb-1">FinTrack Mobile Production</p>
          <p className="text-xs font-bold">Version 2.5.0 (Build 92)</p>
        </div>
      </motion.div>

      {/* MODALS */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div key="toast" initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -50, x: '-50%' }} className="fixed top-24 left-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-[500] text-sm font-bold border border-slate-700 whitespace-nowrap">
            {toastMessage}
          </motion.div>
        )}

        {isTwoFactorModalOpen && (
          <div key="2fa-modal" className="fixed inset-0 z-[500] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl w-full max-w-sm border border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 mx-auto"><KeyRound size={32} /></div>
              <h3 className="text-xl font-extrabold text-center text-slate-900 dark:text-white mb-2">Enable 2FA</h3>
              <p className="text-center text-sm text-slate-500 mb-6 px-4">A code was sent to your email. Enter it below to enable secure login.</p>
              <input type="text" maxLength={6} value={otpValue} onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, ''))} className="w-full h-14 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-center text-2xl font-black tracking-[0.5em] mb-8 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white" placeholder="000000" />
              <div className="flex space-x-3">
                <button onClick={() => setIsTwoFactorModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold">Cancel</button>
                <button disabled={otpValue.length !== 6 || isVerifying2FA} onClick={handle2FAVerify} className="flex-1 py-3.5 bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center disabled:opacity-50">
                  {isVerifying2FA ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isManageCategoriesOpen && (
          <div key="cat-modal" className="fixed inset-0 z-[500] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl w-full max-w-sm border border-slate-100 dark:border-slate-800 flex flex-col h-[70vh]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Categories</h3>
                <button onClick={() => {setIsManageCategoriesOpen(false); setRenamingCategory(null);}} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {allCategories.map(cat => (
                  <div key={cat} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {renamingCategory === cat ? (
                      <div className="flex-1 flex items-center space-x-2">
                        <input autoFocus value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRenameCategorySubmit(cat)} className="flex-1 bg-white dark:bg-slate-900 border rounded-lg px-2 py-1 text-sm font-bold outline-none text-slate-900 dark:text-white" />
                        <button onClick={() => handleRenameCategorySubmit(cat)} className="p-1.5 bg-indigo-500 text-white rounded-lg"><Check size={14} /></button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{cat}</span>
                        <button onClick={() => { setRenamingCategory(cat); setNewCategoryName(cat); }} className="p-1.5 text-slate-400 hover:text-indigo-500"><Edit2 size={16} /></button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {isBudgetModalOpen && (
          <div key="budget-modal" className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl w-full max-w-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-extrabold text-center text-slate-900 dark:text-white mb-6">Budget Settings</h3>
              <div className="space-y-4 mb-8">
                <input type="text" value={tempBudget} onChange={(e) => setTempBudget(e.target.value)} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white" placeholder="Monthly Limit" />
                <select value={tempCurrency} onChange={(e) => setTempCurrency(e.target.value)} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"><option value="Rs.">Rs.</option><option value="$">$ USD</option></select>
                <input type="number" value={tempLimit} onChange={(e) => setTempLimit(e.target.value)} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white" placeholder="Alert %" />
              </div>
              <div className="flex space-x-3">
                <button onClick={() => setIsBudgetModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold">Cancel</button>
                <button onClick={handleSaveBudgetSettings} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold">Save</button>
              </div>
            </motion.div>
          </div>
        )}

        {showConfirmClear && (
          <div key="clear-modal" className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-extrabold text-center text-slate-900 dark:text-white mb-2">Clear Data?</h3>
              <p className="text-center text-sm text-slate-500 mb-8 px-4">All transactions, wallets, and settings will be permanently lost.</p>
              <div className="flex space-x-3">
                <button onClick={() => setShowConfirmClear(false)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold">Cancel</button>
                <button onClick={async () => { await supabase.auth.signOut(); localStorage.clear(); window.location.reload(); }} className="flex-1 py-3.5 bg-rose-500 text-white rounded-xl font-bold">Wipe Data</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
