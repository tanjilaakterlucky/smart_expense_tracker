import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet as WalletIcon,
  PieChart,
  Target,
  BarChart3,
  Repeat,
  Bell,
  Settings,
  Tags,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { notifications } = useFinance();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Wallets', path: '/wallets', icon: WalletIcon },
    { name: 'Categories', path: '/categories', icon: Tags },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Savings Goals', path: '/savings', icon: Target },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { name: 'Recurring', path: '/recurring', icon: Repeat },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Admin Panel', path: '/admin', icon: ShieldAlert },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-100 dark:border-slate-800/80">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white shadow-lg shadow-primary/25">
            <span className="font-black text-xl tracking-tight">F</span>
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight leading-none">
              FINORA
            </h1>
            <span className="text-[10px] uppercase font-bold text-primary tracking-widest mt-1 block">
              Smart Finance
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group',
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          'w-5 h-5 transition-transform group-hover:scale-110',
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'
                        )}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && item.badge > 0 ? (
                      <span
                        className={cn(
                          'px-2 py-0.5 text-xs rounded-full font-bold',
                          isActive
                            ? 'bg-white text-primary'
                            : 'bg-primary text-white'
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Security Badge */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Bank-Grade RLS</p>
              <p className="text-[11px] text-slate-400">Encrypted & Private</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
