export interface IncomeSource {
  id: string;
  name: string;
  balance: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  wallet: string;
  source?: string; // Sub-wallet / Income Source name e.g. "Ahmed's Salary"
  note: string;
  date: string;
  time?: string;
  isRecurring: boolean;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  type: 'cash' | 'bank' | 'mobile';
  icon: string;
  color: string;
  sources?: IncomeSource[];
}

export interface Budget {
  id: string;
  category: string;
  limit: number; // Monthly limit
  dailyLimit?: number; // Daily limit
  spent: number;
  dailySpent?: number;
  icon: string;
}

export interface Category {
  name: string;
  icon: string;
  type: 'income' | 'expense';
  color: string;
}
