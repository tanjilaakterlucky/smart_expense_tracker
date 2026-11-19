import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { INITIAL_USER, storage } from '../lib/storage';
import { supabase, getSupabaseCredentials } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginDemoUser: () => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
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
          setUser({
            id: session.user.id,
            email: session.user.email || 'user@finora.io',
            fullName: session.user.user_metadata?.full_name || 'Finora User',
            avatarUrl: session.user.user_metadata?.avatar_url,
            primaryCurrency: (session.user.user_metadata?.primary_currency as any) || 'BDT',
            theme: 'light',
            isDemoUser: false,
            createdAt: session.user.created_at,
          });
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || 'user@finora.io',
            fullName: session.user.user_metadata?.full_name || 'Finora User',
            avatarUrl: session.user.user_metadata?.avatar_url,
            primaryCurrency: (session.user.user_metadata?.primary_currency as any) || 'BDT',
            theme: 'light',
            isDemoUser: false,
            createdAt: session.user.created_at,
          });
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
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    storage.set('user_profile', null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      storage.set('user_profile', updated);
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginDemoUser,
        logout,
        updateProfile,
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
