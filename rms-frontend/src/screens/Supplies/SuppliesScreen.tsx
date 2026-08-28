import React, { useState, useEffect, useCallback } from 'react';
import {
  Package, Plus, Pencil, Trash2, X, RefreshCw,
  AlertTriangle, ChevronDown, ArrowDownCircle, ArrowUpCircle,
  SlidersHorizontal, History,
} from 'lucide-react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api';
import { Supply, SupplyLog } from '../../types';

const inputBase = 'w-full bg-[#F4F2F0] border border-[#1F221D]/10 rounded-xl px-4 py-2.5 text-sm text-[#1F221D] placeholder-[#555754]/50 focus:outline-none focus:border-[#FF7A10]/50 focus:bg-white transition-all';
const labelCls = 'text-xs font-semibold text-[#555754] uppercase tracking-wider mb-1 block';
const today = () => new Date().toISOString().slice(0, 10);

const SUPPLY_CATEGORIES = ['General', 'Food', 'Beverage', 'Cleaning', 'Packaging', 'Other'];
const UNITS = ['pcs', 'kg', 'g', 'litre', 'ml', 'box', 'bag', 'bottle', 'can', 'dozen'];

const catColor = (cat: string) => {
  switch (cat) {
    case 'Food':      return 'bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20';
    case 'Beverage':  return 'bg-[#1565C0]/10 text-[#1565C0] border-[#1565C0]/20';
    case 'Cleaning':  return 'bg-[#C62828]/10 text-[#C62828] border-[#C62828]/20';
    case 'Packaging': return 'bg-[#6A1E55]/10 text-[#6A1E55] border-[#6A1E55]/20';
    case 'Other':     return 'bg-[#555754]/10 text-[#555754] border-[#1F221D]/10';
    default:          return 'bg-[#ECEAE7] text-[#555754] border-[#1F221D]/10';
  }
};

// ── Supply Form Panel ──────────────────────────────────────────────────────

interface SupplyFormValues {
  name: string; unit: string; quantity: string; min_quantity: string;
  unit_cost: string; supplier: string; category: string; notes: string; is_active: boolean;
}
const defaultForm = (): SupplyFormValues => ({
  name: '', unit: 'pcs', quantity: '0', min_quantity: '0',
  unit_cost: '', supplier: '', category: 'General', notes: '', is_active: true,
});

interface SupplyFormPanelProps {
  editSupply: Supply | null;
  onClose: () => void;
  onSaved: (s: Supply) => void;
}

