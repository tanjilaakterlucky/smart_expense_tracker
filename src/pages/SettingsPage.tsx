import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SUPPORTED_CURRENCIES } from '../lib/currencies';
import { CurrencyCode, Currency } from '../types';
import {
  saveSupabaseCredentials,
  getSupabaseCredentials,
} from '../lib/supabase';
import {
  User,
  Globe,
  Moon,
  Sun,
  Database,
  RotateCcw,
  Check,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    primaryCurrency,
    setPrimaryCurrency,
    exchangeRates,
    updateExchangeRate,
    resetToDemoData,
  } = useFinance();
  const { user, updateProfile, isSupabaseConnected } = useAuth();
  const { theme, setTheme } = useTheme();

  // Profile form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Supabase credentials form
  const initialSb = getSupabaseCredentials();
  const [sbUrl, setSbUrl] = useState(initialSb.url);
  const [sbKey, setSbKey] = useState(initialSb.anonKey);
  const [sbSaved, setSbSaved] = useState(false);

  // Currency exchange rate editing
  const [editingCurrency, setEditingCurrency] = useState<CurrencyCode | null>(null);
  const [rateInput, setRateInput] = useState<string>('');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ fullName });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleSupabaseSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(sbUrl, sbKey);
    setSbSaved(true);
    setTimeout(() => {
      setSbSaved(false);
      window.location.reload();
    }, 1500);
  };

  const handleSaveRate = (code: CurrencyCode) => {
    const num = parseFloat(rateInput);
    if (!isNaN(num) && num > 0) {
      updateExchangeRate(code, num);
      setEditingCurrency(null);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure profile, primary currency, exchange rates, themes, and database
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">User Profile</h3>
            <p className="text-xs text-slate-400">Personal details & display preferences</p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'user@finora.io'}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Button type="submit" size="sm" className="font-semibold text-xs">
              {profileSaved ? (
                <>
                  <Check className="w-4 h-4 mr-1 text-emerald-400" /> Saved!
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Currency & Multi-Currency Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-primary">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Multi-Currency Configuration
            </h3>
            <p className="text-xs text-slate-400">
              Primary base currency and live USD exchange rates
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Default Primary Currency
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.values(SUPPORTED_CURRENCIES) as Currency[]).map((c: Currency) => {
              const isSelected = primaryCurrency === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setPrimaryCurrency(c.code)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary font-bold ring-2 ring-primary shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold">{c.code}</span>
                    <span className="text-sm">{c.symbol}</span>
                  </div>
                  <span className="text-[11px] block truncate opacity-75 mt-0.5">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Exchange Rates Table */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
            Exchange Rates (Relative to 1.00 USD)
          </h4>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Currency</th>
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3 text-right">Rate against $1 USD</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(Object.values(SUPPORTED_CURRENCIES) as Currency[]).map((c: Currency) => {
                  const currentRate = exchangeRates[c.code] ?? c.rateAgainstUSD;
                  const isEditing = editingCurrency === c.code;

                  return (
                    <tr key={c.code} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {c.name} ({c.code})
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{c.symbol}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        {isEditing ? (
                          <input
                            type="number"
                            step="any"
                            value={rateInput}
                            onChange={(e) => setRateInput(e.target.value)}
                            className="w-24 px-2 py-0.5 border border-primary rounded text-right bg-white dark:bg-slate-900 focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          `${currentRate.toFixed(2)} ${c.code}`
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleSaveRate(c.code)}
                              className="px-2 py-0.5 bg-primary text-white text-[11px] font-bold rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCurrency(null)}
                              className="px-2 py-0.5 text-slate-400 text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingCurrency(c.code);
                              setRateInput(String(currentRate));
                            }}
                            className="text-primary hover:underline text-[11px] font-semibold"
                          >
                            Edit Rate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Theme Selection */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Theme & Appearance</h3>
            <p className="text-xs text-slate-400">Choose your preferred visual styling</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
              theme === 'light'
                ? 'border-primary ring-2 ring-primary bg-purple-50/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sun className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-bold text-sm">Light Mode</p>
                <p className="text-xs text-slate-400">Clean #F6F7FB background</p>
              </div>
            </div>
            {theme === 'light' && <Check className="w-5 h-5 text-primary" />}
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
              theme === 'dark'
                ? 'border-primary ring-2 ring-primary bg-purple-950/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-bold text-sm">Dark Mode</p>
                <p className="text-xs text-slate-400">Deep slate fintech contrast</p>
              </div>
            </div>
            {theme === 'dark' && <Check className="w-5 h-5 text-primary" />}
          </button>
        </div>
      </Card>

      {/* Supabase Cloud Database Sync */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Supabase Cloud Database
              </h3>
              <p className="text-xs text-slate-400">Connect your PostgreSQL backend & Auth</p>
            </div>
          </div>

          <Badge variant={isSupabaseConnected ? 'income' : 'warning'}>
            {isSupabaseConnected ? 'Connected' : 'Offline / Local Demo Mode'}
          </Badge>
        </div>

        <form onSubmit={handleSupabaseSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={sbUrl}
              onChange={(e) => setSbUrl(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supabase Anon Public API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={sbKey}
              onChange={(e) => setSbKey(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              Database schema is located in <code className="text-primary font-mono">src/supabase/schema.sql</code>
            </span>
            <Button type="submit" size="sm" className="text-xs font-bold">
              {sbSaved ? 'Saved! Reloading...' : 'Save Credentials'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Danger Zone / Demo Data */}
      <Card className="border-red-200 dark:border-red-950/60 bg-red-50/20 dark:bg-red-950/10">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Reset Demo Financial Data
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Restore default wallets (City Bank, bKash, PayPal), sample budgets, and transactions
            </p>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (window.confirm('Reset all financial records back to initial sample demo data?')) {
                resetToDemoData();
              }
            }}
            className="text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Data
          </Button>
        </div>
      </Card>
    </div>
  );
};
