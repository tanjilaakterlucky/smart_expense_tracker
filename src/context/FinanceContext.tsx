import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import Decimal from 'decimal.js';
import {
  Transaction,
  Wallet,
  Category,
  Budget,
  SavingsGoal,
  RecurringTransaction,
  AppNotification,
  CurrencyCode,
  TransactionType,
} from '../types';
import {
  INITIAL_WALLETS,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_RECURRING,
  INITIAL_NOTIFICATIONS,
  storage,
} from '../lib/storage';
import { convertCurrency, SUPPORTED_CURRENCIES } from '../lib/currencies';
import { generateId } from '../lib/utils';

interface FinanceContextType {
  // State
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  recurring: RecurringTransaction[];
  notifications: AppNotification[];
  primaryCurrency: CurrencyCode;
  exchangeRates: Record<CurrencyCode, number>;

  // Calculated Metrics (in primary currency)
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySavings: number;
  savingsRate: number;

  // Actions
  setPrimaryCurrency: (curr: CurrencyCode) => void;
  updateExchangeRate: (curr: CurrencyCode, rateAgainstUSD: number) => void;

  // Transaction Actions
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'convertedAmountUSD' | 'exchangeRate'>) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Wallet Actions
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  updateWallet: (id: string, wallet: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  transferWalletFunds: (fromWalletId: string, toWalletId: string, amount: number, description?: string) => void;

  // Category Actions
  addCategory: (cat: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;

  // Budget Actions
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Savings Goal Actions
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  addFundsToGoal: (goalId: string, amount: number, walletId: string) => void;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;

  // Recurring Actions
  addRecurring: (item: Omit<RecurringTransaction, 'id'>) => void;
  toggleRecurring: (id: string) => void;
  deleteRecurring: (id: string) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Reset
  resetToDemoData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [primaryCurrency, setPrimaryCurrencyState] = useState<CurrencyCode>(() => {
    return storage.get<CurrencyCode>('primary_currency', 'BDT');
  });

  const [exchangeRates, setExchangeRates] = useState<Record<CurrencyCode, number>>(() => {
    const defaultRates: Record<CurrencyCode, number> = {} as any;
    Object.keys(SUPPORTED_CURRENCIES).forEach((k) => {
      const code = k as CurrencyCode;
      defaultRates[code] = SUPPORTED_CURRENCIES[code].rateAgainstUSD;
    });
    return storage.get('exchange_rates', defaultRates);
  });

  const [wallets, setWallets] = useState<Wallet[]>(() => {
    return storage.get('wallets', INITIAL_WALLETS);
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    return storage.get('categories', INITIAL_CATEGORIES);
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return storage.get('transactions', INITIAL_TRANSACTIONS);
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    return storage.get('budgets', INITIAL_BUDGETS);
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    return storage.get('savings_goals', INITIAL_SAVINGS_GOALS);
  });

  const [recurring, setRecurring] = useState<RecurringTransaction[]>(() => {
    return storage.get('recurring', INITIAL_RECURRING);
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    return storage.get('notifications', INITIAL_NOTIFICATIONS);
  });

  // Sync to local storage
  useEffect(() => {
    storage.set('primary_currency', primaryCurrency);
  }, [primaryCurrency]);

  useEffect(() => {
    storage.set('exchange_rates', exchangeRates);
  }, [exchangeRates]);

  useEffect(() => {
    storage.set('wallets', wallets);
  }, [wallets]);

  useEffect(() => {
    storage.set('categories', categories);
  }, [categories]);

  useEffect(() => {
    storage.set('transactions', transactions);
  }, [transactions]);

  useEffect(() => {
    storage.set('budgets', budgets);
  }, [budgets]);

  useEffect(() => {
    storage.set('savings_goals', savingsGoals);
  }, [savingsGoals]);

  useEffect(() => {
    storage.set('recurring', recurring);
  }, [recurring]);

  useEffect(() => {
    storage.set('notifications', notifications);
  }, [notifications]);

  // Set Primary Currency
  const setPrimaryCurrency = (curr: CurrencyCode) => {
    setPrimaryCurrencyState(curr);
  };

  const updateExchangeRate = (curr: CurrencyCode, rateAgainstUSD: number) => {
    setExchangeRates((prev) => ({ ...prev, [curr]: rateAgainstUSD }));
  };

  // --- Total Balance in Primary Currency ---
  const totalBalance = useMemo(() => {
    let sum = new Decimal(0);
    wallets.forEach((w) => {
      const converted = convertCurrency(w.balance, w.currency, primaryCurrency, exchangeRates);
      sum = sum.plus(new Decimal(converted));
    });
    return sum.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
  }, [wallets, primaryCurrency, exchangeRates]);

  // --- Current Month Totals ---
  const { monthlyIncome, monthlyExpense, monthlySavings, savingsRate } = useMemo(() => {
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let incSum = new Decimal(0);
    let expSum = new Decimal(0);

    transactions.forEach((tx) => {
      if (tx.date.startsWith(currentYearMonth)) {
        const converted = convertCurrency(tx.amount, tx.currency, primaryCurrency, exchangeRates);
        if (tx.type === 'income') {
          incSum = incSum.plus(new Decimal(converted));
        } else if (tx.type === 'expense') {
          expSum = expSum.plus(new Decimal(converted));
        }
      }
    });

    const inc = incSum.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
    const exp = expSum.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
    const sav = incSum.minus(expSum).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
    const rate = inc > 0 ? Math.max(0, Math.min(100, Math.round((sav / inc) * 100))) : 0;

    return {
      monthlyIncome: inc,
      monthlyExpense: exp,
      monthlySavings: sav,
      savingsRate: rate,
    };
  }, [transactions, primaryCurrency, exchangeRates]);

  // --- Notifications Helper ---
  const pushNotification = (title: string, message: string, type: AppNotification['type']) => {
    const newNotif: AppNotification = {
      id: generateId(),
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // --- Add Transaction ---
  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt' | 'convertedAmountUSD' | 'exchangeRate'>) => {
    const rate = exchangeRates[data.currency] || 1;
    const usdConverted = convertCurrency(data.amount, data.currency, 'USD', exchangeRates);

    const newTx: Transaction = {
      ...data,
      id: generateId(),
      exchangeRate: rate,
      convertedAmountUSD: usdConverted,
      createdAt: new Date().toISOString(),
    };

    // Update wallet balance(s)
    setWallets((prevWallets) => {
      return prevWallets.map((w) => {
        if (data.type === 'income' && w.id === data.walletId) {
          const newBal = new Decimal(w.balance).plus(new Decimal(data.amount)).toNumber();
          return { ...w, balance: newBal, updatedAt: new Date().toISOString() };
        }
        if (data.type === 'expense' && w.id === data.walletId) {
          const newBal = new Decimal(w.balance).minus(new Decimal(data.amount)).toNumber();
          return { ...w, balance: newBal, updatedAt: new Date().toISOString() };
        }
        if (data.type === 'transfer') {
          if (w.id === data.walletId) {
            // Source wallet deduction
            const newBal = new Decimal(w.balance).minus(new Decimal(data.amount)).toNumber();
            return { ...w, balance: newBal, updatedAt: new Date().toISOString() };
          }
          if (w.id === data.toWalletId) {
            // Destination wallet credit (converted to destination wallet's currency!)
            const targetAmount = convertCurrency(data.amount, data.currency, w.currency, exchangeRates);
            const newBal = new Decimal(w.balance).plus(new Decimal(targetAmount)).toNumber();
            return { ...w, balance: newBal, updatedAt: new Date().toISOString() };
          }
        }
        return w;
      });
    });

    setTransactions((prev) => [newTx, ...prev]);

    // Check Budget Alerts if expense
    if (data.type === 'expense') {
      const budget = budgets.find((b) => b.categoryId === data.categoryId);
      if (budget) {
        // Calculate new total expense for this category
        const catSpent = transactions
          .filter((t) => t.type === 'expense' && t.categoryId === data.categoryId)
          .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, primaryCurrency, exchangeRates), 0);
        const newCatSpent = catSpent + convertCurrency(data.amount, data.currency, primaryCurrency, exchangeRates);
        const percent = Math.round((newCatSpent / budget.amount) * 100);

        if (percent >= 100) {
          pushNotification('Budget Exceeded!', `You have exceeded 100% of your budget for this category.`, 'budget_alert');
        } else if (percent >= budget.alertThreshold) {
          pushNotification('Budget Warning', `You have reached ${percent}% of your category budget.`, 'budget_alert');
        }
      }
    }
  };

  // --- Update Transaction ---
  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  // --- Delete Transaction ---
  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    // Reverse wallet balance effect
    setWallets((prev) =>
      prev.map((w) => {
        if (tx.type === 'income' && w.id === tx.walletId) {
          const newBal = new Decimal(w.balance).minus(new Decimal(tx.amount)).toNumber();
          return { ...w, balance: newBal };
        }
        if (tx.type === 'expense' && w.id === tx.walletId) {
          const newBal = new Decimal(w.balance).plus(new Decimal(tx.amount)).toNumber();
          return { ...w, balance: newBal };
        }
        if (tx.type === 'transfer') {
          if (w.id === tx.walletId) {
            const newBal = new Decimal(w.balance).plus(new Decimal(tx.amount)).toNumber();
            return { ...w, balance: newBal };
          }
          if (w.id === tx.toWalletId) {
            const targetAmount = convertCurrency(tx.amount, tx.currency, w.currency, exchangeRates);
            const newBal = new Decimal(w.balance).minus(new Decimal(targetAmount)).toNumber();
            return { ...w, balance: newBal };
          }
        }
        return w;
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Wallets ---
  const addWallet = (walletData: Omit<Wallet, 'id'>) => {
    const newWallet: Wallet = {
      ...walletData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWallets((prev) => [...prev, newWallet]);
  };

  const updateWallet = (id: string, walletData: Partial<Wallet>) => {
    setWallets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...walletData, updatedAt: new Date().toISOString() } : w))
    );
  };

  const deleteWallet = (id: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== id));
  };

  const transferWalletFunds = (
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    description: string = 'Wallet to Wallet Transfer'
  ) => {
    const sourceWallet = wallets.find((w) => w.id === fromWalletId);
    const destWallet = wallets.find((w) => w.id === toWalletId);
    if (!sourceWallet || !destWallet) return;

    addTransaction({
      type: 'transfer',
      amount,
      currency: sourceWallet.currency,
      categoryId: '',
      walletId: fromWalletId,
      toWalletId,
      date: new Date().toISOString().split('T')[0],
      description,
    });
  };

  // --- Categories ---
  const addCategory = (cat: Omit<Category, 'id'>) => {
    setCategories((prev) => [...prev, { ...cat, id: generateId() }]);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // --- Budgets ---
  const addBudget = (budgetData: Omit<Budget, 'id' | 'createdAt'>) => {
    setBudgets((prev) => [
      ...prev,
      { ...budgetData, id: generateId(), createdAt: new Date().toISOString() },
    ]);
  };

  const updateBudget = (id: string, budgetData: Partial<Budget>) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...budgetData } : b)));
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  // --- Savings Goals ---
  const addSavingsGoal = (goalData: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    setSavingsGoals((prev) => [
      ...prev,
      { ...goalData, id: generateId(), createdAt: new Date().toISOString() },
    ]);
  };

  const addFundsToGoal = (goalId: string, amount: number, walletId: string) => {
    const goal = savingsGoals.find((g) => g.id === goalId);
    const wallet = wallets.find((w) => w.id === walletId);
    if (!goal || !wallet) return;

    // Convert amount if currencies differ
    const goalCurrencyAmount = convertCurrency(amount, wallet.currency, goal.currency, exchangeRates);

    // Deduct from wallet
    setWallets((prev) =>
      prev.map((w) =>
        w.id === walletId ? { ...w, balance: new Decimal(w.balance).minus(new Decimal(amount)).toNumber() } : w
      )
    );

    // Add to goal
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const newCurrent = new Decimal(g.currentAmount).plus(new Decimal(goalCurrencyAmount)).toNumber();
          const completed = newCurrent >= g.targetAmount;
          if (completed && !g.isCompleted) {
            pushNotification('Goal Completed! 🎉', `Congratulations, you reached your target for "${g.title}"!`, 'goal_reached');
          }
          return { ...g, currentAmount: newCurrent, isCompleted: completed };
        }
        return g;
      })
    );

    // Record as transfer transaction
    addTransaction({
      type: 'transfer',
      amount,
      currency: wallet.currency,
      categoryId: '',
      walletId,
      date: new Date().toISOString().split('T')[0],
      description: `Savings Deposit to: ${goal.title}`,
    });
  };

  const updateSavingsGoal = (id: string, goalData: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...goalData } : g)));
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // --- Recurring ---
  const addRecurring = (item: Omit<RecurringTransaction, 'id'>) => {
    setRecurring((prev) => [...prev, { ...item, id: generateId() }]);
  };

  const toggleRecurring = (id: string) => {
    setRecurring((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const deleteRecurring = (id: string) => {
    setRecurring((prev) => prev.filter((r) => r.id !== id));
  };

  // --- Notifications ---
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // --- Reset to Demo Data ---
  const resetToDemoData = () => {
    setWallets(INITIAL_WALLETS);
    setCategories(INITIAL_CATEGORIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setRecurring(INITIAL_RECURRING);
    setNotifications(INITIAL_NOTIFICATIONS);
    setPrimaryCurrencyState('BDT');
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        wallets,
        categories,
        budgets,
        savingsGoals,
        recurring,
        notifications,
        primaryCurrency,
        exchangeRates,
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        monthlySavings,
        savingsRate,
        setPrimaryCurrency,
        updateExchangeRate,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addWallet,
        updateWallet,
        deleteWallet,
        transferWalletFunds,
        addCategory,
        deleteCategory,
        addBudget,
        updateBudget,
        deleteBudget,
        addSavingsGoal,
        addFundsToGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        addRecurring,
        toggleRecurring,
        deleteRecurring,
        markNotificationAsRead,
        clearAllNotifications,
        resetToDemoData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
};
