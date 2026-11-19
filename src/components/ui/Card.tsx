import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover = false, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-fintech transition-all duration-200',
        hover && 'hover:shadow-fintech-lg hover:border-primary/30 dark:hover:border-primary/40',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
