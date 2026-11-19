import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal, CurrencyCode } from '../../types';
import { SUPPORTED_CURRENCIES } from '../../lib/currencies';

export interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: SavingsGoal | null;
}

const PRESET_GOAL_COLORS = ['#7657E8', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
}) => {
  const { addSavingsGoal, updateSavingsGoal, primaryCurrency } = useFinance();

  const [title, setTitle] = useState(goalToEdit?.title || '');
  const [targetAmount, setTargetAmount] = useState(goalToEdit ? String(goalToEdit.targetAmount) : '');
  const [currentAmount, setCurrentAmount] = useState(goalToEdit ? String(goalToEdit.currentAmount) : '0');
  const [currency, setCurrency] = useState<CurrencyCode>(goalToEdit?.currency || primaryCurrency);
  const [targetDate, setTargetDate] = useState(
    goalToEdit?.targetDate ||
      new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [color, setColor] = useState(goalToEdit?.color || '#7657E8');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a goal name.');
      return;
    }

    const numTarget = parseFloat(targetAmount);
    const numCurrent = parseFloat(currentAmount) || 0;

    if (isNaN(numTarget) || numTarget <= 0) {
      setError('Please enter a valid target amount.');
      return;
    }

    if (goalToEdit) {
      updateSavingsGoal(goalToEdit.id, {
        title: title.trim(),
        targetAmount: numTarget,
        currentAmount: numCurrent,
        currency,
        targetDate,
        color,
        isCompleted: numCurrent >= numTarget,
      });
    } else {
      addSavingsGoal({
        title: title.trim(),
        targetAmount: numTarget,
        currentAmount: numCurrent,
        currency,
        targetDate,
        color,
        isCompleted: numCurrent >= numTarget,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? 'Edit Savings Target' : 'Create Savings Goal'}
      description="Plan for emergencies, gadgets, tours, or long-term dreams"
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
            Goal Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g. MacBook Pro M-Series or Emergency Fund"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Amount
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="0.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Initial Savings
            </label>
            <input
              type="number"
              step="any"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Deadline
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Goal Accent Color
          </label>
          <div className="flex items-center gap-2">
            {PRESET_GOAL_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-offset-2 ring-primary' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="md">
            {goalToEdit ? 'Save Changes' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
