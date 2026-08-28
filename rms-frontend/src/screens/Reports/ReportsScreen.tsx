import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart2, DollarSign,
  RefreshCw, Plus, Pencil, Trash2, X, ChevronDown,
  Calendar, Receipt, Filter,
} from 'lucide-react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api';
import { Expense } from '../../types';

// ─── Shared utils ─────────────────────────────────────────────────────────────

const inputBase =
  'bg-[#F4F2F0] border border-[#1F221D]/10 rounded-xl px-3 py-2 text-sm text-[#1F221D] focus:outline-none focus:border-[#FF7A10]/50 focus:bg-white transition-all duration-200';

const labelCls =
  'text-xs font-semibold text-[#555754] uppercase tracking-wider mb-1 block';

const formatPKR = (val: number) =>
  'PKR ' + val.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

const defaultFrom = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return toDateStr(d);
};

const defaultTo = () => toDateStr(new Date());

type TabId = 'expenses';

// ─── Category badge ───────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Rent:       'bg-[#1565C0]/10 text-[#1565C0] border-[#1565C0]/20',
  Utilities:  'bg-[#FF7A10]/10 text-[#FF7A10] border-[#FF7A10]/20',
  Salaries:   'bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20',
  Supplies:   'bg-[#6A1E55]/10 text-[#6A1E55] border-[#6A1E55]/20',
  Other:      'bg-[#555754]/10 text-[#555754] border-[#1F221D]/10',
  General:    'bg-[#ECEAE7] text-[#555754] border-[#1F221D]/10',
};

const categoryBadge = (cat: string) => {
  const base = 'text-[10px] font-bold px-2 py-0.5 rounded-full border';
  return `${base} ${CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.General}`;
};

const EXPENSE_CATEGORIES = ['General', 'Rent', 'Utilities', 'Salaries', 'Supplies', 'Other'];

// ─── Expense Form Panel ───────────────────────────────────────────────────────

interface ExpenseFormValues {
  title: string;
  category: string;
  amount: string;
  date: string;
  notes: string;
}

const defaultExpForm = (): ExpenseFormValues => ({
  title: '', category: 'General', amount: '', date: toDateStr(new Date()), notes: '',
});

interface ExpenseFormPanelProps {
  editExpense: Expense | null;
  onClose: () => void;
  onSaved: () => void;
}

