import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, convertCurrency } from '../lib/currencies';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { WalletModal } from '../components/wallets/WalletModal';
import { WalletTransferModal } from '../components/wallets/WalletTransferModal';
import { Category, Wallet, Transaction } from '../types';
import { Link } from 'react-router-dom';
import {
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  ChevronRight,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    monthlySavings,
    savingsRate,
    primaryCurrency,
    wallets,
    transactions,
    categories,
    budgets,
    exchangeRates,
  } = useFinance();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Category Map
  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));
  const walletMap = new Map<string, Wallet>(wallets.map((w) => [w.id, w]));

  // Monthly Income vs Expense Chart Data
  const barChartData = [
    { name: 'Jun', income: 95000, expense: 48000 },
    { name: 'Jul', income: 102000, expense: 53000 },
    { name: 'Aug', income: 115000, expense: 62000 },
    { name: 'Sep', income: 108000, expense: 51000 },
    { name: 'Oct', income: 125000, expense: 58000 },
    { name: 'Nov', income: monthlyIncome || 120000, expense: monthlyExpense || 54000 },
  ];

  // Category Expense Distribution for Donut Chart
  const categoryExpenseMap: Record<string, { name: string; value: number; color: string }> = {};

  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const cat = categoryMap.get(t.categoryId);
      const catName = cat ? cat.name : 'Other';
      const catColor = cat ? cat.color : '#94A3B8';
      const converted = convertCurrency(t.amount, t.currency, primaryCurrency, exchangeRates);

      if (!categoryExpenseMap[catName]) {
        categoryExpenseMap[catName] = { name: catName, value: 0, color: catColor };
      }
      categoryExpenseMap[catName].value += converted;
    });

  const pieChartData = Object.values(categoryExpenseMap).slice(0, 5);

  const openQuickTx = (type: 'income' | 'expense' | 'transfer') => {
    setTxModalType(type);
    setIsTxModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Displaying real-time balance in primary currency:{' '}
            <span className="font-bold text-primary">{primaryCurrency}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="danger"
            onClick={() => openQuickTx('expense')}
            className="text-xs font-bold"
          >
            <ArrowUpRight className="w-4 h-4 mr-1" />
            Add Expense
          </Button>
          <Button
            size="sm"
            variant="success"
            onClick={() => openQuickTx('income')}
            className="text-xs font-bold"
          >
            <ArrowDownLeft className="w-4 h-4 mr-1" />
            Add Income
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsTransferModalOpen(true)}
            className="text-xs font-bold"
          >
            <ArrowLeftRight className="w-4 h-4 mr-1" />
            Transfer
          </Button>
        </div>
      </div>

      {/* 4 Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Net Worth"
          amount={formatCurrency(totalBalance, primaryCurrency)}
          subtitle={`Across ${wallets.length} active wallets`}
          icon={<WalletIcon className="w-6 h-6" />}
          iconBgColor="bg-primary/10 text-primary"
        />

        <StatCard
          title="Monthly Income"
          amount={formatCurrency(monthlyIncome, primaryCurrency)}
          trend={{ value: '12.4%', isPositive: true }}
          icon={<TrendingUp className="w-6 h-6" />}
          iconBgColor="bg-emerald-500/10 text-income"
        />

        <StatCard
          title="Monthly Expenses"
          amount={formatCurrency(monthlyExpense, primaryCurrency)}
          trend={{ value: '4.2%', isPositive: false }}
          icon={<TrendingDown className="w-6 h-6" />}
          iconBgColor="bg-rose-500/10 text-expense"
        />

        <StatCard
          title="Monthly Savings"
          amount={formatCurrency(monthlySavings, primaryCurrency)}
          subtitle={`${savingsRate}% savings rate`}
          icon={<PiggyBank className="w-6 h-6" />}
          iconBgColor="bg-amber-500/10 text-warning"
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Income vs Expense Flow
              </h3>
              <p className="text-xs text-slate-400">Monthly comparison over time</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-income">
                <span className="w-3 h-3 rounded-md bg-income" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-expense">
                <span className="w-3 h-3 rounded-md bg-expense" /> Expense
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => formatCurrency(val, primaryCurrency)}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="income" fill="#16A36A" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="expense" fill="#E45465" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Expense Category Distribution */}
        <Card>
          <div className="mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Category Breakdown
            </h3>
            <p className="text-xs text-slate-400">Highest spending categories</p>
          </div>

          {pieChartData.length > 0 ? (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => formatCurrency(val, primaryCurrency)} />
                </PieChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-2 mt-2">
                {pieChartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-60 flex flex-col items-center justify-center text-slate-400 text-xs">
              <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
              No expense records yet
            </div>
          )}
        </Card>
      </div>

      {/* Middle Row: Wallets Showcase & Budget Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallets Summary */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                My Wallets & Accounts
              </h3>
              <p className="text-xs text-slate-400">Cash, banks, and mobile accounts</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsWalletModalOpen(true)}
                className="text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Wallet
              </Button>
              <Link to="/wallets" className="text-xs font-bold text-primary hover:underline flex items-center">
                All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {wallets.map((wallet) => {
              const convertedToPrimary = convertCurrency(
                wallet.balance,
                wallet.currency,
                primaryCurrency,
                exchangeRates
              );
              return (
                <div
                  key={wallet.id}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-primary/40 transition-all flex flex-col justify-between"
                  style={{ borderLeftColor: wallet.color, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {wallet.name}
                      </p>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                        {wallet.type} {wallet.accountNumber ? `• ${wallet.accountNumber}` : ''}
                      </span>
                    </div>
                    <CreditCard className="w-4 h-4 text-slate-400" />
                  </div>

                  <div className="mt-3">
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(wallet.balance, wallet.currency)}
                    </p>
                    {wallet.currency !== primaryCurrency && (
                      <p className="text-[11px] text-slate-400">
                        ≈ {formatCurrency(convertedToPrimary, primaryCurrency)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Budget Progress Snapshot */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Active Budgets
              </h3>
              <p className="text-xs text-slate-400">Monthly category limits</p>
            </div>
            <Link to="/budgets" className="text-xs font-bold text-primary hover:underline flex items-center">
              View <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {budgets.slice(0, 3).map((b) => {
              const cat = categoryMap.get(b.categoryId);
              const spent = transactions
                .filter((t) => t.type === 'expense' && t.categoryId === b.categoryId)
                .reduce(
                  (sum, t) => sum + convertCurrency(t.amount, t.currency, primaryCurrency, exchangeRates),
                  0
                );
              const percentage = Math.min(100, Math.round((spent / b.amount) * 100));

              return (
                <div key={b.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {cat?.name || 'Category'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {percentage}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentage > 90 ? 'bg-expense' : percentage > 70 ? 'bg-warning' : 'bg-primary'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Spent: {formatCurrency(spent, primaryCurrency)}</span>
                    <span>Limit: {formatCurrency(b.amount, primaryCurrency)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent Transactions List */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-400">Latest financial activities and transfers</p>
          </div>
          <Link
            to="/transactions"
            className="text-xs font-bold text-primary hover:underline flex items-center"
          >
            All Transactions <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-1">Type</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Wallet</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right pr-1">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.slice(0, 6).map((tx) => {
                const cat = categoryMap.get(tx.categoryId);
                const w = walletMap.get(tx.walletId);
                const toW = tx.toWalletId ? walletMap.get(tx.toWalletId) : null;

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pl-1">
                      <Badge variant={tx.type as any}>
                        {tx.type === 'income' ? 'Income' : tx.type === 'expense' ? 'Expense' : 'Transfer'}
                      </Badge>
                    </td>

                    <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200">
                      {tx.description}
                      {tx.type === 'transfer' && toW && (
                        <span className="block text-[11px] font-normal text-slate-400">
                          {w?.name} → {toW?.name}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 text-slate-600 dark:text-slate-400">
                      {cat ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3.5 text-slate-600 dark:text-slate-400">
                      {w?.name || '—'}
                    </td>

                    <td className="py-3.5 text-slate-500 whitespace-nowrap">
                      {tx.date}
                    </td>

                    <td className="py-3.5 text-right pr-1 font-extrabold whitespace-nowrap">
                      <span
                        className={
                          tx.type === 'income'
                            ? 'text-income'
                            : tx.type === 'expense'
                            ? 'text-expense'
                            : 'text-primary'
                        }
                      >
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                        {formatCurrency(tx.amount, tx.currency)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transaction & Wallet Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        defaultType={txModalType}
      />

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      <WalletTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />
    </div>
  );
};
