import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency, convertCurrency } from '../lib/currencies';
import { exportTransactionsToCSV, exportTransactionsToPDF } from '../lib/export';
import { Category, Transaction } from '../types';
import {
  FileSpreadsheet,
  FileText,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  BarChart2,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const {
    transactions,
    categories,
    wallets,
    primaryCurrency,
    exchangeRates,
    monthlyIncome,
    monthlyExpense,
    monthlySavings,
  } = useFinance();

  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  const categoryMap = useMemo(() => new Map<string, Category>(categories.map((c) => [c.id, c])), [categories]);

  // Area Chart Trend Data (Past 6 periods)
  const trendData = [
    { period: 'May', income: 92000, expense: 45000, savings: 47000 },
    { period: 'Jun', income: 95000, expense: 48000, savings: 47000 },
    { period: 'Jul', income: 105000, expense: 52000, savings: 53000 },
    { period: 'Aug', income: 112000, expense: 61000, savings: 51000 },
    { period: 'Sep', income: 108000, expense: 50000, savings: 58000 },
    { period: 'Current', income: monthlyIncome || 120000, expense: monthlyExpense || 54000, savings: monthlySavings || 66000 },
  ];

  // Category Expense Ranking
  const categoryRanking = useMemo(() => {
    const map: Record<string, { id: string; name: string; total: number; color: string; count: number }> = {};

    transactions
      .filter((t: Transaction) => t.type === 'expense')
      .forEach((t: Transaction) => {
        const cat = categoryMap.get(t.categoryId);
        const name = cat ? cat.name : 'Other';
        const color = cat ? cat.color : '#94A3B8';
        const converted = convertCurrency(t.amount, t.currency, primaryCurrency, exchangeRates);

        if (!map[name]) {
          map[name] = { id: t.categoryId, name, total: 0, color, count: 0 };
        }
        map[name].total += converted;
        map[name].count += 1;
      });

    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [transactions, categoryMap, primaryCurrency, exchangeRates]);

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions, categories, wallets);
  };

  const handleExportPDF = () => {
    exportTransactionsToPDF(transactions, categories, wallets, primaryCurrency);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive financial statements and category spending distribution
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs font-semibold">
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="text-xs font-semibold">
            <FileText className="w-4 h-4 mr-1.5 text-red-500" /> Export PDF Statement
          </Button>
        </div>
      </div>

      {/* Main Income vs Expense Flow Chart */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Financial Trend Overview
            </h3>
            <p className="text-xs text-slate-400">Cash flow and net savings velocity</p>
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 'month' ? 'bg-white dark:bg-slate-900 shadow-sm text-primary' : 'text-slate-500'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 'quarter' ? 'bg-white dark:bg-slate-900 shadow-sm text-primary' : 'text-slate-500'
              }`}
            >
              Quarterly
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 'year' ? 'bg-white dark:bg-slate-900 shadow-sm text-primary' : 'text-slate-500'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A36A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#16A36A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E45465" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#E45465" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(val: any) => formatCurrency(val, primaryCurrency)} />
              <Area type="monotone" dataKey="income" stroke="#16A36A" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInc)" />
              <Area type="monotone" dataKey="expense" stroke="#E45465" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Category Expenses Breakdown Table & Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
            Top Expense Categories
          </h3>
          <p className="text-xs text-slate-400 mb-5">Ranked by total expenditure</p>

          <div className="space-y-4">
            {categoryRanking.map((item, idx) => {
              const maxVal = categoryRanking[0]?.total || 1;
              const barPercent = Math.round((item.total / maxVal) * 100);

              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-400">#{idx + 1}</span>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                      <span className="text-[11px] text-slate-400">({item.count} txns)</span>
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(item.total, primaryCurrency)}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${barPercent}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
            Monthly Summary
          </h3>
          <p className="text-xs text-slate-400 mb-5">Key figures for this month</p>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">Total Inflow</span>
                <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(monthlyIncome, primaryCurrency)}
                </span>
              </div>
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>

            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-600 block">Total Outflow</span>
                <span className="text-base font-extrabold text-rose-700 dark:text-rose-300">
                  {formatCurrency(monthlyExpense, primaryCurrency)}
                </span>
              </div>
              <TrendingDown className="w-6 h-6 text-rose-500" />
            </div>

            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary block">Net Retained</span>
                <span className="text-base font-extrabold text-primary">
                  {formatCurrency(monthlySavings, primaryCurrency)}
                </span>
              </div>
              <BarChart2 className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
