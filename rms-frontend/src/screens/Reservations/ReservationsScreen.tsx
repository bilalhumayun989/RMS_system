import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTableStore } from '../../store/useTableStore';
import { useAppStore } from '../../store/useAppStore';
import { useCustomerStore } from '../../store/useCustomerStore';
import { api } from '../../services/api';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Table } from '../../types';
import {
  CalendarDays,
  Clock,
  Users,
  X,
  Plus,
  BookOpen,
  RefreshCw,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Reservation Form
// ─────────────────────────────────────────────

interface ReservationFormProps {
  availableTables: Table[];
  onSuccess: () => void;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ availableTables, onSuccess }) => {
  const fetchTables = useTableStore((s) => s.fetchTables);
  const addNotification = useAppStore((s) => s.addNotification);
  const customers = useCustomerStore((s) => s.customers);
  const fetchCustomers = useCustomerStore((s) => s.fetchCustomers);
  const navigate = useNavigate();

  const [tableId, setTableId] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tableId || !customerId || !timeSlot.trim()) {
      addNotification('Please fill in all fields.', 'warning');
      return;
    }

    const selectedTable = availableTables.find((t) => t.id === Number(tableId));
    if (!selectedTable) {
      addNotification('Selected table is no longer available.', 'error');
      return;
    }

    const selectedCustomer = customers.find((c) => c.id === Number(customerId));
    if (!selectedCustomer) {
      addNotification('Selected customer not found.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.updateTable(selectedTable.id, {
        status: 'reserved',
        reserved_for: timeSlot.trim(),
        guest_name: selectedCustomer.name,
        seats: selectedTable.seats,
        section: selectedTable.section,
      });
      await fetchTables();
      addNotification(`Table ${selectedTable.id} reserved for ${selectedCustomer.name} at ${timeSlot.trim()}.`, 'success');
      setTableId('');
      setCustomerId('');
      setTimeSlot('');
      onSuccess();
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Failed to create reservation.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase =
    'w-full bg-[#F4F2F0] border border-[#1F221D]/12 rounded-xl px-4 py-3 text-sm text-[#1F221D] placeholder-[#555754]/50 focus:outline-none focus:border-[#FF7A10]/50 focus:bg-white transition-all duration-200';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Table Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#555754] uppercase tracking-wider">
          Select Table
        </label>
        <div className="relative">
          <select
            value={tableId}
            onChange={(e) => setTableId(e.target.value)}
            className={`${inputBase} appearance-none cursor-pointer pr-10`}
            disabled={isSubmitting}
          >
            <option value="">— Choose a table —</option>
            {availableTables.map((t) => (
              <option key={t.id} value={t.id}>
                Table {t.id} · Zone {t.section} · {t.seats} seats
              </option>
            ))}
          </select>
          <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555754]/50 pointer-events-none" />
        </div>
        {availableTables.length === 0 && (
          <p className="text-[11px] text-[#C62828]/70 mt-0.5">No available tables right now.</p>
        )}
      </div>

      {/* Customer Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#555754] uppercase tracking-wider">
          Customer
        </label>
        <div className="relative">
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className={`${inputBase} appearance-none cursor-pointer pr-10`}
            disabled={isSubmitting}
          >
            <option value="">— Choose a customer —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.phone ? ` · ${c.phone}` : ''}
              </option>
            ))}
          </select>
          <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555754]/50 pointer-events-none" />
        </div>
        {customers.length === 0 && (
          <p className="text-[11px] text-[#555754]/60 mt-0.5">
            No customers found.{' '}
            <button
              type="button"
              onClick={() => navigate('/customers')}
              className="text-[#FF7A10] underline hover:no-underline"
            >
              + New Customer
            </button>
          </p>
        )}
        {customers.length > 0 && (
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="self-start text-[11px] text-[#FF7A10]/70 hover:text-[#FF7A10] underline hover:no-underline transition-colors"
          >
            + New Customer
          </button>
        )}
      </div>

      {/* Time Slot */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#555754] uppercase tracking-wider">
          Time Slot
        </label>
        <div className="relative">
          <input
            type="text"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            placeholder="e.g. 19:00 or 8:30 PM"
            className={`${inputBase} pr-10`}
            disabled={isSubmitting}
            maxLength={20}
          />
          <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555754]/50 pointer-events-none" />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || availableTables.length === 0}
        className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm
          bg-[#FF7A10] text-white
          hover:bg-[#E86000]
          active:scale-[0.98] transition-all duration-200
          disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {isSubmitting ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Reserving…
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Confirm Reservation
          </>
        )}
      </button>
    </form>
  );
};

// ─────────────────────────────────────────────
// Reservation Card
// ─────────────────────────────────────────────

interface ReservationCardProps {
  table: Table;
  onCancel: (table: Table) => void;
  isCancelling: boolean;
  customerPhone?: string;
}

