export type TransactionType = 'income' | 'expense' | 'transfer';

export type WalletType = 'cash' | 'bank' | 'bkash' | 'nagad' | 'rocket' | 'paypal' | 'other';

export type CurrencyCode = 'BDT' | 'USD' | 'EUR' | 'GBP' | 'INR' | 'AED' | 'SAR' | 'JPY' | 'CAD' | 'AUD';

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  rateAgainstUSD: number; // e.g. USD = 1.0, BDT = 121.50, EUR = 0.95
}

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number; // in original currency
  currency: CurrencyCode;
  accountNumber?: string;
  color: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // in transaction currency
  currency: CurrencyCode;
  exchangeRate: number; // rate against USD at the moment of transaction
  convertedAmountUSD: number; // converted base amount to ensure no historical changes
  categoryId: string;
  walletId: string;
  toWalletId?: string; // used for transfer
  date: string; // ISO date string YYYY-MM-DD
  description: string;
  attachment?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number; // monthly limit in primary currency
  period: 'monthly' | 'weekly';
  alertThreshold: number; // percentage, e.g. 80 for 80%
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  currency: CurrencyCode;
  targetDate: string;
  color: string;
  icon?: string;
  isCompleted?: boolean;
  createdAt: string;
}

export interface RecurringTransaction {
  id: string;
  title: string;
  type: 'income' | 'expense';
  amount: number;
  currency: CurrencyCode;
  categoryId: string;
  walletId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  nextDueDate: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'budget_alert' | 'recurring_reminder' | 'goal_reached' | 'security' | 'info';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  primaryCurrency: CurrencyCode;
  theme: 'light' | 'dark' | 'system';
  isDemoUser: boolean;
  createdAt: string;
}
