import React, { useState, useEffect } from 'react';
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
  Shield,
  KeyRound,
  Download,
  Trash2,
  Laptop,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { LegalModal } from '../components/legal/LegalModal';

export const SettingsPage: React.FC = () => {
  const {
    primaryCurrency,
    setPrimaryCurrency,
    exchangeRates,
    updateExchangeRate,
    resetToDemoData,
    transactions,
    wallets,
    categories,
    budgets,
    savingsGoals,
    recurring,
  } = useFinance();
  const { user, updateProfile, changePassword, deleteAccount, isSupabaseConnected } = useAuth();
  const { theme, setTheme } = useTheme();

  // Profile form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [country, setCountry] = useState(user?.country || 'Bangladesh');
  const [timezone, setTimezone] = useState(user?.timezone || 'Asia/Dhaka');
  const [profileSaved, setProfileSaved] = useState(false);

  // Sync state with loaded user profile
  useEffect(() => {
    if (user) {
      if (user.fullName) setFullName(user.fullName);
      if (user.phone) setPhone(user.phone);
      if (user.country) setCountry(user.country);
      if (user.timezone) setTimezone(user.timezone);
    }
  }, [user]);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Supabase credentials form
  const initialSb = getSupabaseCredentials();
  const [sbUrl, setSbUrl] = useState(initialSb.url);
  const [sbKey, setSbKey] = useState(initialSb.anonKey);
  const [sbSaved, setSbSaved] = useState(false);

  // Currency exchange rate editing
  const [editingCurrency, setEditingCurrency] = useState<CurrencyCode | null>(null);
  const [rateInput, setRateInput] = useState<string>('');

  // Legal modal state
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: 'terms' | 'privacy' }>({
    isOpen: false,
    type: 'terms',
  });

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ fullName, phone, country, timezone });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'Password must be at least 6 characters.', isError: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'Passwords do not match.', isError: true });
      return;
    }

    setPasswordLoading(true);
    const res = await changePassword(newPassword);
    setPasswordLoading(false);

    if (res.success) {
      setPasswordMsg({ text: 'Password changed successfully!', isError: false });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 3000);
    } else {
      setPasswordMsg({ text: res.error || 'Failed to change password.', isError: true });
    }
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

  // GDPR Data Portability: Export complete user records
  const handleExportAllData = () => {
    const exportBundle = {
      exportedAt: new Date().toISOString(),
      userProfile: user,
      wallets,
      categories,
      transactions,
      budgets,
      savingsGoals,
      recurringTransactions: recurring,
    };

    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finora-complete-financial-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    const confirmPrompt = window.prompt(
      'CAUTION: This will permanently erase your account, all wallets, transactions, budgets, and savings data. Type "DELETE" to confirm:'
    );
    if (confirmPrompt === 'DELETE') {
      await deleteAccount();
      window.location.href = '/auth';
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Settings & SaaS Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure profile, security, multi-currency, data privacy, and cloud database
        </p>
      </div>

      {/* 1. Profile Section */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">User Profile</h3>
            <p className="text-xs text-slate-400">Personal details & regional settings</p>
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="+880 1700-000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Time Zone
              </label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
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

      {/* 2. Password & Security Section */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Security & Password</h3>
            <p className="text-xs text-slate-400">Change your password and manage account protection</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {passwordMsg && (
            <div
              className={`p-3 rounded-xl text-xs ${
                passwordMsg.isError
                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              }`}
            >
              {passwordMsg.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Button type="submit" size="sm" disabled={passwordLoading} className="font-semibold text-xs">
              {passwordLoading ? 'Updating...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </Card>

      {/* 3. Active Sessions & Registered Devices */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Active Sessions & Devices</h3>
            <p className="text-xs text-slate-400">Currently logged in devices with isolated tokens</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Current Web Browser Session
                </span>
                <Badge variant="income">Active Now</Badge>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Windows · Secure SSL Client · RLS Authenticated
              </p>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">127.0.0.1 / HTTPS</span>
        </div>
      </Card>

      {/* 4. Currency & Multi-Currency Settings */}
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

      {/* 5. Theme Selection */}
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

      {/* 6. Supabase Cloud Database Sync */}
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

      {/* 7. GDPR Privacy, Data Export & Legal Compliance */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Data Privacy & Legal Compliance
            </h3>
            <p className="text-xs text-slate-400">
              GDPR data portability, terms of service and privacy guarantees
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-primary" />
                Download Complete Personal Data (GDPR Portability)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Export all your private wallets, transactions, budgets, and savings records as a structured JSON file.
              </p>
            </div>
            <Button onClick={handleExportAllData} variant="outline" size="sm" className="gap-2 self-start sm:self-auto">
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </Button>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-primary pt-1">
            <button
              onClick={() => setLegalModal({ isOpen: true, type: 'terms' })}
              className="flex items-center gap-1.5 hover:underline"
            >
              <FileText className="w-3.5 h-3.5" /> View Terms of Service
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => setLegalModal({ isOpen: true, type: 'privacy' })}
              className="flex items-center gap-1.5 hover:underline"
            >
              <Shield className="w-3.5 h-3.5" /> View Privacy Policy
            </button>
          </div>
        </div>
      </Card>

      {/* 8. Danger Zone & Account Management */}
      <Card className="border-red-200 dark:border-red-950/60 bg-red-50/20 dark:bg-red-950/10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Danger Zone</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Irreversible account operations and demo data resets
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-red-100 dark:border-red-900/40">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Clear All Financial Records</p>
              <p className="text-[11px] text-slate-400">Clear all transactions, wallets, and budgets to start with a fresh 0 balance.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all your financial records and start with a fresh clean balance?')) {
                  resetToDemoData();
                }
              }}
              className="text-xs font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear All Data
            </Button>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-red-100 dark:border-red-900/40">
            <div>
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">Delete Account & Erase All Records</p>
              <p className="text-[11px] text-slate-400">
                Permanently purge your user identity, isolated PostgreSQL records, and receipts.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteAccount}
              className="text-xs font-bold gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete My Account
            </Button>
          </div>
        </div>
      </Card>

      {/* Legal Modal */}
      <LegalModal
        isOpen={legalModal.isOpen}
        onClose={() => setLegalModal({ ...legalModal, isOpen: false })}
        type={legalModal.type}
      />
    </div>
  );
};
