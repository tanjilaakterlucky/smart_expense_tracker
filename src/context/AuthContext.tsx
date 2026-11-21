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
  const [user, setUser] = useState<UserProfile | null>(() => {
    return storage.get<UserProfile>('user_profile', INITIAL_USER);
  });
  const [loading, setLoading] = useState<boolean>(true);
  const { isConfigured } = getSupabaseCredentials();

  useEffect(() => {
    if (isConfigured && supabase) {
      // Check existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          setUser({
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
          });
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          setUser({
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
          });
        } else if (_event === 'SIGNED_OUT') {
          setUser(null);
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
    setUser(INITIAL_USER);
    storage.set('user_profile', INITIAL_USER);
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
    // Demo mode success simulation
    return { success: true };
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (supabase && isConfigured && user && !user.isDemoUser) {
      try {
        // Log audit log before removal
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'account_delete_requested',
        });
        // Call Supabase RPC or sign out
        await supabase.auth.signOut();
      } catch (e: any) {
        console.error('Error deleting account:', e);
      }
    }
    // Clear local storage and state
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
