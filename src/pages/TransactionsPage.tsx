import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { formatCurrency } from '../lib/currencies';
import { exportTransactionsToCSV, exportTransactionsToPDF } from '../lib/export';
import { Category, Wallet, Transaction } from '../types';
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  FileSpreadsheet,
  FileText,
  Calendar,
  Wallet as WalletIcon,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const {
    transactions,
    categories,
    wallets,
    deleteTransaction,
    primaryCurrency,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWallet, setSelectedWallet] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const categoryMap = useMemo(() => new Map<string, Category>(categories.map((c) => [c.id, c])), [categories]);
  const walletMap = useMemo(() => new Map<string, Wallet>(wallets.map((w) => [w.id, w])), [wallets]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx: Transaction) => {
      // Type
      if (selectedType !== 'all' && tx.type !== selectedType) return false;

      // Category
      if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) return false;

      // Wallet
      if (selectedWallet !== 'all' && tx.walletId !== selectedWallet && tx.toWalletId !== selectedWallet) {
        return false;
      }

      // Date Range
      if (startDate && tx.date < startDate) return false;
      if (endDate && tx.date > endDate) return false;

      // Search text
      if (search.trim()) {
        const query = search.toLowerCase();
        const descMatch = tx.description.toLowerCase().includes(query);
        const catName = categoryMap.get(tx.categoryId)?.name.toLowerCase() || '';
        const catMatch = catName.includes(query);
        const walletName = walletMap.get(tx.walletId)?.name.toLowerCase() || '';
        const walletMatch = walletName.includes(query);
        const amountMatch = String(tx.amount).includes(query);

        if (!descMatch && !catMatch && !walletMatch && !amountMatch) return false;
      }

      return true;
    });
  }, [
    transactions,
    selectedType,
    selectedCategory,
    selectedWallet,
    startDate,
    endDate,
    search,
    categoryMap,
    walletMap,
  ]);

  const handleExportCSV = () => {
    exportTransactionsToCSV(filtered, categories, wallets);
  };

  const handleExportPDF = () => {
    exportTransactionsToPDF(filtered, categories, wallets, primaryCurrency);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Transaction History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, filter, and export all financial records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            title="Download CSV statement"
            className="text-xs"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1 text-emerald-600" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            title="Download PDF statement"
            className="text-xs"
          >
            <FileText className="w-4 h-4 mr-1 text-red-500" />
            PDF
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="text-xs font-bold">
            <Plus className="w-4 h-4 mr-1" />
            Add Record
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by note, category, or amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="all">All Types (Income, Expense, Transfer)</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
              <option value="transfer">Transfers Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c: Category) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Wallet Filter */}
          <div>
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="all">All Wallets</option>
              {wallets.map((w: Wallet) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <span className="font-semibold text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Date Range:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>

          {(startDate || endDate || search || selectedType !== 'all' || selectedCategory !== 'all' || selectedWallet !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedType('all');
                setSelectedCategory('all');
                setSelectedWallet('all');
                setStartDate('');
                setEndDate('');
              }}
              className="ml-auto text-xs text-primary font-bold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Wallet</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length > 0 ? (
                filtered.map((tx: Transaction) => {
                  const cat = categoryMap.get(tx.categoryId);
                  const w = walletMap.get(tx.walletId);
                  const toW = tx.toWalletId ? walletMap.get(tx.toWalletId) : null;

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-medium text-slate-500 whitespace-nowrap">
                        {tx.date}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant={tx.type as any}>
                          {tx.type === 'income' ? 'Income' : tx.type === 'expense' ? 'Expense' : 'Transfer'}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {tx.description}
                        {tx.type === 'transfer' && toW && (
                          <span className="block text-[11px] font-normal text-slate-400">
                            {w?.name} → {toW?.name}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
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

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {w?.name || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold whitespace-nowrap">
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

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this transaction? Balance will be adjusted automatically.')) {
                              deleteTransaction(tx.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-expense hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No transactions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between items-center">
          <span>Showing {filtered.length} records</span>
          <span>Statement ready for export</span>
        </div>
      </Card>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
