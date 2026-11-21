import React, { createContext, useContext, useEffect, useState } from 'react';
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
  // Default to null so new or unauthenticated users always land on Login / Sign Up first!
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = storage.get<UserProfile | null>('user_profile', null);
    // If it was previous auto-seeded demo user, do not auto-login; show Auth screen first
    if (saved && !saved.isDemoUser) {
      return saved;
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const { isConfigured } = getSupabaseCredentials();

  useEffect(() => {
    if (isConfigured && supabase) {
      // Check existing Supabase session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const activeUser: UserProfile = {
            id: session.user.id,
            email: session.user.email || 'user@finora.io',
            fullName: meta.full_name || 'Finora User',
            avatarUrl: meta.avatar_url,
            phone: meta.phone || '',
            country: meta.country || 'Bangladesh',
            timezone: meta.timezone || 'Asia/Dhaka',
            primaryCurrency: (meta.primary_currency as any) || 'BDT',
            theme: 'light',
            role: 'user',
            isDemoUser: false,
            createdAt: session.user.created_at,
          };
          setUser(activeUser);
          storage.set('user_profile', activeUser);
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const activeUser: UserProfile = {
            id: session.user.id,
            email: session.user.email || 'user@finora.io',
            fullName: meta.full_name || 'Finora User',
            avatarUrl: meta.avatar_url,
            phone: meta.phone || '',
            country: meta.country || 'Bangladesh',
            timezone: meta.timezone || 'Asia/Dhaka',
            primaryCurrency: (meta.primary_currency as any) || 'BDT',
            theme: 'light',
            role: 'user',
            isDemoUser: false,
            createdAt: session.user.created_at,
          };
          setUser(activeUser);
          storage.set('user_profile', activeUser);
        } else if (_event === 'SIGNED_OUT') {
          setUser(null);
          storage.set('user_profile', null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, [isConfigured]);

  const loginDemoUser = () => {
    const demoUser = { ...INITIAL_USER, isDemoUser: true };
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
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      storage.set('user_profile', updated);
      return updated;
    });

    if (supabase && isConfigured && user && !user.isDemoUser) {
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: updates.fullName ?? user.fullName,
            phone: updates.phone ?? user.phone,
            country: updates.country ?? user.country,
            timezone: updates.timezone ?? user.timezone,
            primary_currency: updates.primaryCurrency ?? user.primaryCurrency,
          },
        });
        await supabase
          .from('profiles')
          .update({
            full_name: updates.fullName,
            phone: updates.phone,
            country: updates.country,
            timezone: updates.timezone,
            primary_currency: updates.primaryCurrency,
          })
          .eq('id', user.id);
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
