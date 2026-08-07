export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  wallet: string;
  note: string;
  date: string;
  isRecurring: boolean;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  type: 'cash' | 'bank' | 'mobile';
  icon: string;
  color: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  icon: string;
}

export interface Category {
  name: string;
  icon: string;
  type: 'income' | 'expense';
  color: string;
}
