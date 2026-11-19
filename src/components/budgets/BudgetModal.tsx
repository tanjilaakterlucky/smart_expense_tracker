import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useFinance } from '../../context/FinanceContext';
import { Budget } from '../../types';

export interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetToEdit?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  budgetToEdit,
}) => {
  const { categories, budgets, addBudget, updateBudget, primaryCurrency } = useFinance();

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const [categoryId, setCategoryId] = useState(
    budgetToEdit?.categoryId || expenseCategories[0]?.id || ''
  );
  const [amount, setAmount] = useState(budgetToEdit ? String(budgetToEdit.amount) : '');
  const [period, setPeriod] = useState<'monthly' | 'weekly'>(budgetToEdit?.period || 'monthly');
  const [alertThreshold, setAlertThreshold] = useState(budgetToEdit?.alertThreshold || 80);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive budget amount.');
      return;
    }

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    // Check if category already has budget
    if (!budgetToEdit) {
      const existing = budgets.find((b) => b.categoryId === categoryId);
      if (existing) {
        setError('This category already has an active budget. Please edit it instead.');
        return;
      }
    }

    if (budgetToEdit) {
      updateBudget(budgetToEdit.id, {
        categoryId,
        amount: numAmount,
        period,
        alertThreshold,
      });
    } else {
      addBudget({
        categoryId,
        amount: numAmount,
        period,
        alertThreshold,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budgetToEdit ? 'Edit Budget' : 'Set Category Budget'}
      description={`Set spending limits in your primary currency (${primaryCurrency})`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Budget Limit ({primaryCurrency})
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="e.g. 10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-bold focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'monthly' | 'weekly')}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Alert Warning Threshold
            </label>
            <span className="text-xs font-bold text-primary">{alertThreshold}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
            className="w-full accent-primary h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            You will be notified when spending reaches {alertThreshold}% of this budget.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="md">
            {budgetToEdit ? 'Save Changes' : 'Create Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