const ReservationCard: React.FC<ReservationCardProps> = ({ table, onCancel, isCancelling, customerPhone }) => (
  <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:bg-[#F4F2F0]">
    {/* Header row */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#1565C0]/10 border border-[#1565C0]/20 flex items-center justify-center">
          <span className="text-lg font-semibold text-[#1565C0] leading-none">{table.id}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1F221D] leading-tight">Table {table.id}</p>
          <p className="text-[11px] text-[#555754] font-medium mt-0.5">Zone {table.section} · {table.seats} seats</p>
        </div>
      </div>
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-semibold tracking-wider border text-[#1565C0] bg-[#1565C0]/10 border-[#1565C0]/20">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1565C0]" />
        Reserved
      </span>
    </div>

    {/* Info grid */}
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-[#F4F2F0] border border-[#1F221D]/06 rounded-xl px-3 py-2.5">
        <p className="text-[10px] text-[#555754] uppercase tracking-wider font-medium mb-1">Guest</p>
        <p className="text-sm font-semibold text-[#1F221D] truncate">{table.guestName || '—'}</p>
        {customerPhone && (
          <p className="text-[11px] text-[#555754] font-medium mt-0.5 truncate">{customerPhone}</p>
        )}
      </div>
      <div className="bg-[#F4F2F0] border border-[#1F221D]/06 rounded-xl px-3 py-2.5">
        <p className="text-[10px] text-[#555754] uppercase tracking-wider font-medium mb-1">Time Slot</p>
        <p className="text-sm font-semibold text-[#1565C0] flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          {table.reservedFor || '—'}
        </p>
      </div>
    </div>

    {/* Cancel button */}
    <button
      onClick={() => onCancel(table)}
      disabled={isCancelling}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold
        text-[#C62828] border border-[#C62828]/20 bg-[#C62828]/10
        hover:bg-[#C62828]/15 hover:border-[#C62828]/40
        active:scale-[0.98] transition-all duration-200
        disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {isCancelling ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <X className="w-3.5 h-3.5" />
      )}
      Cancel Reservation
    </button>
  </div>
);

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────

export const ReservationsScreen: React.FC = () => {
  const tables = useTableStore((s) => s.tables);
  const fetchTables = useTableStore((s) => s.fetchTables);
  const addNotification = useAppStore((s) => s.addNotification);
  const customers = useCustomerStore((s) => s.customers);

  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 30_000);
    return () => clearInterval(interval);
  }, [fetchTables]);

  const reservedTables = tables.filter((t) => t.status === 'reserved');
  const availableTables = tables.filter((t) => t.status === 'available');

  const handleCancel = async (table: Table) => {
    setCancellingId(table.id);
    try {
      await api.updateTable(table.id, {
        status: 'available',
        reserved_for: null,
        guest_name: null,
        seats: table.seats,
        section: table.section,
      });
      await fetchTables();
      addNotification(`Reservation for Table ${table.id} cancelled.`, 'info');
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Failed to cancel reservation.', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <PageWrapper className="h-full overflow-y-auto p-6 pb-24 md:pb-6 scrollbar-none bg-[#F4F2F0]">

      {/* ── PAGE HEADER ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(255,122,16,0.08)] border border-[#FF7A10]/20 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-[#FF7A10]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#1F221D] tracking-tight">Seat Reservations</h1>
            <p className="text-xs text-[#555754] font-medium mt-0.5">
              {reservedTables.length} active reservation{reservedTables.length !== 1 ? 's' : ''} · {availableTables.length} table{availableTables.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchTables()}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#555754] border border-[#1F221D]/10 bg-white hover:bg-[#ECEAE7] hover:text-[#1F221D] transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── LEFT: NEW RESERVATION FORM ── */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-6">
            {/* Form header */}
            <div className="flex items-center gap-2 mb-6">
              <Plus className="w-4 h-4 text-[#FF7A10]" />
              <h2 className="text-sm font-semibold text-[#1F221D] uppercase tracking-wider">New Reservation</h2>
            </div>

            <ReservationForm
              availableTables={availableTables}
              onSuccess={() => {}}
            />
          </div>
        </div>

        {/* ── RIGHT: CURRENT RESERVATIONS ── */}
        <div className="flex-1 min-w-0">
          {/* Section header */}
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-[#1565C0]" />
            <h2 className="text-sm font-semibold text-[#1F221D] uppercase tracking-wider">Current Reservations</h2>
            {reservedTables.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#1565C0] bg-[#1565C0]/10 border border-[#1565C0]/20">
                {reservedTables.length}
              </span>
            )}
          </div>

          {/* Empty state */}
          {reservedTables.length === 0 && (
            <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#ECEAE7] border border-[#1F221D]/10 flex items-center justify-center mb-1">
                <CalendarDays className="w-7 h-7 text-[#555754]/40" />
              </div>
              <p className="text-sm font-semibold text-[#1F221D]/60">No active reservations</p>
              <p className="text-xs text-[#555754]/50 max-w-xs">
                Create a new reservation from the form on the left to get started.
              </p>
            </div>
          )}

          {/* Reservation cards grid */}
          {reservedTables.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {reservedTables.map((table) => {
                const matchedCustomer = customers.find(
                  (c) => c.name === table.guestName
                );
                return (
                  <ReservationCard
                    key={table.id}
                    table={table}
                    onCancel={handleCancel}
                    isCancelling={cancellingId === table.id}
                    customerPhone={matchedCustomer?.phone}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default ReservationsScreen;
