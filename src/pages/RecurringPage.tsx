import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { formatCurrency, SUPPORTED_CURRENCIES } from '../lib/currencies';
import { RecurringTransaction, CurrencyCode, Category, Wallet } from '../types';
import { Plus, Repeat, Calendar, Play, Pause, Trash2 } from 'lucide-react';

export const RecurringPage: React.FC = () => {
  const {
    recurring,
    wallets,
    categories,
    addRecurring,
    toggleRecurring,
    deleteRecurring,
    primaryCurrency,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(primaryCurrency);
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [nextDueDate, setNextDueDate] = useState(
    new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));
  const walletMap = new Map<string, Wallet>(wallets.map((w) => [w.id, w]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!title.trim() || isNaN(num) || num <= 0) return;

    addRecurring({
      title: title.trim(),
      type,
      amount: num,
      currency,
      walletId,
      categoryId: categoryId || (categories.find((c: Category) => c.type === type)?.id ?? ''),
      frequency,
      startDate: new Date().toISOString().split('T')[0],
      nextDueDate,
      isActive: true,
      notes,
    });

    setTitle('');
    setAmount('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recurring Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automate subscriptions, utility bills, rent, and scheduled salary income
          </p>
        </div>

        <Button size="sm" onClick={() => setIsModalOpen(true)} className="text-xs font-bold">
          <Plus className="w-4 h-4 mr-1.5" /> Add Recurring Rule
        </Button>
      </div>

      {/* List */}
      {recurring.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Repeat className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">No Recurring Rules</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Set up automatic reminders for monthly broadband bills, house rent, or salary retainers.
          </p>
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="mt-4 text-xs font-bold">
            <Plus className="w-4 h-4 mr-1.5" /> Add Your First Recurring Rule
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recurring.map((item: RecurringTransaction) => {
          const cat = categoryMap.get(item.categoryId);
          const w = walletMap.get(item.walletId);

          return (
            <Card
              key={item.id}
              className={`flex flex-col justify-between transition-all ${
                item.isActive ? 'hover:border-primary/40' : 'opacity-60 bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={item.type as any}>{item.type}</Badge>
                      <span className="text-[11px] text-slate-400 font-semibold capitalize">
                        {item.frequency}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleRecurring(item.id)}
                      className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title={item.isActive ? 'Pause rule' : 'Resume rule'}
                    >
                      {item.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-500" />}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete rule "${item.title}"?`)) {
                          deleteRecurring(item.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-expense rounded-lg hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Payment Account:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {w?.name || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {cat?.name || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Due Date:</span>
                    <span className="font-semibold text-primary">{item.nextDueDate}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Recurring Amount</span>
                <span
                  className={`text-base font-extrabold ${
                    item.type === 'income' ? 'text-income' : 'text-expense'
                  }`}
                >
                  {formatCurrency(item.amount, item.currency)}
                </span>
              </div>
            </Card>
          );
        })}
        </div>
      )}

      {/* Add Recurring Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Recurring Payment Rule"
        description="Schedule a repeat bill, subscription, or salary"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Netflix Subscription or Monthly Office Rent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Wallet
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {wallets.map((w: Wallet) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                First Due Date
              </label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="md">
              Schedule Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
