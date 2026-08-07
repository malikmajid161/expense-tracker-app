import type { Transaction, Wallet, Budget, Category } from './types';

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_WALLETS: Wallet[] = [
  { id: 'w1', name: 'Cash', balance: 0, type: 'cash', icon: '💵', color: 'from-amber-400 to-orange-500' },
  { id: 'w2', name: 'Meezan Bank', balance: 0, type: 'bank', icon: '🏦', color: 'from-blue-600 to-indigo-700' },
  { id: 'w3', name: 'JazzCash', balance: 0, type: 'mobile', icon: '📱', color: 'from-rose-500 to-pink-600' },
  { id: 'w4', name: 'Easypaisa', balance: 0, type: 'mobile', icon: '📲', color: 'from-emerald-400 to-teal-500' }
];

export const INITIAL_BUDGETS: Budget[] = [
  { id: 'b1', category: 'Groceries', limit: 40000, spent: 0, icon: '🛒' },
  { id: 'b2', category: 'Dining Out', limit: 15000, spent: 0, icon: '🍔' },
  { id: 'b3', category: 'Fuel', limit: 12000, spent: 0, icon: '⛽' },
  { id: 'b4', category: 'Shopping', limit: 25000, spent: 0, icon: '🛍️' },
];

export const CATEGORIES: Category[] = [
  { name: 'Salary', icon: '💼', type: 'income', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Freelance', icon: '💻', type: 'income', color: 'bg-teal-100 text-teal-700' },
  { name: 'Investments', icon: '📈', type: 'income', color: 'bg-blue-100 text-blue-700' },
  { name: 'Groceries', icon: '🛒', type: 'expense', color: 'bg-amber-100 text-amber-700' },
  { name: 'Dining Out', icon: '🍔', type: 'expense', color: 'bg-orange-100 text-orange-700' },
  { name: 'Shopping', icon: '🛍️', type: 'expense', color: 'bg-purple-100 text-purple-700' },
  { name: 'Fuel', icon: '⛽', type: 'expense', color: 'bg-rose-100 text-rose-700' },
  { name: 'Utilities', icon: '⚡', type: 'expense', color: 'bg-yellow-100 text-yellow-700' },
];
