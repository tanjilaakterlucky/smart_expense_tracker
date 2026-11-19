import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, convertCurrency } from '../../lib/currencies';
import { ArrowRight } from 'lucide-react';

export interface WalletTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFromWalletId?: string;
}

export const WalletTransferModal: React.FC<WalletTransferModalProps> = ({
  isOpen,
  onClose,
  defaultFromWalletId,
}) => {
  const { wallets, transferWalletFunds, exchangeRates } = useFinance();

  const [fromWalletId, setFromWalletId] = useState(defaultFromWalletId || wallets[0]?.id || '');
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Wallet to Wallet Transfer');
  const [error, setError] = useState('');

  const fromWallet = wallets.find((w) => w.id === fromWalletId);
  const toWallet = wallets.find((w) => w.id === toWalletId);

  const numAmount = parseFloat(amount) || 0;
  const convertedTarget =
    fromWallet && toWallet && numAmount > 0
      ? convertCurrency(numAmount, fromWallet.currency, toWallet.currency, exchangeRates)
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fromWalletId || !toWalletId) {
      setError('Please select both wallets.');
      return;
    }
    if (fromWalletId === toWalletId) {
      setError('Source and Destination wallets must be different.');
      return;
    }
    if (numAmount <= 0) {
      setError('Please enter a valid positive transfer amount.');
      return;
    }
    if (fromWallet && fromWallet.balance < numAmount) {
      setError(`Insufficient balance. ${fromWallet.name} has only ${formatCurrency(fromWallet.balance, fromWallet.currency)}.`);
      return;
    }

    transferWalletFunds(fromWalletId, toWalletId, numAmount, description);
    setAmount('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Between Wallets"
      description="Instant transfer with automatic multi-currency conversion"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              From Wallet (Source)
            </label>
            <select
              value={fromWalletId}
              onChange={(e) => setFromWalletId(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
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
              To Wallet (Destination)
            </label>
            <select
              value={toWalletId}
              onChange={(e) => setToWalletId(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {wallets
                .filter((w) => w.id !== fromWalletId)
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatCurrency(w.balance, w.currency)})
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Transfer Amount ({fromWallet?.currency})
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

        {/* Live conversion preview if currencies differ */}
        {fromWallet && toWallet && fromWallet.currency !== toWallet.currency && convertedTarget !== null && (
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 flex items-center justify-between">
            <span className="font-medium">Estimated Credit:</span>
            <div className="flex items-center gap-1.5 font-bold">
              <span>{formatCurrency(numAmount, fromWallet.currency)}</span>
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="text-primary">{formatCurrency(convertedTarget, toWallet.currency)}</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Note / Reason
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="md">
            Execute Transfer
          </Button>
        </div>
      </form>
    </Modal>
  );
};