const SupplyFormPanel: React.FC<SupplyFormPanelProps> = ({ editSupply, onClose, onSaved }) => {
  const addNotification = useAppStore((s) => s.addNotification);
  const [form, setForm] = useState<SupplyFormValues>(defaultForm());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm(editSupply ? {
      name: editSupply.name, unit: editSupply.unit,
      quantity: String(editSupply.quantity), min_quantity: String(editSupply.min_quantity),
      unit_cost: editSupply.unit_cost != null ? String(editSupply.unit_cost) : '',
      supplier: editSupply.supplier ?? '', category: editSupply.category,
      notes: editSupply.notes ?? '', is_active: editSupply.is_active,
    } : defaultForm());
  }, [editSupply]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { addNotification('Name is required.', 'warning'); return; }
    const payload = {
      name: form.name.trim(), unit: form.unit, category: form.category,
      quantity: parseFloat(form.quantity) || 0,
      min_quantity: parseFloat(form.min_quantity) || 0,
      unit_cost: form.unit_cost ? parseFloat(form.unit_cost) : undefined,
      supplier: form.supplier.trim() || undefined,
      notes: form.notes.trim() || undefined,
      is_active: form.is_active,
    };
    setIsSubmitting(true);
    try {
      const saved = editSupply ? await api.updateSupply(editSupply.id, payload) : await api.createSupply(payload);
      addNotification(editSupply ? `"${saved.name}" updated.` : `"${saved.name}" added.`, 'success');
      onSaved(saved); onClose();
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Operation failed.', 'error');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
      <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {editSupply ? <Pencil className="w-4 h-4 text-[#FF7A10]" /> : <Plus className="w-4 h-4 text-[#FF7A10]" />}
            <h2 className="text-sm font-semibold text-[#1F221D] uppercase tracking-wider">
              {editSupply ? 'Edit Supply' : 'Add Supply'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#555754] hover:bg-[#ECEAE7]"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div><label className={labelCls}>Name *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Cooking Oil" className={inputBase} disabled={isSubmitting} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Unit *</label>
              <div className="relative">
                <select name="unit" value={form.unit} onChange={handleChange} className={`${inputBase} appearance-none pr-7`} disabled={isSubmitting}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555754]/50 pointer-events-none" />
              </div>
            </div>
            <div><label className={labelCls}>Category *</label>
              <div className="relative">
                <select name="category" value={form.category} onChange={handleChange} className={`${inputBase} appearance-none pr-7`} disabled={isSubmitting}>
                  {SUPPLY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555754]/50 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Qty in Stock</label>
              <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="0" step="0.01" className={inputBase} disabled={isSubmitting} /></div>
            <div><label className={labelCls}>Min Qty (alert)</label>
              <input type="number" name="min_quantity" value={form.min_quantity} onChange={handleChange} min="0" step="0.01" className={inputBase} disabled={isSubmitting} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Unit Cost (PKR)</label>
              <input type="number" name="unit_cost" value={form.unit_cost} onChange={handleChange} min="0" step="0.01" placeholder="0.00" className={inputBase} disabled={isSubmitting} /></div>
            <div><label className={labelCls}>Supplier</label>
              <input type="text" name="supplier" value={form.supplier} onChange={handleChange} placeholder="Supplier name" className={inputBase} disabled={isSubmitting} /></div>
          </div>
          <div><label className={labelCls}>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className={`${inputBase} resize-none`} disabled={isSubmitting} /></div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-[#1F221D]">Active</span>
            <button type="button" onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.is_active ? 'bg-[#FF7A10]' : 'bg-[#1F221D]/20'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.is_active ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          <button type="submit" disabled={isSubmitting}
            className="mt-1 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-[#FF7A10] text-white hover:bg-[#E86000] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {isSubmitting ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</> : editSupply ? <><Pencil className="w-4 h-4" /> Save Changes</> : <><Plus className="w-4 h-4" /> Add Supply</>}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Log Modal ──────────────────────────────────────────────────────────────

interface LogModalProps {
  supply: Supply;
  onClose: () => void;
  onUpdated: (s: Supply) => void;
}

const LogModal: React.FC<LogModalProps> = ({ supply, onClose, onUpdated }) => {
  const addNotification = useAppStore((s) => s.addNotification);
  const [logs, setLogs] = useState<SupplyLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<'purchase' | 'usage' | 'adjustment'>('purchase');
  const [qty, setQty] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try { setLogs(await api.getSupplyLogs(supply.id)); }
    catch { /* silent */ }
    finally { setIsLoading(false); }
  }, [supply.id]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = parseFloat(qty);
    if (isNaN(qtyNum) || qtyNum === 0) { addNotification('Enter a non-zero quantity.', 'warning'); return; }
    setIsSubmitting(true);
    try {
      const res = await api.addSupplyLog(supply.id, {
        type, quantity: type === 'usage' ? -Math.abs(qtyNum) : Math.abs(qtyNum),
        unit_cost: unitCost ? parseFloat(unitCost) : undefined, date, notes: notes.trim() || undefined,
      });
      setLogs(prev => [res.log, ...prev]);
      onUpdated(res.supply);
      setQty(''); setUnitCost(''); setNotes('');
      addNotification('Log added.', 'success');
    } catch (err) { addNotification(err instanceof Error ? err.message : 'Failed.', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteLog = async (log: SupplyLog) => {
    setDeletingId(log.id);
    try {
      const res = await api.deleteSupplyLog(supply.id, log.id);
      setLogs(prev => prev.filter(l => l.id !== log.id));
      onUpdated(res.supply);
      addNotification('Log removed.', 'info');
    } catch (err) { addNotification(err instanceof Error ? err.message : 'Failed.', 'error'); }
    finally { setDeletingId(null); }
  };

  const typeColor = (t: string) =>
    t === 'purchase' ? 'text-[#2E7D32] bg-[#2E7D32]/10 border-[#2E7D32]/20' :
    t === 'usage'    ? 'text-[#C62828] bg-[#C62828]/10 border-[#C62828]/20' :
                       'text-[#1565C0] bg-[#1565C0]/10 border-[#1565C0]/20';

  return (
    <div className="fixed inset-0 bg-[#1F221D]/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white border border-[#1F221D]/10 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-card" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F221D]/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#FF7A10]" />
            <h3 className="text-sm font-semibold text-[#1F221D]">{supply.name} — Logs</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#555754] hover:bg-[#ECEAE7]"><X className="w-4 h-4" /></button>
        </div>

        {/* Add log form */}
        <form onSubmit={handleAddLog} className="px-5 py-4 border-b border-[#1F221D]/10 flex-shrink-0 bg-[#F4F2F0]">
          <p className="text-xs font-semibold text-[#555754] uppercase tracking-wider mb-3">Add Transaction</p>
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className={labelCls}>Type</label>
              <div className="relative">
                <select value={type} onChange={e => setType(e.target.value as typeof type)}
                  className="bg-white border border-[#1F221D]/10 rounded-xl px-3 py-2 text-xs text-[#1F221D] appearance-none pr-7 focus:outline-none">
                  <option value="purchase">Purchase (+)</option>
                  <option value="usage">Usage (-)</option>
                  <option value="adjustment">Adjustment</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#555754]/50 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Qty ({supply.unit})</label>
              <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" step="0.01"
                className="bg-white border border-[#1F221D]/10 rounded-xl px-3 py-2 text-xs text-[#1F221D] w-24 focus:outline-none focus:border-[#FF7A10]/50" />
            </div>
            <div>
              <label className={labelCls}>Unit Cost</label>
              <input type="number" value={unitCost} onChange={e => setUnitCost(e.target.value)} placeholder="PKR" step="0.01"
                className="bg-white border border-[#1F221D]/10 rounded-xl px-3 py-2 text-xs text-[#1F221D] w-28 focus:outline-none focus:border-[#FF7A10]/50" />
            </div>
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="bg-white border border-[#1F221D]/10 rounded-xl px-3 py-2 text-xs text-[#1F221D] focus:outline-none focus:border-[#FF7A10]/50" />
            </div>
            <button type="submit" disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#FF7A10] text-white hover:bg-[#E86000] transition-all disabled:opacity-40">
              {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Add
            </button>
          </div>
        </form>

        {/* Logs list */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {isLoading && <div className="flex justify-center py-6"><RefreshCw className="w-5 h-5 text-[#555754]/40 animate-spin" /></div>}
          {!isLoading && logs.length === 0 && <p className="text-sm text-center text-[#555754]/50 py-6">No transactions yet.</p>}
          {logs.map(log => (
            <div key={log.id} className="flex items-center gap-3 py-2.5 border-b border-[#1F221D]/6 last:border-0">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColor(log.type)}`}>
                {log.type === 'purchase' ? <ArrowDownCircle className="w-3.5 h-3.5" /> : log.type === 'usage' ? <ArrowUpCircle className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border capitalize ${typeColor(log.type)}`}>{log.type}</span>
                  <span className="text-sm font-semibold text-[#1F221D]">{log.quantity > 0 ? '+' : ''}{log.quantity} {supply.unit}</span>
                  {log.unit_cost != null && <span className="text-xs text-[#555754]">@ PKR {log.unit_cost}</span>}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[#555754]">{log.date}</span>
                  {log.notes && <span className="text-xs text-[#555754]/60 truncate">{log.notes}</span>}
                </div>
              </div>
              <button onClick={() => handleDeleteLog(log)} disabled={deletingId === log.id}
                className="p-1.5 rounded-lg text-[#C62828]/60 hover:text-[#C62828] hover:bg-[#C62828]/10 transition-all disabled:opacity-30">
                {deletingId === log.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Supply Card ────────────────────────────────────────────────────────────

interface SupplyCardProps {
  supply: Supply;
  onEdit: (s: Supply) => void;
  onDelete: (s: Supply) => void;
  onLogs: (s: Supply) => void;
  isDeleting: boolean;
}

const SupplyCard: React.FC<SupplyCardProps> = ({ supply, onEdit, onDelete, onLogs, isDeleting }) => (
  <div className={`bg-white border rounded-2xl p-4 flex flex-col gap-3 transition-all hover:bg-[#F4F2F0] ${supply.low_stock ? 'border-[#C62828]/30' : 'border-[#1F221D]/10'}`}>
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-[#1F221D] truncate">{supply.name}</p>
          {supply.low_stock && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#C62828] bg-[#C62828]/10 border border-[#C62828]/20 px-1.5 py-0.5 rounded-full flex-shrink-0">
              <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
            </span>
          )}
        </div>
        <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catColor(supply.category)}`}>{supply.category}</span>
      </div>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${supply.is_active ? 'bg-[#2E7D32]/10 text-[#2E7D32]' : 'bg-[#555754]/10 text-[#555754]'}`}>
        {supply.is_active ? 'Active' : 'Inactive'}
      </span>
    </div>

    <div className="grid grid-cols-2 gap-2">
      <div className="bg-[#F4F2F0] rounded-xl px-3 py-2">
        <p className="text-[10px] text-[#555754] uppercase tracking-wider">In Stock</p>
        <p className={`text-base font-semibold mt-0.5 ${supply.low_stock ? 'text-[#C62828]' : 'text-[#1F221D]'}`}>
          {supply.quantity} <span className="text-xs font-normal text-[#555754]">{supply.unit}</span>
        </p>
      </div>
      <div className="bg-[#F4F2F0] rounded-xl px-3 py-2">
        <p className="text-[10px] text-[#555754] uppercase tracking-wider">Min Level</p>
        <p className="text-base font-semibold mt-0.5 text-[#555754]">
          {supply.min_quantity} <span className="text-xs font-normal">{supply.unit}</span>
        </p>
      </div>
    </div>

    {(supply.unit_cost != null || supply.supplier) && (
      <div className="flex flex-col gap-1 text-xs text-[#555754]">
        {supply.unit_cost != null && <span>PKR {supply.unit_cost} / {supply.unit}</span>}
        {supply.supplier && <span>Supplier: {supply.supplier}</span>}
      </div>
    )}

    <div className="flex gap-1.5 mt-auto">
      <button onClick={() => onLogs(supply)}
        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold text-[#1565C0] border border-[#1565C0]/20 bg-[#1565C0]/08 hover:bg-[#1565C0]/15 transition-all">
        <History className="w-3.5 h-3.5" /> Logs
      </button>
      <button onClick={() => onEdit(supply)}
        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold text-[#FF7A10] border border-[#FF7A10]/20 bg-[#FF7A10]/08 hover:bg-[#FF7A10]/15 transition-all">
        <Pencil className="w-3.5 h-3.5" /> Edit
      </button>
      <button onClick={() => onDelete(supply)} disabled={isDeleting}
        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold text-[#C62828] border border-[#C62828]/20 bg-[#C62828]/08 hover:bg-[#C62828]/15 transition-all disabled:opacity-40">
        {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        Delete
      </button>
    </div>
  </div>
);

// ── Main Screen ────────────────────────────────────────────────────────────

export const SuppliesScreen: React.FC = () => {
  const addNotification = useAppStore((s) => s.addNotification);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [editSupply, setEditSupply] = useState<Supply | null>(null);
  const [logsSupply, setLogsSupply] = useState<Supply | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filterCat, setFilterCat] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  const loadSupplies = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getSupplies({ category: filterCat || undefined, low_stock: filterLowStock || undefined });
      setSupplies(data);
    } catch (err) { addNotification(err instanceof Error ? err.message : 'Failed to load.', 'error'); }
    finally { setIsLoading(false); }
  }, [filterCat, filterLowStock, addNotification]);

  useEffect(() => { loadSupplies(); }, [loadSupplies]);

  const handleDelete = async (supply: Supply) => {
    setDeletingId(supply.id);
    try { await api.deleteSupply(supply.id); setSupplies(prev => prev.filter(s => s.id !== supply.id)); addNotification(`"${supply.name}" deleted.`, 'info'); }
    catch (err) { addNotification(err instanceof Error ? err.message : 'Failed.', 'error'); }
    finally { setDeletingId(null); }
  };

  const handleSaved = (saved: Supply) => {
    setSupplies(prev => {
      const idx = prev.findIndex(s => s.id === saved.id);
      return idx >= 0 ? prev.map(s => s.id === saved.id ? saved : s) : [saved, ...prev];
    });
  };

  const handleUpdated = (updated: Supply) => {
    setSupplies(prev => prev.map(s => s.id === updated.id ? updated : s));
    setLogsSupply(updated);
  };

  const lowStockCount = supplies.filter(s => s.low_stock).length;

  return (
    <PageWrapper className="h-full overflow-y-auto bg-[#F4F2F0]">
      <div className="max-w-[1400px] mx-auto px-6 py-6 pb-24 md:pb-8 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF7A10]/10 border border-[#FF7A10]/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-[#FF7A10]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#1F221D]">Supplies</h1>
              <p className="text-xs text-[#555754]">{supplies.length} items{lowStockCount > 0 ? ` · ${lowStockCount} low stock` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {lowStockCount > 0 && (
              <button onClick={() => setFilterLowStock(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${filterLowStock ? 'bg-[#C62828] text-white border-[#C62828]' : 'bg-white text-[#C62828] border-[#C62828]/20 hover:bg-[#C62828]/08'}`}>
                <AlertTriangle className="w-3.5 h-3.5" /> Low Stock ({lowStockCount})
              </button>
            )}
            <div className="relative">
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                className="bg-white border border-[#1F221D]/10 rounded-xl px-3 py-2 text-xs text-[#1F221D] appearance-none pr-7 focus:outline-none">
                <option value="">All Categories</option>
                {SUPPLY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555754]/50 pointer-events-none" />
            </div>
            <button onClick={loadSupplies} disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[#555754] bg-white border border-[#1F221D]/10 hover:bg-[#ECEAE7] transition-all disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => { setEditSupply(null); setShowPanel(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#FF7A10] text-white hover:bg-[#E86000] transition-all">
              <Plus className="w-4 h-4" /> Add Supply
            </button>
          </div>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {showPanel && (
            <SupplyFormPanel editSupply={editSupply} onClose={() => { setShowPanel(false); setEditSupply(null); }} onSaved={s => { handleSaved(s); setShowPanel(false); setEditSupply(null); }} />
          )}
          <div className="flex-1 min-w-0">
            {isLoading && supplies.length === 0 && (
              <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-10 flex flex-col items-center gap-3">
                <RefreshCw className="w-7 h-7 text-[#555754]/40 animate-spin" />
                <p className="text-sm text-[#1F221D]/60">Loading supplies…</p>
              </div>
            )}
            {!isLoading && supplies.length === 0 && (
              <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#ECEAE7] flex items-center justify-center mb-1">
                  <Package className="w-7 h-7 text-[#555754]/40" />
                </div>
                <p className="text-sm text-[#1F221D]/60">No supplies found</p>
                <p className="text-xs text-[#555754]/50">Click "Add Supply" to start tracking inventory.</p>
              </div>
            )}
            {supplies.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {supplies.map(s => (
                  <SupplyCard key={s.id} supply={s}
                    onEdit={sup => { setEditSupply(sup); setShowPanel(true); }}
                    onDelete={handleDelete}
                    onLogs={setLogsSupply}
                    isDeleting={deletingId === s.id} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {logsSupply && <LogModal supply={logsSupply} onClose={() => setLogsSupply(null)} onUpdated={handleUpdated} />}
    </PageWrapper>
  );
};

export default SuppliesScreen;
