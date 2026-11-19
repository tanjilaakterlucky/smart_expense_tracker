import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useFinance } from '../../context/FinanceContext';
import { TransactionType, CurrencyCode } from '../../types';
import { SUPPORTED_CURRENCIES, formatCurrency } from '../../lib/currencies';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Calendar, FileText, Tag, Wallet as WalletIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'expense',
}) => {
  const { wallets, categories, addTransaction, primaryCurrency } = useFinance();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyCode>(primaryCurrency);
  const [walletId, setWalletId] = useState<string>('');
  const [toWalletId, setToWalletId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id);
      setCurrency(wallets[0].currency);
    }
  }, [wallets, walletId]);

  useEffect(() => {
    setType(defaultType);
  }, [defaultType]);

  // When wallet selection changes, auto-match currency
  const handleWalletChange = (wId: string) => {
    setWalletId(wId);
    const selected = wallets.find((w) => w.id === wId);
    if (selected) {
      setCurrency(selected.currency);
    }
  };

  const filteredCategories = categories.filter((c) =>
    type === 'transfer' ? false : c.type === type
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    if (!walletId) {
      setError('Please select a payment wallet.');
      return;
    }

    if (type === 'transfer') {
      if (!toWalletId) {
        setError('Please select a destination wallet.');
        return;
      }
      if (walletId === toWalletId) {
        setError('Source and Destination wallets cannot be the same.');
        return;
      }
    } else {
      if (!categoryId && filteredCategories.length > 0) {
        setError('Please choose a category.');
        return;
      }
    }

    // Check balance if expense
    const sourceWallet = wallets.find((w) => w.id === walletId);
    if (type !== 'income' && sourceWallet && sourceWallet.balance < numAmount) {
      // allow, but warn if necessary
    }

    addTransaction({
      type,
      amount: numAmount,
      currency,
      walletId,
      toWalletId: type === 'transfer' ? toWalletId : undefined,
      categoryId: type === 'transfer' ? '' : categoryId || (filteredCategories[0]?.id ?? ''),
      date,
      description: description.trim() || (type === 'transfer' ? 'Wallet Transfer' : `${type.toUpperCase()} Record`),
    });

    // Reset & close
    setAmount('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Transaction"
      description="Add an income, expense, or wallet-to-wallet transfer"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategoryId('');
            }}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all',
              type === 'expense'
                ? 'bg-white dark:bg-slate-900 text-expense shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            )}
          >
            <ArrowUpRight className="w-4 h-4" />
            Expense
          </button>

          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategoryId('');
            }}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all',
              type === 'income'
                ? 'bg-white dark:bg-slate-900 text-income shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            )}
          >
            <ArrowDownLeft className="w-4 h-4" />
            Income
          </button>

          <button
            type="button"
            onClick={() => {
              setType('transfer');
              setCategoryId('');
            }}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all',
              type === 'transfer'
                ? 'bg-white dark:bg-slate-900 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            )}
          >
            <ArrowLeftRight className="w-4 h-4" />
            Transfer
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Amount & Currency */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Amount
          </label>
          <div className="relative flex rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 px-3 py-3 border-r border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                <option key={c.code} value={c.code} className="dark:bg-slate-900">
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
            <input
              type="number"
              step="any"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-lg focus:outline-none placeholder-slate-300 dark:placeholder-slate-600"
            />
          </div>
        </div>

        {/* Source Wallet */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            {type === 'transfer' ? 'From Wallet' : 'Wallet / Account'}
          </label>
          <div className="relative">
            <select
              value={walletId}
              onChange={(e) => handleWalletChange(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id} className="dark:bg-slate-900">
                  {w.name} ({formatCurrency(w.balance, w.currency)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Destination Wallet for Transfer */}
        {type === 'transfer' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              To Wallet (Destination)
            </label>
            <select
              value={toWalletId}
              onChange={(e) => setToWalletId(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Destination Wallet</option>
              {wallets
                .filter((w) => w.id !== walletId)
                .map((w) => (
                  <option key={w.id} value={w.id} className="dark:bg-slate-900">
                    {w.name} ({formatCurrency(w.balance, w.currency)})
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Category (if not transfer) */}
        {type !== 'transfer' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
              {filteredCategories.map((c) => {
                const isSelected = categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(c.id)}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-xl text-xs font-medium border text-left transition-all',
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    )}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Date & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description / Note
            </label>
            <input
              type="text"
              placeholder="e.g. Dinner, Client fee, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={type === 'income' ? 'success' : type === 'expense' ? 'danger' : 'primary'}
            size="md"
            className="px-6 font-bold"
          >
            Save Transaction
          </Button>
        </div>
      </form>
    </Modal>
  );
};
