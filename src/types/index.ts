export type TransactionType = 'income' | 'expense' | 'transfer';

export type WalletType = 'cash' | 'bank' | 'bkash' | 'nagad' | 'rocket' | 'paypal' | 'other';

export type CurrencyCode = 'BDT' | 'USD' | 'EUR' | 'GBP' | 'INR' | 'AED' | 'SAR' | 'JPY' | 'CAD' | 'AUD';

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  rateAgainstUSD: number; // e.g. USD = 1.0, BDT = 121.50, EUR = 0.95
}

// 1. PROFILES
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  country?: string;
  timezone?: string;
  primaryCurrency: CurrencyCode;
  theme: 'light' | 'dark' | 'system';
  role?: 'user' | 'admin' | 'support';
  isDemoUser: boolean;
  createdAt: string;
  updatedAt?: string;
}

// 2. WALLETS
export interface Wallet {
  id: string;
  userId?: string;
  name: string;
  type: WalletType;
  balance: number; // in original currency
  currency: CurrencyCode;
  accountNumber?: string;
  color: string;
  icon?: string;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 3. CATEGORIES
export interface Category {
  id: string;
  userId?: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault?: boolean;
  createdAt?: string;
}

// 4. TRANSACTIONS
export interface Transaction {
  id: string;
  userId?: string;
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
  notes?: string;
  attachmentUrl?: string;
  isRecurring?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// 5. BUDGETS
export interface Budget {
  id: string;
  userId?: string;
  categoryId: string;
  amount: number; // limit in primary currency
  period: 'monthly' | 'weekly';
  alertThreshold: number; // percentage, e.g. 80 for 80%
  createdAt: string;
  updatedAt?: string;
}

// 6. SAVINGS GOALS
export interface SavingsGoal {
  id: string;
  userId?: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  currency: CurrencyCode;
  targetDate?: string;
  color: string;
  icon?: string;
  isCompleted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// 7. RECURRING TRANSACTIONS
export interface RecurringTransaction {
  id: string;
  userId?: string;
  title: string;
  type: 'income' | 'expense';
  amount: number;
  currency: CurrencyCode;
  categoryId?: string;
  walletId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  nextDueDate: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 8. NOTIFICATIONS
export interface AppNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'budget_alert' | 'recurring_reminder' | 'goal_reached' | 'security' | 'info';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// 9. EXCHANGE RATES
export interface ExchangeRateRecord {
  id: string;
  baseCurrency: string;
  targetCurrency: CurrencyCode;
  rate: number;
  source: string;
  lastUpdated: string;
}

// 10. ATTACHMENTS
export interface AttachmentRecord {
  id: string;
  userId: string;
  transactionId?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  createdAt: string;
}

// 11. USER SETTINGS
export interface UserSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  budgetAlerts: boolean;
  mfaEnabled: boolean;
  biometricLogin: boolean;
  language: string;
  autoBackup: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 12. AUDIT LOGS
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  createdAt: string;
}

// 13. SUBSCRIPTIONS
export interface Subscription {
  id: string;
  userId: string;
  planTier: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 14. SUPPORT TICKETS
export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  adminReply?: string;
  createdAt: string;
  updatedAt?: string;
}

// 15. DEVICES
export interface DeviceSession {
  id: string;
  userId: string;
  deviceName: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  lastActive: string;
  isCurrent: boolean;
  createdAt: string;
}
