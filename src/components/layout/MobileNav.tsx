import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PlusCircle,
  Wallet,
  Settings,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { TransactionModal } from '../transactions/TransactionModal';

export const MobileNav: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navs = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'History', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Add', isAction: true },
    { name: 'Wallets', path: '/wallets', icon: Wallet },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 lg:hidden px-3 py-2 flex items-center justify-around">
        {navs.map((item, idx) => {
          if (item.isAction) {
            return (
              <button
                key="action-add"
                onClick={() => setIsModalOpen(true)}
                className="flex flex-col items-center justify-center -mt-6 p-2 rounded-full bg-primary text-white shadow-lg shadow-primary/40 hover:scale-105 active:scale-95 transition-transform"
              >
                <PlusCircle className="w-9 h-9" />
              </button>
            );
          }

          const Icon = item.icon!;
          return (
            <NavLink
              key={item.path}
              to={item.path!}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 text-[11px] font-medium transition-colors px-2 py-1',
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
