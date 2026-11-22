import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Mail, Lock, User, ArrowRight, Check, AlertCircle, Eye, EyeOff, ServerOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LegalModal } from '../components/legal/LegalModal';

export const AuthPage: React.FC = () => {
  const { updateProfile, isSupabaseConnected } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Legal modal state
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: 'terms' | 'privacy' }>({
    isOpen: false,
    type: 'terms',
  });

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500' };
      case 2:
        return { score: 50, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' };
      case 3:
        return { score: 75, label: 'Good', color: 'bg-blue-500', text: 'text-blue-500' };
      case 4:
        return { score: 100, label: 'Strong & Secure', color: 'bg-emerald-500', text: 'text-emerald-500' };
      default:
        return { score: 15, label: 'Very Weak', color: 'bg-rose-400', text: 'text-rose-400' };
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!isSupabaseConnected || !supabase) {
      setMessage({
        text: 'Authentication service is not configured. Please contact the administrator.',
        isError: true,
      });
      return;
    }

    // Validation checks
    if (mode === 'register') {
      if (!fullName.trim()) {
        setMessage({ text: 'Please enter your full name.', isError: true });
        return;
      }
      if (password.length < 6) {
        setMessage({ text: 'Password must be at least 6 characters long.', isError: true });
        return;
      }
      if (password !== confirmPassword) {
        setMessage({ text: 'Passwords do not match.', isError: true });
        return;
      }
      if (!agreeTerms) {
        setMessage({ text: 'You must agree to the Terms and Privacy Policy to register.', isError: true });
        return;
      }
    }

    setLoading(true);

    const trimmedName = fullName.trim() || 'User';

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else if (mode === 'register') {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: trimmedName, name: trimmedName, primary_currency: 'BDT' },
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) {
          // Friendly message for duplicate email
          if (
            error.message.toLowerCase().includes('already registered') ||
            error.message.toLowerCase().includes('already in use') ||
            error.message.toLowerCase().includes('user already') ||
            error.message.toLowerCase().includes('email address is already')
          ) {
            setMessage({
              text: 'An account with this email already exists. Please sign in instead.',
              isError: true,
            });
            setLoading(false);
            return;
          }
          throw error;
        }

        // Upsert directly to profiles table to guarantee instant database persistence
        if (data.user) {
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email: email,
              full_name: trimmedName,
              primary_currency: 'BDT',
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });
          } catch (upsertErr) {
            console.warn('Could not pre-populate profile row:', upsertErr);
          }
        }

        if (data.session) {
          // Email confirmation disabled — user is logged in immediately
          await updateProfile({ fullName: trimmedName });
          navigate('/');
        } else {
          // Email confirmation required
          setMessage({
            text: `✅ Account created for ${trimmedName}! Check your email (${email}) and click the verification link before signing in.`,
            isError: false,
          });
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/settings`,
        });
        if (error) throw error;
        setMessage({ text: '✅ Password reset link sent! Check your email inbox.', isError: false });
      }
    } catch (err: any) {
      // Map common Supabase errors to friendly messages
      let errText = err.message || 'Authentication error occurred';
      if (errText.toLowerCase().includes('invalid login credentials')) {
        errText = 'Incorrect email or password. Please try again.';
      } else if (errText.toLowerCase().includes('email not confirmed')) {
        errText = 'Please verify your email before signing in. Check your inbox.';
      }
      setMessage({ text: errText, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConnected || !supabase) {
      setMessage({
        text: 'Authentication service is not configured. Please contact the administrator.',
        isError: true,
      });
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setMessage({ text: err.message || 'Google Sign-in failed', isError: true });
      setLoading(false);
    }
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
            Smart Personal Finance & Multi-Tenant Wealth Management
          </p>
        </div>

        {/* Not configured warning */}
        {!isSupabaseConnected && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <ServerOff className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Database Not Configured</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                Authentication is unavailable. Please contact the administrator to configure the backend.
              </p>
            </div>
          </div>
        )}

        {/* Card */}
        <Card className="p-6 sm:p-8 shadow-xl">
          <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6">
            <button
              onClick={() => {
                setMode('login');
                setMessage(null);
              }}
              className={`flex-1 pb-3 text-xs font-bold transition-colors border-b-2 ${mode === 'login'
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
              className={`flex-1 pb-3 text-xs font-bold transition-colors border-b-2 ${mode === 'register'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              Create Account
            </button>
            <button
              onClick={() => {
                setMode('forgot');
                setMessage(null);
              }}
              className={`flex-1 pb-3 text-xs font-bold transition-colors border-b-2 ${mode === 'forgot'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              Reset
            </button>
          </div>

          {/* Social Google Login Button */}
          {mode !== 'forgot' && (
            <div className="space-y-4 mb-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || !isSupabaseConnected}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                <span className="bg-white dark:bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold absolute">
                  or email
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${message.isError
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}
              >
                {message.isError ? (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <Check className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator (Register mode) */}
                {mode === 'register' && password && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Password strength:</span>
                      <span className={`font-bold ${passwordStrength.text}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            )}

            {/* Terms and Privacy Acceptance */}
            {mode === 'register' && (
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setLegalModal({ isOpen: true, type: 'terms' })}
                    className="text-primary font-semibold hover:underline"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => setLegalModal({ isOpen: true, type: 'privacy' })}
                    className="text-primary font-semibold hover:underline"
                  >
                    Privacy Policy
                  </button>
                  .
                </label>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center gap-2 mt-2"
              disabled={loading || !isSupabaseConnected}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'register' && 'Create Account'}
                    {mode === 'forgot' && 'Send Reset Email'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Security badge footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>PostgreSQL Row Level Security (RLS) · 100% Data Isolation</span>
        </div>
      </div>

      {/* Terms & Privacy Modal */}
      <LegalModal
        isOpen={legalModal.isOpen}
        onClose={() => setLegalModal({ ...legalModal, isOpen: false })}
        type={legalModal.type}
      />
    </div>
  );
};
