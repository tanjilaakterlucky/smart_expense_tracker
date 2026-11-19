import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AppNotification } from '../types';
import {
  Bell,
  AlertTriangle,
  Trophy,
  Repeat,
  ShieldAlert,
  CheckCircle,
  Trash2,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead, clearAllNotifications } = useFinance();

  const getIcon = (type: string) => {
    switch (type) {
      case 'budget_alert':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'goal_reached':
        return <Trophy className="w-5 h-5 text-emerald-500" />;
      case 'recurring_reminder':
        return <Repeat className="w-5 h-5 text-primary" />;
      case 'security':
        return <ShieldAlert className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Notifications & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time notifications, budget thresholds, and goal achievements
          </p>
        </div>

        {notifications.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllNotifications}
            className="text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1 text-slate-400" /> Clear All
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((n: AppNotification) => (
            <Card
              key={n.id}
              onClick={() => markNotificationAsRead(n.id)}
              className={`p-4 transition-all cursor-pointer flex items-start gap-4 ${
                !n.isRead
                  ? 'border-l-4 border-l-primary bg-purple-50/20 dark:bg-purple-950/20'
                  : 'opacity-80'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {n.message}
                </p>
              </div>

              {!n.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 self-center" />
              )}
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center text-slate-400">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-40 text-emerald-500" />
            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              You are all caught up!
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              No new alerts or pending reminders at this moment.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
