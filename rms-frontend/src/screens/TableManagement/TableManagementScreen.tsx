import React, { useState, useEffect, useCallback } from 'react';
import { useTableStore } from '../../store/useTableStore';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Table } from '../../types';
import {
  LayoutGrid, Plus, Trash2, RefreshCw, Users,
  ChevronDown, ChevronUp, X,
} from 'lucide-react';

// ── Predefined sections + allow custom ─────────────────────────
const PREDEFINED_SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

// ── Add Table Form ──────────────────────────────────────────────
interface AddTableFormProps {
  onSaved: () => void;
  onClose: () => void;
  existingSections: string[];
}

const AddTableForm: React.FC<AddTableFormProps> = ({ onSaved, onClose, existingSections }) => {
  const addNotification = useAppStore((s) => s.addNotification);
  const [sectionSelect, setSectionSelect] = useState('A');
  const [sectionCustom, setSectionCustom] = useState('');
  const [seats, setSeats] = useState('4');
  const [count, setCount] = useState('1'); // how many tables to add at once
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allSections = [...new Set([...PREDEFINED_SECTIONS, ...existingSections])].sort();

  const resolvedSection = sectionSelect === 'custom'
    ? sectionCustom.trim().toUpperCase()
    : sectionSelect;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedSection) {
      addNotification('Please enter a zone/section.', 'warning');
      return;
    }
    const seatsNum = parseInt(seats);
    const countNum = parseInt(count);
    if (isNaN(seatsNum) || seatsNum < 1) {
      addNotification('Enter a valid number of seats.', 'warning');
      return;
    }
    if (isNaN(countNum) || countNum < 1 || countNum > 20) {
      addNotification('Create between 1 and 20 tables at once.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      for (let i = 0; i < countNum; i++) {
        await api.createTable({ seats: seatsNum, section: resolvedSection, status: 'available' });
      }
      addNotification(
        `${countNum} table${countNum > 1 ? 's' : ''} added to Zone ${resolvedSection}.`,
        'success'
      );
      onSaved();
      onClose();
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Failed to create table.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = 'w-full bg-[#F4F2F0] border border-[#1F221D]/12 rounded-xl px-4 py-2.5 text-sm text-[#1F221D] focus:outline-none focus:border-[#FF7A10]/50 focus:bg-white transition-all';

  return (
    <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#FF7A10]" />
          <h2 className="text-sm font-semibold text-[#1F221D] uppercase tracking-wider">Add Tables</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-[#555754] hover:text-[#1F221D] hover:bg-[#F4F2F0] transition-all cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Zone / Section */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[#555754] uppercase tracking-wider font-medium">Zone / Section</label>
          <select
            value={sectionSelect}
            onChange={(e) => setSectionSelect(e.target.value)}
            disabled={isSubmitting}
            className={inputCls}
          >
            {allSections.map((s) => (
              <option key={s} value={s}>Zone {s}</option>
            ))}
            <option value="custom">New Zone (custom…)</option>
          </select>
          {sectionSelect === 'custom' && (
            <input
              type="text"
              value={sectionCustom}
              onChange={(e) => setSectionCustom(e.target.value.toUpperCase().slice(0, 10))}
              placeholder="e.g. G or VIP"
              className={inputCls}
              disabled={isSubmitting}
              maxLength={10}
            />
          )}
        </div>

        {/* Seats */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[#555754] uppercase tracking-wider font-medium">Seats per Table</label>
          <select
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            disabled={isSubmitting}
            className={inputCls}
          >
            {[1,2,3,4,5,6,7,8,10,12].map((n) => (
              <option key={n} value={n}>{n} seats</option>
            ))}
          </select>
        </div>

        {/* How many tables */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[#555754] uppercase tracking-wider font-medium">Number of Tables to Add</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            min={1}
            max={20}
            disabled={isSubmitting}
            className={inputCls}
          />
          <p className="text-[11px] text-[#555754]/60">Creates multiple tables at once in the same zone.</p>
        </div>

        {/* Summary */}
        {resolvedSection && (
          <div className="bg-[#FF7A10]/06 border border-[#FF7A10]/15 rounded-xl px-4 py-3">
            <p className="text-xs text-[#555754]">
              Will create <span className="font-semibold text-[#FF7A10]">{count || 1} table{parseInt(count) > 1 ? 's' : ''}</span> with{' '}
              <span className="font-semibold text-[#1F221D]">{seats} seats</span> in{' '}
              <span className="font-semibold text-[#1F221D]">Zone {resolvedSection}</span>
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FF7A10] text-white text-sm font-medium hover:bg-[#E86000] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {isSubmitting ? 'Creating…' : 'Create Tables'}
        </button>
      </form>
    </div>
  );
};

// ── Zone Group ──────────────────────────────────────────────────
interface ZoneGroupProps {
  section: string;
  tables: Table[];
  onDelete: (table: Table) => void;
  deletingId: number | null;
}

const ZoneGroup: React.FC<ZoneGroupProps> = ({ section, tables, onDelete, deletingId }) => {
  const [open, setOpen] = useState(true);

  const counts = {
    available: tables.filter((t) => t.status === 'available').length,
    occupied: tables.filter((t) => t.status === 'occupied' || t.status === 'served').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
  };

  return (
    <div className="bg-white border border-[#1F221D]/10 rounded-2xl overflow-hidden">
      {/* Zone header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F4F2F0] transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FF7A10]/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-[#FF7A10]">{section}</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[#1F221D]">Zone {section}</p>
            <p className="text-xs text-[#555754]">{tables.length} tables</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] font-medium">
            <span className="px-2 py-0.5 rounded-full bg-[#2E7D32]/10 text-[#2E7D32]">{counts.available} free</span>
            {counts.occupied > 0 && <span className="px-2 py-0.5 rounded-full bg-[#FF7A10]/10 text-[#E86000]">{counts.occupied} busy</span>}
            {counts.reserved > 0 && <span className="px-2 py-0.5 rounded-full bg-[#1565C0]/10 text-[#1565C0]">{counts.reserved} reserved</span>}
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-[#555754]" /> : <ChevronDown className="w-4 h-4 text-[#555754]" />}
        </div>
      </button>

      {/* Tables list */}
      {open && (
        <div className="border-t border-[#1F221D]/06">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-4">
            {tables.map((table) => {
              const statusColor =
                table.status === 'available' ? 'text-[#2E7D32] bg-[#2E7D32]/08 border-[#2E7D32]/20' :
                table.status === 'occupied' || table.status === 'served' ? 'text-[#E86000] bg-[#FF7A10]/08 border-[#FF7A10]/20' :
                table.status === 'reserved' ? 'text-[#1565C0] bg-[#1565C0]/08 border-[#1565C0]/20' :
                'text-[#555754] bg-[#555754]/08 border-[#555754]/20';

              const isDeletable = table.status === 'available';

              return (
                <div
                  key={table.id}
                  className="bg-[#F4F2F0] border border-[#1F221D]/08 rounded-xl p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-[#1F221D]">#{table.id}</span>
                    <button
                      onClick={() => isDeletable && onDelete(table)}
                      disabled={!isDeletable || deletingId === table.id}
                      title={isDeletable ? 'Delete table' : 'Cannot delete — table is in use'}
                      className="p-1 rounded-lg text-[#555754]/40 hover:text-[#C62828] hover:bg-[#C62828]/08 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {deletingId === table.id
                        ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#555754]">
                    <Users className="w-3 h-3" />
                    <span>{table.seats} seats</span>
                  </div>
                  <span className={`self-start text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize ${statusColor}`}>
                    {table.status}
                  </span>
                  {table.amount ? (
                    <span className="text-[10px] font-semibold text-[#2E7D32]">PKR {table.amount.toFixed(0)}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Screen ─────────────────────────────────────────────────
export const TableManagementScreen: React.FC = () => {
  const { tables, fetchTables } = useTableStore();
  const addNotification = useAppStore((s) => s.addNotification);

  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    await fetchTables();
    setIsLoading(false);
  }, [fetchTables]);

  useEffect(() => { load(); }, [load]);

  // Group by section
  const sections = [...new Set(tables.map((t) => t.section))].sort();
  const existingSections = sections;

  const handleDelete = async (table: Table) => {
    setDeletingId(table.id);
    try {
      await api.deleteTable(table.id);
      await fetchTables();
      addNotification(`Table #${table.id} deleted.`, 'info');
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Failed to delete table.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const counts = {
    total:     tables.length,
    available: tables.filter((t) => t.status === 'available').length,
    occupied:  tables.filter((t) => t.status === 'occupied' || t.status === 'served').length,
    reserved:  tables.filter((t) => t.status === 'reserved').length,
  };

  return (
    <PageWrapper className="h-full overflow-y-auto bg-[#F4F2F0]">
      <div className="max-w-[1400px] mx-auto px-6 py-6 pb-24 md:pb-8 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF7A10]/10 border border-[#FF7A10]/20 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-[#FF7A10]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#1F221D]">Table Management</h1>
              <p className="text-xs text-[#555754]">Create, organise, and remove tables by zone</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#555754] bg-white border border-[#1F221D]/10 hover:bg-[#F4F2F0] transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#FF7A10] text-white hover:bg-[#E86000] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Tables
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Tables',   value: counts.total,     color: '#1F221D' },
            { label: 'Available',      value: counts.available,  color: '#2E7D32' },
            { label: 'Occupied/Served',value: counts.occupied,   color: '#E86000' },
            { label: 'Reserved',       value: counts.reserved,   color: '#1565C0' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-[#1F221D]/10 rounded-xl px-4 py-3 flex flex-col gap-0.5">
              <span className="text-xs text-[#555754]">{s.label}</span>
              <span className="text-xl font-semibold" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Layout: form + zones */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* Add Table Form */}
          {showForm && (
            <div className="w-full lg:w-80 xl:w-88 flex-shrink-0">
              <AddTableForm
                onSaved={load}
                onClose={() => setShowForm(false)}
                existingSections={existingSections}
              />
            </div>
          )}

          {/* Zone groups */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {sections.length === 0 && !isLoading && (
              <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#F4F2F0] flex items-center justify-center mb-1">
                  <LayoutGrid className="w-7 h-7 text-[#555754]/30" />
                </div>
                <p className="text-sm text-[#555754]">No tables yet</p>
                <p className="text-xs text-[#555754]/60">Click "Add Tables" to create your first zone and tables.</p>
              </div>
            )}
            {isLoading && sections.length === 0 && (
              <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-10 flex items-center justify-center gap-3">
                <RefreshCw className="w-5 h-5 text-[#555754]/40 animate-spin" />
                <span className="text-sm text-[#555754]">Loading tables…</span>
              </div>
            )}
            {sections.map((section) => (
              <ZoneGroup
                key={section}
                section={section}
                tables={tables.filter((t) => t.section === section)}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            ))}
          </div>
        </div>

      </div>
    </PageWrapper>
  );
};

export default TableManagementScreen;
