import React, { useState, useEffect } from 'react';
import { useCustomerStore } from '../../store/useCustomerStore';
import { useAppStore } from '../../store/useAppStore';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Customer } from '../../types';
import {
  UserCircle2,
  Phone,
  Mail,
  StickyNote,
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Users,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Customer Form (slide-in right panel)
// ─────────────────────────────────────────────

interface CustomerFormValues {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

const defaultForm: CustomerFormValues = { name: '', phone: '', email: '', notes: '' };

interface CustomerFormPanelProps {
  editCustomer: Customer | null;
  onClose: () => void;
}

const CustomerFormPanel: React.FC<CustomerFormPanelProps> = ({ editCustomer, onClose }) => {
  const createCustomer = useCustomerStore((s) => s.createCustomer);
  const updateCustomer = useCustomerStore((s) => s.updateCustomer);
  const addNotification = useAppStore((s) => s.addNotification);

  const [form, setForm] = useState<CustomerFormValues>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editCustomer) {
      setForm({
        name: editCustomer.name,
        phone: editCustomer.phone ?? '',
        email: editCustomer.email ?? '',
        notes: editCustomer.notes ?? '',
      });
    } else {
      setForm(defaultForm);
    }
  }, [editCustomer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      addNotification('Customer name is required.', 'warning');
      return;
    }

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      if (editCustomer) {
        await updateCustomer(editCustomer.id, payload);
        addNotification(`Customer "${payload.name}" updated successfully.`, 'success');
      } else {
        await createCustomer(payload);
        addNotification(`Customer "${payload.name}" added successfully.`, 'success');
      }
      onClose();
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Operation failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase =
    'w-full bg-[#F4F2F0] border border-[#1F221D]/12 rounded-xl px-4 py-3 text-sm text-[#1F221D] placeholder-[#555754]/50 focus:outline-none focus:border-[#FF7A10]/50 focus:bg-white transition-all duration-200';

  return (
    <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
      <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-6">
        {/* Panel header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {editCustomer ? (
              <Pencil className="w-4 h-4 text-[#FF7A10]" />
            ) : (
              <Plus className="w-4 h-4 text-[#FF7A10]" />
            )}
            <h2 className="text-sm font-semibold text-[#1F221D] uppercase tracking-wider">
              {editCustomer ? 'Edit Customer' : 'New Customer'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#555754] hover:text-[#1F221D] hover:bg-[#ECEAE7] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#555754] uppercase tracking-wider">
              Name <span className="text-[#C62828]">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Maria Santos"
              className={inputBase}
              disabled={isSubmitting}
              maxLength={100}
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#555754] uppercase tracking-wider">Phone</label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. +92 312 345 6789"
                className={`${inputBase} pr-10`}
                disabled={isSubmitting}
                maxLength={20}
              />
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555754]/50 pointer-events-none" />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#555754] uppercase tracking-wider">Email</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. maria@example.com"
                className={`${inputBase} pr-10`}
                disabled={isSubmitting}
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555754]/50 pointer-events-none" />
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#555754] uppercase tracking-wider">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Allergies, preferences…"
              rows={3}
              className={`${inputBase} resize-none`}
              disabled={isSubmitting}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm
              bg-[#FF7A10] text-white
              hover:bg-[#E86000]
              active:scale-[0.98] transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : editCustomer ? (
              <>
                <Pencil className="w-4 h-4" />
                Save Changes
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Customer
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Customer Card
// ─────────────────────────────────────────────

interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  isDeleting: boolean;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onEdit, onDelete, isDeleting }) => (
  <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:bg-[#F4F2F0]">
    {/* Header */}
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-[rgba(255,122,16,0.08)] border border-[#FF7A10]/20 flex items-center justify-center flex-shrink-0">
          <UserCircle2 className="w-5 h-5 text-[#FF7A10]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1F221D] leading-tight truncate">{customer.name}</p>
          {customer.phone && (
            <p className="text-[11px] text-[#555754] font-medium mt-0.5 flex items-center gap-1">
              <Phone className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{customer.phone}</span>
            </p>
          )}
        </div>
      </div>
    </div>

    {/* Details */}
    {(customer.email || customer.notes) && (
      <div className="flex flex-col gap-2">
        {customer.email && (
          <div className="flex items-center gap-2 text-xs text-[#555754]">
            <Mail className="w-3.5 h-3.5 flex-shrink-0 text-[#555754]/60" />
            <span className="truncate">{customer.email}</span>
          </div>
        )}
        {customer.notes && (
          <div className="flex items-start gap-2 text-xs text-[#555754]">
            <StickyNote className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#555754]/60" />
            <span className="line-clamp-2">{customer.notes}</span>
          </div>
        )}
      </div>
    )}

    {/* Actions */}
    <div className="flex gap-2 mt-auto">
      <button
        onClick={() => onEdit(customer)}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold
          text-[#FF7A10] border border-[#FF7A10]/20 bg-[rgba(255,122,16,0.08)]
          hover:bg-[rgba(255,122,16,0.12)] hover:border-[#FF7A10]/40
          active:scale-[0.98] transition-all duration-200"
      >
        <Pencil className="w-3.5 h-3.5" />
        Edit
      </button>
      <button
        onClick={() => onDelete(customer)}
        disabled={isDeleting}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold
          text-[#C62828] border border-[#C62828]/20 bg-[#C62828]/10
          hover:bg-[#C62828]/15 hover:border-[#C62828]/40
          active:scale-[0.98] transition-all duration-200
          disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isDeleting ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
        Delete
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────

export const CustomersScreen: React.FC = () => {
  const customers = useCustomerStore((s) => s.customers);
  const isLoading = useCustomerStore((s) => s.isLoading);
  const fetchCustomers = useCustomerStore((s) => s.fetchCustomers);
  const deleteCustomer = useCustomerStore((s) => s.deleteCustomer);
  const addNotification = useAppStore((s) => s.addNotification);

  const [showPanel, setShowPanel] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const openAdd = () => {
    setEditCustomer(null);
    setShowPanel(true);
  };

  const openEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setShowPanel(true);
  };

  const closePanel = () => {
    setShowPanel(false);
    setEditCustomer(null);
  };

  const handleDelete = async (customer: Customer) => {
    setDeletingId(customer.id);
    try {
      await deleteCustomer(customer.id);
      addNotification(`Customer "${customer.name}" deleted.`, 'info');
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Failed to delete customer.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageWrapper className="h-full overflow-y-auto p-6 pb-24 md:pb-6 scrollbar-none bg-[#F4F2F0]">

      {/* ── PAGE HEADER ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(255,122,16,0.08)] border border-[#FF7A10]/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#FF7A10]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#1F221D] tracking-tight">Customers</h1>
            <p className="text-xs text-[#555754] font-medium mt-0.5">
              {customers.length} customer{customers.length !== 1 ? 's' : ''} in your CRM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchCustomers()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#555754] border border-[#1F221D]/10 bg-white hover:bg-[#ECEAE7] hover:text-[#1F221D] transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
              bg-[#FF7A10] text-white
              hover:bg-[#E86000]
              active:scale-[0.98] transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── LEFT: FORM PANEL ── */}
        {showPanel && (
          <CustomerFormPanel
            editCustomer={editCustomer}
            onClose={closePanel}
          />
        )}

        {/* ── RIGHT: CUSTOMER GRID ── */}
        <div className="flex-1 min-w-0">
          {/* Loading state */}
          {isLoading && customers.length === 0 && (
            <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-10 flex flex-col items-center gap-3">
              <RefreshCw className="w-7 h-7 text-[#555754]/40 animate-spin" />
              <p className="text-sm font-semibold text-[#1F221D]/60">Loading customers…</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && customers.length === 0 && (
            <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#ECEAE7] border border-[#1F221D]/10 flex items-center justify-center mb-1">
                <Users className="w-7 h-7 text-[#555754]/40" />
              </div>
              <p className="text-sm font-semibold text-[#1F221D]/60">No customers yet</p>
              <p className="text-xs text-[#555754]/50 max-w-xs">
                Click "Add Customer" to start building your CRM.
              </p>
            </div>
          )}

          {/* Customer cards grid */}
          {customers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {customers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  isDeleting={deletingId === customer.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default CustomersScreen;
