import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Category } from '../types';
import { Plus, Trash2, Tags, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const CATEGORY_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6'
];

export const CategoriesPage: React.FC = () => {
  const { categories, addCategory, deleteCategory } = useFinance();

  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [color, setColor] = useState('#7657E8');
  const [error, setError] = useState('');

  const filteredCategories = categories.filter((c: Category) => c.type === activeTab);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name cannot be empty.');
      return;
    }
    addCategory({
      name: name.trim(),
      type,
      color,
      icon: 'Tag',
      isDefault: false,
    });
    setName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Category Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize and classify income streams and expense categories
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setType(activeTab);
            setIsModalOpen(true);
          }}
          className="text-xs font-bold"
        >
          <Plus className="w-4 h-4 mr-1.5" /> New Category
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'expense'
              ? 'bg-white dark:bg-slate-900 text-expense shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" /> Expense Categories
        </button>

        <button
          onClick={() => setActiveTab('income')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'income'
              ? 'bg-white dark:bg-slate-900 text-income shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" /> Income Streams
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map((c: Category) => (
          <Card key={c.id} className="p-4 flex items-center justify-between hover:border-primary/40">
            <div className="flex items-center gap-3">
              <span
                className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: c.color }}
              />
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                {c.name}
              </span>
            </div>

            {!c.isDefault && (
              <button
                onClick={() => {
                  if (window.confirm(`Delete category "${c.name}"?`)) {
                    deleteCategory(c.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-expense rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </Card>
        ))}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Category"
        description="Create a custom category for expense or income"
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-xs text-expense">{error}</p>}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Subscriptions, Freelance, Gym"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'income' | 'expense')}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Color Accent
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setColor(col)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === col ? 'scale-125 ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="md">
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
