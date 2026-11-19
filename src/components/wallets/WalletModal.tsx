import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useFinance } from '../../context/FinanceContext';
import { Wallet, WalletType, CurrencyCode } from '../../types';
import { SUPPORTED_CURRENCIES } from '../../lib/currencies';

export interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletToEdit?: Wallet | null;
}

const WALLET_TYPES: { type: WalletType; label: string }[] = [
  { type: 'cash', label: 'Cash in Hand' },
  { type: 'bank', label: 'Bank Account' },
  { type: 'bkash', label: 'bKash Mobile Wallet' },
  { type: 'nagad', label: 'Nagad Mobile Wallet' },
  { type: 'rocket', label: 'Rocket DBBL' },
  { type: 'paypal', label: 'PayPal' },
  { type: 'other', label: 'Other Account' },
];

const PRESET_COLORS = [
  '#7657E8', // FINORA Purple
  '#16A36A', // Green
  '#E2136E', // bKash Pink
  '#F7931E', // Nagad Orange
  '#003087', // Bank / PayPal Blue
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#64748B', // Slate
];

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  walletToEdit,
}) => {
  const { addWallet, updateWallet, primaryCurrency } = useFinance();

  const [name, setName] = useState(walletToEdit?.name || '');
  const [type, setType] = useState<WalletType>(walletToEdit?.type || 'bank');
  const [balance, setBalance] = useState(walletToEdit ? String(walletToEdit.balance) : '0');
  const [currency, setCurrency] = useState<CurrencyCode>(walletToEdit?.currency || primaryCurrency);
  const [accountNumber, setAccountNumber] = useState(walletToEdit?.accountNumber || '');
  const [color, setColor] = useState(walletToEdit?.color || '#7657E8');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a wallet name.');
      return;
    }

    const numBalance = parseFloat(balance);
    if (isNaN(numBalance)) {
      setError('Please provide a valid numeric balance.');
      return;
    }

    if (walletToEdit) {
      updateWallet(walletToEdit.id, {
        name: name.trim(),
        type,
        balance: numBalance,
        currency,
        accountNumber: accountNumber.trim() || undefined,
        color,
      });
    } else {
      addWallet({
        name: name.trim(),
        type,
        balance: numBalance,
        currency,
        accountNumber: accountNumber.trim() || undefined,
        color,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={walletToEdit ? 'Edit Wallet' : 'Create New Wallet'}
      description="Manage cash, bank accounts, and mobile wallets"
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
            Wallet / Account Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. City Bank Savings or bKash Personal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Account Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as WalletType)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {WALLET_TYPES.map((wt) => (
                <option key={wt.type} value={wt.type}>
                  {wt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Balance
            </label>
            <input
              type="number"
              step="any"
              required
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Account / Phone Number (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. **** 4321 or 017..."
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Card Accent Color
          </label>
          <div className="flex items-center gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-offset-2 ring-primary' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="md">
            {walletToEdit ? 'Save Changes' : 'Create Wallet'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
