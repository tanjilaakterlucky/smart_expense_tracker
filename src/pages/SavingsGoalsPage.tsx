import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SavingsGoalModal } from '../components/savings/SavingsGoalModal';
import { AddSavingsMoneyModal } from '../components/savings/AddSavingsMoneyModal';
import { formatCurrency } from '../lib/currencies';
import { SavingsGoal } from '../types';
import { Plus, Target, Calendar, CheckCircle2, Trophy, Coins, Edit2, Trash2 } from 'lucide-react';

export const SavingsGoalsPage: React.FC = () => {
  const { savingsGoals, deleteSavingsGoal } = useFinance();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<SavingsGoal | null>(null);
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);

  const openDeposit = (g: SavingsGoal) => {
    setDepositGoal(g);
  };

  const openEdit = (g: SavingsGoal) => {
    setGoalToEdit(g);
    setIsGoalModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Savings Goals & Targets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track and build your emergency funds, dream purchases, and vacations
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setGoalToEdit(null);
            setIsGoalModalOpen(true);
          }}
          className="text-xs font-bold"
        >
          <Plus className="w-4 h-4 mr-1.5" /> New Savings Goal
        </Button>
      </div>

      {/* Goals Grid */}
      {savingsGoals.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Target className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">No Savings Goals Set</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Create a savings target for an emergency fund, gadget, or vacation and deposit funds toward it.
          </p>
          <Button
            size="sm"
            onClick={() => {
              setGoalToEdit(null);
              setIsGoalModalOpen(true);
            }}
            className="mt-4 text-xs font-bold"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Your First Goal
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savingsGoals.map((g: SavingsGoal) => {
          const percent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
          const remaining = Math.max(0, g.targetAmount - g.currentAmount);

          return (
            <Card
              key={g.id}
              className="flex flex-col justify-between hover:border-primary/40 transition-all relative overflow-hidden"
              style={{ borderTop: `4px solid ${g.color}` }}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: g.color }}
                    >
                      {g.isCompleted ? <Trophy className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {g.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Due: {g.targetDate || 'No deadline'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(g)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete savings goal "${g.title}"?`)) {
                          deleteSavingsGoal(g.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-expense rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500">Progress</span>
                    <span className="font-extrabold text-primary">{percent}%</span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, backgroundColor: g.color }}
                    />
                  </div>
                </div>
              </div>

              {/* Amounts and Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Target Goal:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(g.targetAmount, g.currency)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Currently Saved:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(g.currentAmount, g.currency)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Remaining to Save:</span>
                  <span className="font-bold text-slate-600 dark:text-slate-300">
                    {formatCurrency(remaining, g.currency)}
                  </span>
                </div>

                {g.isCompleted ? (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Goal Achieved! 🎉
                  </div>
                ) : (
                  <Button
                    onClick={() => openDeposit(g)}
                    variant="primary"
                    size="sm"
                    className="w-full font-bold text-xs"
                  >
                    <Coins className="w-3.5 h-3.5 mr-1.5" /> Deposit Funds
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
        </div>
      )}

      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goalToEdit={goalToEdit}
      />

      <AddSavingsMoneyModal
        isOpen={Boolean(depositGoal)}
        onClose={() => setDepositGoal(null)}
        goal={depositGoal}
      />
    </div>
  );
};
