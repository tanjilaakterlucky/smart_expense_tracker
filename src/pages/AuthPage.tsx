import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthPage: React.FC = () => {
  const { loginDemoUser, isSupabaseConnected } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (!isSupabaseConnected || !supabase) {
      // Local/Demo Mode fallback
      loginDemoUser();
      navigate('/');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, primary_currency: 'BDT' },
          },
        });
        if (error) throw error;
        setMessage({ text: 'Account created! Please check your email to verify.', isError: false });
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setMessage({ text: 'Password reset link sent to your email.', isError: false });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Authentication error', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    loginDemoUser();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] dark:bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-purple-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-primary/25">
            <span className="font-black text-2xl">F</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            FINORA
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Smart Personal Finance Management System
          </p>
        </div>

        {/* Card */}
        <Card className="p-6 sm:p-8 shadow-xl">
          <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6">
            <button
              onClick={() => {
                setMode('login');
                setMessage(null);
              }}
              className={`flex-1 pb-3 text-xs font-bold transition-colors border-b-2 ${
                mode === 'login'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setMessage(null);
              }}
              className={`flex-1 pb-3 text-xs font-bold transition-colors border-b-2 ${
                mode === 'register'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Create Account
            </button>
          </div>

          {message && (
            <div
              className={`p-3 rounded-xl text-xs mb-4 ${
                message.isError
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Tanzim Ahmed"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <Button type="submit" isLoading={loading} className="w-full font-bold text-xs py-3">
              {mode === 'login' ? 'Sign In to Finora' : mode === 'register' ? 'Register Account' : 'Send Reset Link'}
            </Button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={handleDemoSignIn}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl border border-primary/30 bg-purple-50/60 dark:bg-purple-950/40 text-primary hover:bg-primary hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Instant Demo Mode (No Signup Required)</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="text-[10px] text-slate-400 mt-2">
              Pre-loaded with Bangladeshi & multi-currency demo records
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
