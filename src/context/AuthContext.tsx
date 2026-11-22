import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile } from '../types';
import { storage } from '../lib/storage';
import { supabase, getSupabaseCredentials } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  isSupabaseConnected: boolean;
  registerLocal: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginLocal: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Check if user has an active session in local storage
    const saved = storage.get<UserProfile | null>('user_profile', null);
    return saved;
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

    if (!fullName || fullName.trim() === '') {
      fullName = 'User';
    }

    const constructed: UserProfile = {
      id: sessionUser.id,
      email: sessionUser.email || '',
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
        } else {
          // If Supabase is connected but has no active session, clear local user
          if (isMounted && user && !user.id.startsWith('local_')) {
            setUser(null);
            storage.set('user_profile', null);
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

  // Local Registration (One Email = One Account) when cloud DB is offline
  const registerLocal = async (fullName: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const registeredUsers = storage.get<Record<string, { fullName: string; passwordHash: string; createdAt: string }>>('registered_users', {});

    if (registeredUsers[trimmedEmail]) {
      return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
    }

    // Save new user
    registeredUsers[trimmedEmail] = {
      fullName: fullName.trim() || 'User',
      passwordHash: password, // In offline client mode
      createdAt: new Date().toISOString(),
    };
    storage.set('registered_users', registeredUsers);

    const newUser: UserProfile = {
      id: `local_${Date.now()}`,
      email: trimmedEmail,
      fullName: fullName.trim() || 'User',
      primaryCurrency: 'BDT',
      theme: 'light',
      role: 'user',
      isDemoUser: false,
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    storage.set('user_profile', newUser);
    return { success: true };
  };

  // Local Login when cloud DB is offline
  const loginLocal = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const registeredUsers = storage.get<Record<string, { fullName: string; passwordHash: string; createdAt: string }>>('registered_users', {});

    const existing = registeredUsers[trimmedEmail];
    if (!existing) {
      // Allow first-time login/register convenience if none registered yet
      const newUser: UserProfile = {
        id: `local_${Date.now()}`,
        email: trimmedEmail,
        fullName: 'User',
        primaryCurrency: 'BDT',
        theme: 'light',
        role: 'user',
        isDemoUser: false,
        createdAt: new Date().toISOString(),
      };
      registeredUsers[trimmedEmail] = {
        fullName: 'User',
        passwordHash: password,
        createdAt: new Date().toISOString(),
      };
      storage.set('registered_users', registeredUsers);
      setUser(newUser);
      storage.set('user_profile', newUser);
      return { success: true };
    }

    if (existing.passwordHash !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const loggedInUser: UserProfile = {
      id: `local_${Date.now()}`,
      email: trimmedEmail,
      fullName: existing.fullName || 'User',
      primaryCurrency: 'BDT',
      theme: 'light',
      role: 'user',
      isDemoUser: false,
      createdAt: existing.createdAt,
    };

    setUser(loggedInUser);
    storage.set('user_profile', loggedInUser);
    return { success: true };
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

    if (supabase && isConfigured && user) {
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: newName,
            phone: updates.phone ?? user.phone,
            country: updates.country ?? user.country,
            timezone: updates.timezone ?? user.timezone,
            primary_currency: updates.primaryCurrency ?? user.primaryCurrency,
          },
        });

        await supabase
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
      } catch (e) {
        console.error('Failed to sync profile update with Supabase:', e);
      }
    }
  };

  const changePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }
    if (supabase && isConfigured && user) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    }
    return { success: true };
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (supabase && isConfigured && user) {
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
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
        isSupabaseConnected: isConfigured,
        registerLocal,
        loginLocal,
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
