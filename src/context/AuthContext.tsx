import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile } from '../types';
import { INITIAL_USER, storage } from '../lib/storage';
import { supabase, getSupabaseCredentials } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginDemoUser: () => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to stored user if not demo, otherwise null so login page is shown
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = storage.get<UserProfile | null>('user_profile', null);
    if (saved && !saved.isDemoUser) {
      return saved;
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const { isConfigured } = getSupabaseCredentials();

  // Helper to fetch and construct profile from Supabase Auth + profiles table
  const fetchAndConstructUserProfile = useCallback(async (sessionUser: any): Promise<UserProfile> => {
    const meta = sessionUser.user_metadata || {};
    let fullName = (meta.full_name || meta.name || '').trim();
    let avatarUrl = meta.avatar_url || meta.picture || '';
    let phone = meta.phone || '';
    let country = meta.country || 'Bangladesh';
    let timezone = meta.timezone || 'Asia/Dhaka';
    let primaryCurrency = (meta.primary_currency as any) || 'BDT';

    // Fetch latest profile from PostgreSQL public.profiles table
    if (supabase && isConfigured) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .maybeSingle();

        if (!error && profile) {
          if (profile.full_name && profile.full_name.trim() !== '') {
            fullName = profile.full_name.trim();
          }
          if (profile.avatar_url) avatarUrl = profile.avatar_url;
          if (profile.phone) phone = profile.phone;
          if (profile.country) country = profile.country;
          if (profile.timezone) timezone = profile.timezone;
          if (profile.primary_currency) primaryCurrency = profile.primary_currency;
        }
      } catch (e) {
        console.warn('Could not query profiles table, using auth metadata:', e);
      }
    }

    // Fallback to "User" if name is unavailable or empty (Requirement 6)
    if (!fullName || fullName.trim() === '') {
      fullName = 'User';
    }

    const constructed: UserProfile = {
      id: sessionUser.id,
      email: sessionUser.email || 'user@finora.io',
      fullName,
      avatarUrl,
      phone,
      country,
      timezone,
      primaryCurrency,
      theme: 'light',
      role: 'user',
      isDemoUser: false,
      createdAt: sessionUser.created_at,
    };

    return constructed;
  }, [isConfigured]);

  useEffect(() => {
    let isMounted = true;

    if (isConfigured && supabase) {
      // 1. Check existing session on load
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!isMounted) return;
        if (session?.user) {
          const profile = await fetchAndConstructUserProfile(session.user);
          if (isMounted) {
            setUser(profile);
            storage.set('user_profile', profile);
          }
        }
        if (isMounted) setLoading(false);
      }).catch(() => {
        if (isMounted) setLoading(false);
      });

      // 2. Listen to Auth State Changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          const profile = await fetchAndConstructUserProfile(session.user);
          if (isMounted) {
            setUser(profile);
            storage.set('user_profile', profile);
          }
        } else if (_event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null);
            storage.set('user_profile', null);
          }
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, [isConfigured, fetchAndConstructUserProfile]);

  const loginDemoUser = () => {
    const demoUser = { ...INITIAL_USER, fullName: 'User', isDemoUser: true };
    setUser(demoUser);
    storage.set('user_profile', demoUser);
  };

  const logout = async () => {
    if (supabase && isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Logout error:', e);
      }
    }
    setUser(null);
    storage.set('user_profile', null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const newName = (updates.fullName !== undefined ? updates.fullName : user?.fullName) || 'User';

    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates, fullName: newName };
      storage.set('user_profile', updated);
      return updated;
    });

    if (supabase && isConfigured && user && !user.isDemoUser) {
      try {
        // 1. Update Supabase Auth user metadata
        const { error: authErr } = await supabase.auth.updateUser({
          data: {
            full_name: newName,
            phone: updates.phone ?? user.phone,
            country: updates.country ?? user.country,
            timezone: updates.timezone ?? user.timezone,
            primary_currency: updates.primaryCurrency ?? user.primaryCurrency,
          },
        });
        if (authErr) console.warn('Supabase auth metadata update warning:', authErr);

        // 2. Permanently update public.profiles table (upsert ensures row exists)
        const { error: dbErr } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            full_name: newName,
            phone: updates.phone ?? user.phone,
            country: updates.country ?? user.country,
            timezone: updates.timezone ?? user.timezone,
            primary_currency: updates.primaryCurrency ?? user.primaryCurrency,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });

        if (dbErr) console.error('Supabase profiles table upsert error:', dbErr);
      } catch (e) {
        console.error('Failed to sync profile update with Supabase:', e);
      }
    }
  };

  const changePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }
    if (supabase && isConfigured && user && !user.isDemoUser) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    }
    return { success: true };
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (supabase && isConfigured && user && !user.isDemoUser) {
      try {
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'account_delete_requested',
        });
        await supabase.auth.signOut();
      } catch (e: any) {
        console.error('Error deleting account:', e);
      }
    }
    storage.clear();
    setUser(null);
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginDemoUser,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
        isSupabaseConnected: isConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
