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

// All demo financial data removed — new users start with a clean slate (all 0)
export const INITIAL_WALLETS: Wallet[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_BUDGETS: Budget[] = [];
export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [];
export const INITIAL_RECURRING: RecurringTransaction[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_USER: UserProfile = {
  id: '',
  email: '',
  fullName: 'User',
  primaryCurrency: 'BDT',
  theme: 'light',
  isDemoUser: false,
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