const ExpenseFormPanel: React.FC<ExpenseFormPanelProps> = ({ editExpense, onClose, onSaved }) => {
  const addNotification = useAppStore((s) => s.addNotification);
  const [form, setForm] = useState<ExpenseFormValues>(defaultExpForm());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editExpense) {
      setForm({
        title: editExpense.title,
        category: editExpense.category,
        amount: String(editExpense.amount),
        date: editExpense.date,
        notes: editExpense.notes ?? '',
      });
    } else {
      setForm(defaultExpForm());
    }
  }, [editExpense]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { addNotification('Title is required.', 'warning'); return; }
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) < 0) {
      addNotification('Please enter a valid amount.', 'warning');
      return;
    }
    const payload = {
      title: form.title.trim(),
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      notes: form.notes.trim() || undefined,
    };
    setIsSubmitting(true);
    try {
      if (editExpense) {
        await api.updateExpense(editExpense.id, payload);
        addNotification('Expense updated.', 'success');
      } else {
        await api.createExpense(payload);
        addNotification('Expense added.', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Operation failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
      <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {editExpense ? <Pencil className="w-4 h-4 text-[#FF7A10]" /> : <Plus className="w-4 h-4 text-[#FF7A10]" />}
            <h2 className="text-sm font-semibold text-[#1F221D] uppercase tracking-wider">
              {editExpense ? 'Edit Expense' : 'Add Expense'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#555754] hover:text-[#1F221D] hover:bg-[#ECEAE7] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>Title <span className="text-[#C62828]">*</span></label>
            <input type="text" name="title" value={form.title} onChange={handleChange}
              placeholder="e.g. Monthly Rent" className={`w-full ${inputBase}`} disabled={isSubmitting} />
          </div>
          <div>
            <label className={labelCls}>Category <span className="text-[#C62828]">*</span></label>
            <div className="relative">
              <select name="category" value={form.category} onChange={handleChange}
                className={`w-full ${inputBase} appearance-none pr-8`} disabled={isSubmitting}>
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555754]/50 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Amount (PKR) <span className="text-[#C62828]">*</span></label>
            <input type="number" name="amount" value={form.amount} onChange={handleChange}
              placeholder="0" min="0" step="0.01" className={`w-full ${inputBase}`} disabled={isSubmitting} />
          </div>
          <div>
            <label className={labelCls}>Date <span className="text-[#C62828]">*</span></label>
            <input type="date" name="date" value={form.date} onChange={handleChange}
              className={`w-full ${inputBase}`} disabled={isSubmitting} />
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              placeholder="Optional notes…" rows={2}
              className={`w-full ${inputBase} resize-none`} disabled={isSubmitting} />
          </div>
          <button type="submit" disabled={isSubmitting}
            className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-[#FF7A10] text-white hover:bg-[#E86000] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {isSubmitting
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</>
              : editExpense
                ? <><Pencil className="w-4 h-4" /> Save Changes</>
                : <><Plus className="w-4 h-4" /> Add Expense</>}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Expenses Tab ─────────────────────────────────────────────────────────────

const ExpensesTab: React.FC = () => {
  const addNotification = useAppStore((s) => s.addNotification);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [category, setCategory] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getExpenses({
        from: from || undefined,
        to: to || undefined,
        category: category || undefined,
      });
      setExpenses(data);
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Failed to load expenses.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [from, to, category, addNotification]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const openAdd = () => { setEditExpense(null); setShowPanel(true); };
  const openEdit = (exp: Expense) => { setEditExpense(exp); setShowPanel(true); };
  const closePanel = () => { setShowPanel(false); setEditExpense(null); };

  const handleDelete = async (exp: Expense) => {
    setDeletingId(exp.id);
    try {
      await api.deleteExpense(exp.id);
      addNotification('Expense deleted.', 'info');
      fetchExpenses();
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Failed to delete.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      {/* Header + Controls */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#C62828]/10 border border-[#C62828]/20 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-4 h-4 text-[#C62828]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1F221D]">Expenses</p>
            <p className="text-xs text-[#555754]">{expenses.length} record{expenses.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex items-center">
            <Calendar className="absolute left-3 w-3.5 h-3.5 text-[#555754]/50 pointer-events-none" />
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className={`${inputBase} pl-9 text-xs`} />
          </div>
          <span className="text-xs text-[#555754]">to</span>
          <div className="relative flex items-center">
            <Calendar className="absolute left-3 w-3.5 h-3.5 text-[#555754]/50 pointer-events-none" />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className={`${inputBase} pl-9 text-xs`} />
          </div>
          <div className="relative flex items-center">
            <Filter className="absolute left-3 w-3.5 h-3.5 text-[#555754]/50 pointer-events-none" />
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className={`${inputBase} text-xs appearance-none pl-9 pr-7 min-w-[140px]`}>
              <option value="">All Categories</option>
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2 w-3.5 h-3.5 text-[#555754]/50 pointer-events-none" />
          </div>
          <button onClick={fetchExpenses} disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#555754] border border-[#1F221D]/10 bg-white hover:bg-[#ECEAE7] transition-all active:scale-95 disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#FF7A10] text-white hover:bg-[#E86000] active:scale-[0.98] transition-all">
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {showPanel && (
          <ExpenseFormPanel editExpense={editExpense} onClose={closePanel} onSaved={fetchExpenses} />
        )}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-10 flex flex-col items-center gap-3">
              <RefreshCw className="w-7 h-7 text-[#555754]/40 animate-spin" />
              <p className="text-sm font-semibold text-[#1F221D]/60">Loading expenses…</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#ECEAE7] border border-[#1F221D]/10 flex items-center justify-center mb-1">
                <DollarSign className="w-7 h-7 text-[#555754]/40" />
              </div>
              <p className="text-sm font-semibold text-[#1F221D]/60">No expenses found</p>
              <p className="text-xs text-[#555754]/50">Add your first expense record above.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#1F221D]/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1F221D]/10 bg-[#F4F2F0]">
                      <th className="text-left text-xs font-semibold text-[#555754] uppercase tracking-wider px-4 py-3">Title</th>
                      <th className="text-left text-xs font-semibold text-[#555754] uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Category</th>
                      <th className="text-left text-xs font-semibold text-[#555754] uppercase tracking-wider px-4 py-3 hidden md:table-cell">Date</th>
                      <th className="text-right text-xs font-semibold text-[#555754] uppercase tracking-wider px-4 py-3">Amount</th>
                      <th className="text-left text-xs font-semibold text-[#555754] uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Notes</th>
                      <th className="text-right text-xs font-semibold text-[#555754] uppercase tracking-wider px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F221D]/6">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-[#F4F2F0] transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-medium text-[#1F221D] text-sm">{exp.title}</span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={categoryBadge(exp.category)}>{exp.category}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#555754] hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                            {exp.date}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-semibold text-[#C62828]">{formatPKR(exp.amount)}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#555754] hidden lg:table-cell max-w-[200px] truncate">
                          {exp.notes ?? <span className="text-[#555754]/40">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEdit(exp)}
                              className="p-1.5 rounded-lg text-[#FF7A10] bg-[#FF7A10]/10 border border-[#FF7A10]/20 hover:bg-[#FF7A10]/20 transition-all">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(exp)} disabled={deletingId === exp.id}
                              className="p-1.5 rounded-lg text-[#C62828] bg-[#C62828]/10 border border-[#C62828]/20 hover:bg-[#C62828]/20 transition-all disabled:opacity-40">
                              {deletingId === exp.id
                                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Summary */}
              <div className="border-t border-[#1F221D]/10 bg-[#F4F2F0] px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#555754]" />
                  <span className="text-xs font-semibold text-[#555754]">
                    Total Records: <span className="text-[#1F221D]">{expenses.length}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#555754]">Total Expenses:</span>
                  <span className="text-sm font-bold text-[#C62828]">{formatPKR(total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── ReportsScreen ────────────────────────────────────────────────────────────

export const ReportsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('expenses');

  const tabs: { id: TabId; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { id: 'expenses',  label: 'Expenses',  icon: DollarSign },
  ];

  return (
    <PageWrapper className="h-full overflow-y-auto bg-[#F4F2F0]">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FF7A10]/10 border border-[#FF7A10]/20 flex items-center justify-center flex-shrink-0">
            <BarChart2 className="w-5 h-5 text-[#FF7A10]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1F221D]">Reports</h1>
            <p className="text-xs text-[#555754]">Expense tracking and monthly summaries</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                  isActive
                    ? 'bg-[#FF7A10] text-white shadow-sm'
                    : 'bg-white text-[#555754] border border-[#1F221D]/10 hover:bg-[#ECEAE7]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'expenses' && <ExpensesTab />}
      </div>
    </PageWrapper>
  );
};

export default ReportsScreen;
