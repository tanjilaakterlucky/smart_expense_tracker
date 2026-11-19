import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types';
import { formatCurrency, convertCurrency } from '../../lib/currencies';
import { ArrowRight } from 'lucide-react';

export interface AddSavingsMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const AddSavingsMoneyModal: React.FC<AddSavingsMoneyModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const { wallets, addFundsToGoal, exchangeRates } = useFinance();

  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  if (!goal) return null;

  const selectedWallet = wallets.find((w) => w.id === walletId);
  const numAmount = parseFloat(amount) || 0;
  const convertedDeposit =
    selectedWallet && numAmount > 0
      ? convertCurrency(numAmount, selectedWallet.currency, goal.currency, exchangeRates)
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!walletId) {
      setError('Please select a payment wallet.');
      return;
    }
    if (numAmount <= 0) {
      setError('Please enter a valid deposit amount.');
      return;
    }
    if (selectedWallet && selectedWallet.balance < numAmount) {
      setError(`Insufficient funds in ${selectedWallet.name}.`);
      return;
    }

    addFundsToGoal(goal.id, numAmount, walletId);
    setAmount('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Savings: ${goal.title}`}
      description="Transfer funds from your wallet to this savings target"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Deposit from Wallet
          </label>
          <select
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({formatCurrency(w.balance, w.currency)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Deposit Amount ({selectedWallet?.currency})
          </label>
          <input
            type="number"
            step="any"
            required
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-lg font-bold focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        {selectedWallet && selectedWallet.currency !== goal.currency && convertedDeposit > 0 && (
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 text-xs flex items-center justify-between">
            <span>Goal Credit:</span>
            <div className="flex items-center gap-1.5 font-bold">
              <span>{formatCurrency(numAmount, selectedWallet.currency)}</span>
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="text-primary">{formatCurrency(convertedDeposit, goal.currency)}</span>
            </div>
          </div>
        )}

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
          <div className="flex justify-between text-slate-500">
            <span>Goal Target:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatCurrency(goal.targetAmount, goal.currency)}
            </span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Current Saved:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatCurrency(goal.currentAmount, goal.currency)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="md">
            Confirm Deposit
          </Button>
        </div>
      </form>
    </Modal>
  );
};
