import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { BudgetModal } from '../components/budgets/BudgetModal';
import { formatCurrency, convertCurrency } from '../lib/currencies';
import { Budget, Category, Transaction } from '../types';
import { Plus, Edit2, Trash2, AlertTriangle, CheckCircle2, PieChart } from 'lucide-react';

export const BudgetsPage: React.FC = () => {
  const {
    budgets,
    categories,
    transactions,
    deleteBudget,
    primaryCurrency,
    exchangeRates,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);

  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  const openEdit = (b: Budget) => {
    setBudgetToEdit(b);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Budget Planner & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Stay in control of your monthly and category-wise spending limits
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setBudgetToEdit(null);
            setIsModalOpen(true);
          }}
          className="text-xs font-bold"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Set New Budget
        </Button>
      </div>

      {/* Grid of Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgets.map((b: Budget) => {
          const cat = categoryMap.get(b.categoryId);
          const spent = transactions
            .filter((t: Transaction) => t.type === 'expense' && t.categoryId === b.categoryId)
            .reduce(
              (sum: number, t: Transaction) => sum + convertCurrency(t.amount, t.currency, primaryCurrency, exchangeRates),
              0
            );

          const remaining = Math.max(0, b.amount - spent);
          const percent = Math.round((spent / b.amount) * 100);
          const isOverBudget = spent > b.amount;
          const isWarning = percent >= b.alertThreshold && !isOverBudget;

          return (
            <Card
              key={b.id}
              className="flex flex-col justify-between hover:border-primary/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat?.color || '#7657E8' }}
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {cat?.name || 'Uncategorized'}
                      </h4>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {b.period} Budget
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(b)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this budget limit?')) {
                          deleteBudget(b.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-expense rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Percentage */}
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Usage Progress</span>
                    <span
                      className={`font-extrabold ${
                        isOverBudget
                          ? 'text-expense'
                          : isWarning
                          ? 'text-warning'
                          : 'text-income'
                      }`}
                    >
                      {percent}%
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverBudget
                          ? 'bg-expense'
                          : isWarning
                          ? 'bg-warning'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Spent:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(spent, primaryCurrency)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Limit:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(b.amount, primaryCurrency)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Remaining:</span>
                  <span
                    className={`font-extrabold ${
                      remaining === 0 ? 'text-expense' : 'text-income'
                    }`}
                  >
                    {formatCurrency(remaining, primaryCurrency)}
                  </span>
                </div>

                {isOverBudget && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-expense bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl mt-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Over budget by {formatCurrency(spent - b.amount, primaryCurrency)}!</span>
                  </div>
                )}
                {isWarning && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-warning bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl mt-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Approaching limit ({percent}% reached)</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        budgetToEdit={budgetToEdit}
      />
    </div>
  );
};
