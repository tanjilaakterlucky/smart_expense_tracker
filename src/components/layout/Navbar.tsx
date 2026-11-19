import React, { useState } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Plus,
  Globe,
  Bell,
  ArrowRightLeft,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SUPPORTED_CURRENCIES } from '../../lib/currencies';
import { CurrencyCode } from '../../types';
import { Button } from '../ui/Button';
import { TransactionModal } from '../transactions/TransactionModal';
import { Link } from 'react-router-dom';

export const Navbar: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { primaryCurrency, setPrimaryCurrency, notifications } = useFinance();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <header className="sticky top-0 z-30 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8">
        {/* Left Side: Mobile Menu + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:block">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Welcome back, <span className="text-primary">{user?.fullName || 'User'}</span>
            </h2>
            <p className="text-xs text-slate-400">Manage your wealth & track expenses</p>
          </div>
        </div>

        {/* Right Side: Currency Selector, Theme Toggle, Notifications, Quick Add */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Currency Switcher */}
          <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-200/60 dark:border-slate-700">
            <Globe className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <select
              value={primaryCurrency}
              onChange={(e) => setPrimaryCurrency(e.target.value as CurrencyCode)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                <option key={c.code} value={c.code} className="dark:bg-slate-900">
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Light / Dark mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications Link */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-expense animate-pulse ring-2 ring-white dark:ring-slate-900" />
            )}
          </Link>

          {/* Quick Add Button */}
          <Button
            onClick={() => setIsTxModalOpen(true)}
            size="sm"
            className="shadow-sm font-semibold"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </header>

      {/* Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
      />
    </>
  );
};
