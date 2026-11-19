import React from 'react';
import { Card } from './Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface StatCardProps {
  title: string;
  amount: string;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  iconBgColor?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  subtitle,
  trend,
  icon,
  iconBgColor = 'bg-primary/10 text-primary',
  className,
}) => {
  return (
    <Card hover className={cn('relative overflow-hidden', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">
            {amount}
          </h4>
          {subtitle && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <span
                className={cn(
                  'flex items-center text-xs font-semibold px-2 py-0.5 rounded-md',
                  trend.isPositive
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                )}
              >
                {trend.isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                )}
                {trend.value}
              </span>
              <span className="text-[11px] text-slate-400">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-2xl flex items-center justify-center', iconBgColor)}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
