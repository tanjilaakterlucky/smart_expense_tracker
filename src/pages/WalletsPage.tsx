import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { WalletModal } from '../components/wallets/WalletModal';
import { WalletTransferModal } from '../components/wallets/WalletTransferModal';
import { formatCurrency, convertCurrency } from '../lib/currencies';
import { Wallet, Transaction } from '../types';
import {
  Plus,
  ArrowLeftRight,
  Edit2,
  Trash2,
  CreditCard,
  Building2,
  Smartphone,
  Banknote,
} from 'lucide-react';

export const WalletsPage: React.FC = () => {
  const {
    wallets,
    transactions,
    deleteWallet,
    primaryCurrency,
    exchangeRates,
  } = useFinance();

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletToEdit, setWalletToEdit] = useState<Wallet | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferFromId, setTransferFromId] = useState<string>('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>(wallets[0]?.id || '');

  const openEdit = (wallet: Wallet) => {
    setWalletToEdit(wallet);
    setIsWalletModalOpen(true);
  };

  const openTransfer = (walletId: string) => {
    setTransferFromId(walletId);
    setIsTransferModalOpen(true);
  };

  const getWalletIcon = (type: Wallet['type']) => {
    switch (type) {
      case 'bank':
        return <Building2 className="w-5 h-5" />;
      case 'bkash':
      case 'nagad':
      case 'rocket':
        return <Smartphone className="w-5 h-5" />;
      case 'cash':
        return <Banknote className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const selectedWallet = wallets.find((w: Wallet) => w.id === selectedWalletId);
  const walletTransactions = transactions.filter(
    (t: Transaction) => t.walletId === selectedWalletId || t.toWalletId === selectedWalletId
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Wallet Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cash in hand, bank accounts, bKash, Nagad, and global cards
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTransferFromId(wallets[0]?.id || '');
              setIsTransferModalOpen(true);
            }}
            className="text-xs font-semibold"
          >
            <ArrowLeftRight className="w-4 h-4 mr-1.5" /> Transfer Funds
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setWalletToEdit(null);
              setIsWalletModalOpen(true);
            }}
            className="text-xs font-bold"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Wallet
          </Button>
        </div>
      </div>

      {/* Grid of All Wallets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {wallets.map((w: Wallet) => {
          const converted = convertCurrency(w.balance, w.currency, primaryCurrency, exchangeRates);
          const isSelected = selectedWalletId === w.id;

          return (
            <Card
              key={w.id}
              onClick={() => setSelectedWalletId(w.id)}
              className={`cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'ring-2 ring-primary border-primary dark:border-primary shadow-fintech-lg'
                  : 'hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              style={{ borderTop: `4px solid ${w.color}` }}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2.5 rounded-xl text-white shadow-sm"
                      style={{ backgroundColor: w.color }}
                    >
                      {getWalletIcon(w.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {w.name}
                      </h4>
                      <Badge variant="neutral" className="mt-0.5 text-[10px] uppercase font-semibold">
                        {w.type}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        openEdit(w);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit Wallet"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {wallets.length > 1 && (
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete wallet "${w.name}"?`)) {
                            deleteWallet(w.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-expense rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete Wallet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {w.accountNumber && (
                  <p className="text-xs text-slate-400 font-mono mt-3">
                    Account: {w.accountNumber}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
                    Available Balance
                  </span>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(w.balance, w.currency)}
                  </p>
                  {w.currency !== primaryCurrency && (
                    <p className="text-xs text-slate-400">
                      ≈ {formatCurrency(converted, primaryCurrency)}
                    </p>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    openTransfer(w.id);
                  }}
                  className="text-xs h-8 px-2.5"
                >
                  <ArrowLeftRight className="w-3 h-3 mr-1" /> Transfer
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selected Wallet History */}
      {selectedWallet && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Activity History for <span className="text-primary">{selectedWallet.name}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Filtered records involving this specific account
              </p>
            </div>
            <Badge variant="primary">
              {walletTransactions.length} Record(s)
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {walletTransactions.length > 0 ? (
                  walletTransactions.map((tx: Transaction) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 text-slate-500 whitespace-nowrap">{tx.date}</td>
                      <td className="py-3">
                        <Badge variant={tx.type as any}>{tx.type}</Badge>
                      </td>
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {tx.description}
                      </td>
                      <td className="py-3 text-right font-bold whitespace-nowrap">
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No transactions recorded for this wallet yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        walletToEdit={walletToEdit}
      />

      <WalletTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        defaultFromWalletId={transferFromId}
      />
    </div>
  );
};
