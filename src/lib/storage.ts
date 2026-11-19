import {
  Wallet,
  Category,
  Transaction,
  Budget,
  SavingsGoal,
  RecurringTransaction,
  AppNotification,
  UserProfile,
} from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  // Income
  { id: 'cat-inc-1', name: 'Salary', type: 'income', icon: 'Briefcase', color: '#16A36A', isDefault: true },
  { id: 'cat-inc-2', name: 'Freelancing', type: 'income', icon: 'Laptop', color: '#059669', isDefault: true },
  { id: 'cat-inc-3', name: 'Investments', type: 'income', icon: 'TrendingUp', color: '#10B981', isDefault: true },
  { id: 'cat-inc-4', name: 'Business', type: 'income', icon: 'Building', color: '#34D399', isDefault: true },
  { id: 'cat-inc-5', name: 'Gift / Bonus', type: 'income', icon: 'Gift', color: '#6EE7B7', isDefault: true },

  // Expenses
  { id: 'cat-exp-1', name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#EF4444', isDefault: true },
  { id: 'cat-exp-2', name: 'Housing & Rent', type: 'expense', icon: 'Home', color: '#F97316', isDefault: true },
  { id: 'cat-exp-3', name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#EC4899', isDefault: true },
  { id: 'cat-exp-4', name: 'Transportation', type: 'expense', icon: 'Car', color: '#3B82F6', isDefault: true },
  { id: 'cat-exp-5', name: 'Utilities & Bills', type: 'expense', icon: 'Zap', color: '#8B5CF6', isDefault: true },
  { id: 'cat-exp-6', name: 'Health & Medical', type: 'expense', icon: 'HeartPulse', color: '#14B8A6', isDefault: true },
  { id: 'cat-exp-7', name: 'Entertainment', type: 'expense', icon: 'Film', color: '#A855F7', isDefault: true },
  { id: 'cat-exp-8', name: 'Education', type: 'expense', icon: 'GraduationCap', color: '#6366F1', isDefault: true },
  { id: 'cat-exp-9', name: 'Subscriptions', type: 'expense', icon: 'CreditCard', color: '#D946EF', isDefault: true },
  { id: 'cat-exp-10', name: 'Travel', type: 'expense', icon: 'Plane', color: '#06B6D4', isDefault: true },
];

export const INITIAL_WALLETS: Wallet[] = [
  {
    id: 'w-1',
    name: 'City Bank Savings',
    type: 'bank',
    balance: 145000,
    currency: 'BDT',
    accountNumber: '**** 8941',
    color: '#7657E8',
  },
  {
    id: 'w-2',
    name: 'bKash Personal',
    type: 'bkash',
    balance: 18450,
    currency: 'BDT',
    accountNumber: '01712-***921',
    color: '#E2136E',
  },
  {
    id: 'w-3',
    name: 'Cash in Hand',
    type: 'cash',
    balance: 12500,
    currency: 'BDT',
    color: '#16A36A',
  },
  {
    id: 'w-4',
    name: 'Nagad Account',
    type: 'nagad',
    balance: 6200,
    currency: 'BDT',
    accountNumber: '01823-***402',
    color: '#F7931E',
  },
  {
    id: 'w-5',
    name: 'PayPal Global',
    type: 'paypal',
    balance: 850,
    currency: 'USD',
    accountNumber: 'user@finora.io',
    color: '#003087',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'income',
    amount: 110000,
    currency: 'BDT',
    exchangeRate: 122.0,
    convertedAmountUSD: 901.64,
    categoryId: 'cat-inc-1',
    walletId: 'w-1',
    date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
    description: 'Monthly Tech Salary Credit',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tx-2',
    type: 'income',
    amount: 450,
    currency: 'USD',
    exchangeRate: 1.0,
    convertedAmountUSD: 450.0,
    categoryId: 'cat-inc-2',
    walletId: 'w-5',
    date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
    description: 'Upwork Frontend Client Project Payment',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tx-3',
    type: 'expense',
    amount: 25000,
    currency: 'BDT',
    exchangeRate: 122.0,
    convertedAmountUSD: 204.92,
    categoryId: 'cat-exp-2',
    walletId: 'w-1',
    date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
    description: 'House Rent for this month',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tx-4',
    type: 'expense',
    amount: 5400,
    currency: 'BDT',
    exchangeRate: 122.0,
    convertedAmountUSD: 44.26,
    categoryId: 'cat-exp-1',
    walletId: 'w-2',
    date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
    description: 'Grocery Shopping at Shwapno',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tx-5',
    type: 'expense',
    amount: 1850,
    currency: 'BDT',
    exchangeRate: 122.0,
    convertedAmountUSD: 15.16,
    categoryId: 'cat-exp-4',
    walletId: 'w-2',
    date: new Date().toISOString().split('T')[0],
    description: 'Uber Ride & CNG to Office',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tx-6',
    type: 'transfer',
    amount: 10000,
    currency: 'BDT',
    exchangeRate: 122.0,
    convertedAmountUSD: 81.97,
    categoryId: 'cat-exp-4',
    walletId: 'w-1',
    toWalletId: 'w-2',
    date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
    description: 'Bank to bKash Add Money',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tx-7',
    type: 'expense',
    amount: 24.99,
    currency: 'USD',
    exchangeRate: 1.0,
    convertedAmountUSD: 24.99,
    categoryId: 'cat-exp-9',
    walletId: 'w-5',
    date: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString().split('T')[0],
    description: 'ChatGPT Plus & Cloud hosting subscription',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'b-1',
    categoryId: 'cat-exp-1', // Food & Dining
    amount: 15000,
    period: 'monthly',
    alertThreshold: 80,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b-2',
    categoryId: 'cat-exp-3', // Shopping
    amount: 10000,
    period: 'monthly',
    alertThreshold: 85,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b-3',
    categoryId: 'cat-exp-4', // Transportation
    amount: 6000,
    period: 'monthly',
    alertThreshold: 80,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b-4',
    categoryId: 'cat-exp-5', // Utilities
    amount: 5000,
    period: 'monthly',
    alertThreshold: 90,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'sg-1',
    title: 'Emergency Safety Fund (6 Months)',
    targetAmount: 300000,
    currentAmount: 145000,
    currency: 'BDT',
    targetDate: '2026-12-31',
    color: '#7657E8',
    icon: 'ShieldCheck',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sg-2',
    title: 'MacBook Pro M-Series Workstation',
    targetAmount: 220000,
    currentAmount: 165000,
    currency: 'BDT',
    targetDate: '2026-08-15',
    color: '#3B82F6',
    icon: 'Laptop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sg-3',
    title: 'Cox’s Bazar Vacation Tour',
    targetAmount: 35000,
    currentAmount: 25000,
    currency: 'BDT',
    targetDate: '2026-10-10',
    color: '#10B981',
    icon: 'Palmtree',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_RECURRING: RecurringTransaction[] = [
  {
    id: 'rec-1',
    title: 'Internet Broadband Bill',
    type: 'expense',
    amount: 1200,
    currency: 'BDT',
    categoryId: 'cat-exp-5',
    walletId: 'w-2',
    frequency: 'monthly',
    startDate: '2026-01-01',
    nextDueDate: '2026-12-05',
    isActive: true,
    notes: 'Fiber link 50Mbps payment',
  },
  {
    id: 'rec-2',
    title: 'Flat Apartment Rent',
    type: 'expense',
    amount: 25000,
    currency: 'BDT',
    categoryId: 'cat-exp-2',
    walletId: 'w-1',
    frequency: 'monthly',
    startDate: '2026-01-01',
    nextDueDate: '2026-12-01',
    isActive: true,
  },
  {
    id: 'rec-3',
    title: 'Retainer Tech Consulting',
    type: 'income',
    amount: 500,
    currency: 'USD',
    categoryId: 'cat-inc-2',
    walletId: 'w-5',
    frequency: 'monthly',
    startDate: '2026-01-15',
    nextDueDate: '2026-12-15',
    isActive: true,
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Budget Alert: Food & Dining',
    message: 'You have used 64% of your monthly Food budget.',
    type: 'budget_alert',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    title: 'Salary Deposited',
    message: '৳ 110,000 was successfully added to City Bank Savings.',
    type: 'info',
    isRead: false,
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    title: 'Savings Goal 75% Reached',
    message: 'Congratulations! You are almost at your MacBook Workstation goal.',
    type: 'goal_reached',
    isRead: true,
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_USER: UserProfile = {
  id: 'usr-finora-01',
  email: 'finora.user@finora.io',
  fullName: 'Tanzim Ahmed',
  primaryCurrency: 'BDT',
  theme: 'light',
  isDemoUser: true,
  createdAt: new Date().toISOString(),
};

// Storage keys
const STORAGE_PREFIX = 'finora_';

export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('Local storage write error', e);
    }
  },
  clear: (): void => {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(STORAGE_PREFIX))
        .forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.error('Storage clear error', e);
    }
  },
};
