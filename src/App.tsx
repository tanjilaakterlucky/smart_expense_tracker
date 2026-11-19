import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { Layout } from './components/layout/Layout';

import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { WalletsPage } from './pages/WalletsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { SavingsGoalsPage } from './pages/SavingsGoalsPage';
import { ReportsPage } from './pages/ReportsPage';
import { RecurringPage } from './pages/RecurringPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';

// Simple route guard to allow both demo users and authenticated users
const ProtectedRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F7FB] dark:bg-[#0F172A]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If no user exists, redirect to auth/demo entry
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Layout />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Route */}
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected App Routes */}
              <Route element={<ProtectedRoutes />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/wallets" element={<WalletsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/budgets" element={<BudgetsPage />} />
                <Route path="/savings" element={<SavingsGoalsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/recurring" element={<RecurringPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Catch all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
