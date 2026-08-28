import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, UserPlus, Pencil, Trash2, X, RefreshCw, Plus,
  Phone, Mail, ClipboardList, Calendar, Clock, StickyNote,
  ChevronDown,
} from 'lucide-react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api';
import { Employee, AttendanceLog } from '../../types';

// ─── Utility ─────────────────────────────────────────────────────────────────

const inputBase =
  'w-full bg-[#F4F2F0] border border-[#1F221D]/10 rounded-xl px-4 py-2.5 text-sm text-[#1F221D] placeholder-[#555754]/50 focus:outline-none focus:border-[#FF7A10]/50 focus:bg-white transition-all duration-200';

const labelCls = 'text-xs font-semibold text-[#555754] uppercase tracking-wider mb-1 block';

const today = () => new Date().toISOString().slice(0, 10);

type TabId = 'employees' | 'attendance';

type AttendanceStatus = AttendanceLog['status'];

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  'half-day': 'Half-Day',
};

const statusBadgeCls = (status: AttendanceStatus): string => {
  switch (status) {
    case 'present':
      return 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20';
    case 'absent':
      return 'bg-[#C62828]/10 text-[#C62828] border border-[#C62828]/20';
    case 'late':
      return 'bg-[#FF7A10]/10 text-[#FF7A10] border border-[#FF7A10]/20';
    case 'half-day':
      return 'bg-[#1565C0]/10 text-[#1565C0] border border-[#1565C0]/20';
  }
};

// ─── Employee Form Panel ──────────────────────────────────────────────────────

interface EmployeeFormValues {
  name: string;
  email: string;
  phone: string;
  role_id: string;
  pin: string;
  is_active: boolean;
}

const defaultEmpForm: EmployeeFormValues = {
  name: '', email: '', phone: '', role_id: '', pin: '', is_active: true,
};

interface Role { id: number; name: string; }

interface EmployeeFormPanelProps {
  editEmployee: Employee | null;
  roles: Role[];
  onClose: () => void;
  onSaved: () => void;
}

const EmployeeFormPanel: React.FC<EmployeeFormPanelProps> = ({ editEmployee, roles, onClose, onSaved }) => {
  const addNotification = useAppStore((s) => s.addNotification);
  const [form, setForm] = useState<EmployeeFormValues>(defaultEmpForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editEmployee) {
      setForm({
        name: editEmployee.name,
        email: editEmployee.email ?? '',
        phone: editEmployee.phone ?? '',
        role_id: editEmployee.role_id != null ? String(editEmployee.role_id) : '',
        pin: '',
        is_active: editEmployee.is_active,
      });
    } else {
      setForm(defaultEmpForm);
    }
  }, [editEmployee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { addNotification('Name is required.', 'warning'); return; }

    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      role_id: form.role_id ? Number(form.role_id) : undefined,
      is_active: form.is_active,
    };
    if (form.pin.trim()) payload.pin = form.pin.trim();

    setIsSubmitting(true);
    try {
      if (editEmployee) {
        await api.updateEmployee(editEmployee.id, payload);
        addNotification(`Employee "${form.name.trim()}" updated.`, 'success');
      } else {
        await api.createEmployee(payload);
        addNotification(`Employee "${form.name.trim()}" added.`, 'success');
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
            {editEmployee ? <Pencil className="w-4 h-4 text-[#FF7A10]" /> : <UserPlus className="w-4 h-4 text-[#FF7A10]" />}
            <h2 className="text-sm font-semibold text-[#1F221D] uppercase tracking-wider">
              {editEmployee ? 'Edit Employee' : 'New Employee'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#555754] hover:text-[#1F221D] hover:bg-[#ECEAE7] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>Name <span className="text-[#C62828]">*</span></label>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Full name" className={inputBase} disabled={isSubmitting} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" className={inputBase} disabled={isSubmitting} />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+92 300 0000000" className={inputBase} disabled={isSubmitting} />
          </div>
          <div>
            <label className={labelCls}>Role</label>
            <div className="relative">
              <select name="role_id" value={form.role_id} onChange={handleChange} className={`${inputBase} appearance-none pr-8`} disabled={isSubmitting}>
                <option value="">— Select Role —</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555754]/50 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={labelCls}>PIN</label>
            <input type="password" name="pin" value={form.pin} onChange={handleChange} placeholder={editEmployee ? 'Leave blank to keep current' : 'Set PIN'} className={inputBase} disabled={isSubmitting} />
          </div>
          <div className="flex items-center justify-between py-1">
            <label className="text-sm font-medium text-[#1F221D]">Active</label>
            <button type="button" onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${form.is_active ? 'bg-[#FF7A10]' : 'bg-[#1F221D]/20'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${form.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <button type="submit" disabled={isSubmitting}
            className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-[#FF7A10] text-white hover:bg-[#E86000] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {isSubmitting ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</> : editEmployee ? <><Pencil className="w-4 h-4" /> Save Changes</> : <><Plus className="w-4 h-4" /> Add Employee</>}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Employee Card ────────────────────────────────────────────────────────────

interface EmployeeCardProps {
  employee: Employee;
  onEdit: (e: Employee) => void;
  onDelete: (e: Employee) => void;
  isDeleting: boolean;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onEdit, onDelete, isDeleting }) => (
  <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-5 flex flex-col gap-4 hover:bg-[#F4F2F0] transition-all duration-200">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-[#FF7A10]/10 border border-[#FF7A10]/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-[#FF7A10]">{employee.name.slice(0, 2).toUpperCase()}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1F221D] truncate">{employee.name}</p>
          <p className="text-xs text-[#555754] mt-0.5 truncate">{employee.role?.name ?? '—'}</p>
        </div>
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${employee.is_active ? 'bg-[#2E7D32]/10 text-[#2E7D32]' : 'bg-[#C62828]/10 text-[#C62828]'}`}>
        {employee.is_active ? 'Active' : 'Inactive'}
      </span>
    </div>
    <div className="flex flex-col gap-1.5">
      {employee.phone && (
        <div className="flex items-center gap-2 text-xs text-[#555754]">
          <Phone className="w-3.5 h-3.5 flex-shrink-0 text-[#555754]/60" />
          <span className="truncate">{employee.phone}</span>
        </div>
      )}
      {employee.email && (
        <div className="flex items-center gap-2 text-xs text-[#555754]">
          <Mail className="w-3.5 h-3.5 flex-shrink-0 text-[#555754]/60" />
          <span className="truncate">{employee.email}</span>
        </div>
      )}
    </div>
    <div className="flex gap-2 mt-auto">
      <button onClick={() => onEdit(employee)}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-[#FF7A10] border border-[#FF7A10]/20 bg-[#FF7A10]/10 hover:bg-[#FF7A10]/15 active:scale-[0.98] transition-all">
        <Pencil className="w-3.5 h-3.5" /> Edit
      </button>
      <button onClick={() => onDelete(employee)} disabled={isDeleting}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-[#C62828] border border-[#C62828]/20 bg-[#C62828]/10 hover:bg-[#C62828]/15 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
        {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        Delete
      </button>
    </div>
  </div>
);

// ─── Attendance Form Panel ────────────────────────────────────────────────────

interface AttendanceFormValues {
  employee_id: string;
  date: string;
  check_in: string;
  check_out: string;
  status: AttendanceStatus;
  notes: string;
}

const defaultAttForm = (): AttendanceFormValues => ({
  employee_id: '', date: today(), check_in: '', check_out: '', status: 'present', notes: '',
});

interface AttendanceFormPanelProps {
  editLog: AttendanceLog | null;
  employees: Employee[];
  onClose: () => void;
  onSaved: () => void;
}

const AttendanceFormPanel: React.FC<AttendanceFormPanelProps> = ({ editLog, employees, onClose, onSaved }) => {
  const addNotification = useAppStore((s) => s.addNotification);
  const [form, setForm] = useState<AttendanceFormValues>(defaultAttForm());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editLog) {
      setForm({
        employee_id: String(editLog.employee_id),
        date: editLog.date,
        check_in: editLog.check_in ?? '',
        check_out: editLog.check_out ?? '',
        status: editLog.status,
        notes: editLog.notes ?? '',
      });
    } else {
      setForm(defaultAttForm());
    }
  }, [editLog]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_id) { addNotification('Please select an employee.', 'warning'); return; }
    if (!form.date) { addNotification('Date is required.', 'warning'); return; }

    const payload = {
      employee_id: Number(form.employee_id),
      date: form.date,
      check_in: form.check_in.trim() || undefined,
      check_out: form.check_out.trim() || undefined,
      status: form.status,
      notes: form.notes.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      if (editLog) {
        await api.updateAttendanceLog(editLog.id, payload);
        addNotification('Attendance log updated.', 'success');
      } else {
        await api.createAttendanceLog(payload);
        addNotification('Attendance logged.', 'success');
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
            <ClipboardList className="w-4 h-4 text-[#FF7A10]" />
            <h2 className="text-sm font-semibold text-[#1F221D] uppercase tracking-wider">
              {editLog ? 'Edit Log' : 'Log Attendance'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#555754] hover:text-[#1F221D] hover:bg-[#ECEAE7] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>Employee <span className="text-[#C62828]">*</span></label>
            <div className="relative">
              <select name="employee_id" value={form.employee_id} onChange={handleChange} className={`${inputBase} appearance-none pr-8`} disabled={isSubmitting}>
                <option value="">— Select Employee —</option>
                {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555754]/50 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Date <span className="text-[#C62828]">*</span></label>
            <input type="date" name="date" value={form.date} onChange={handleChange} className={inputBase} disabled={isSubmitting} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Check In</label>
              <input type="time" name="check_in" value={form.check_in} onChange={handleChange} className={inputBase} disabled={isSubmitting} />
            </div>
            <div>
              <label className={labelCls}>Check Out</label>
              <input type="time" name="check_out" value={form.check_out} onChange={handleChange} className={inputBase} disabled={isSubmitting} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Status <span className="text-[#C62828]">*</span></label>
            <div className="relative">
              <select name="status" value={form.status} onChange={handleChange} className={`${inputBase} appearance-none pr-8`} disabled={isSubmitting}>
                {(Object.keys(STATUS_LABELS) as AttendanceStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555754]/50 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Optional note…" rows={2} className={`${inputBase} resize-none`} disabled={isSubmitting} />
          </div>
          <button type="submit" disabled={isSubmitting}
            className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-[#FF7A10] text-white hover:bg-[#E86000] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {isSubmitting ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</> : editLog ? <><Pencil className="w-4 h-4" /> Save Changes</> : <><Plus className="w-4 h-4" /> Log Attendance</>}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Employees Tab ────────────────────────────────────────────────────────────

interface EmployeesTabProps {
  employees: Employee[];
  roles: Role[];
  isLoading: boolean;
  onReload: () => void;
}

const EmployeesTab: React.FC<EmployeesTabProps> = ({ employees, roles, isLoading, onReload }) => {
  const addNotification = useAppStore((s) => s.addNotification);
  const [showPanel, setShowPanel] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const openAdd = () => { setEditEmployee(null); setShowPanel(true); };
  const openEdit = (e: Employee) => { setEditEmployee(e); setShowPanel(true); };
  const closePanel = () => { setShowPanel(false); setEditEmployee(null); };

  const handleDelete = async (emp: Employee) => {
    setDeletingId(emp.id);
    try {
      await api.deleteEmployee(emp.id);
      addNotification(`Employee "${emp.name}" deleted.`, 'info');
      onReload();
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Failed to delete.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FF7A10]/10 border border-[#FF7A10]/20 flex items-center justify-center">
            <Users className="w-4.5 h-4.5 text-[#FF7A10]" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#1F221D]">Employees</h2>
            <p className="text-xs text-[#555754]">{employees.length} employee{employees.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onReload} disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#555754] border border-[#1F221D]/10 bg-white hover:bg-[#ECEAE7] transition-all active:scale-95 disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#FF7A10] text-white hover:bg-[#E86000] active:scale-[0.98] transition-all">
            <UserPlus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {showPanel && (
          <EmployeeFormPanel editEmployee={editEmployee} roles={roles} onClose={closePanel} onSaved={onReload} />
        )}
        <div className="flex-1 min-w-0">
          {isLoading && employees.length === 0 && (
            <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-10 flex flex-col items-center gap-3">
              <RefreshCw className="w-7 h-7 text-[#555754]/40 animate-spin" />
              <p className="text-sm font-semibold text-[#1F221D]/60">Loading employees…</p>
            </div>
          )}
          {!isLoading && employees.length === 0 && (
            <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#ECEAE7] border border-[#1F221D]/10 flex items-center justify-center mb-1">
                <Users className="w-7 h-7 text-[#555754]/40" />
              </div>
              <p className="text-sm font-semibold text-[#1F221D]/60">No employees yet</p>
              <p className="text-xs text-[#555754]/50 max-w-xs">Click "Add Employee" to get started.</p>
            </div>
          )}
          {employees.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {employees.map((emp) => (
                <EmployeeCard key={emp.id} employee={emp} onEdit={openEdit} onDelete={handleDelete} isDeleting={deletingId === emp.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Attendance Tab ───────────────────────────────────────────────────────────

interface AttendanceTabProps {
  employees: Employee[];
}

const AttendanceTab: React.FC<AttendanceTabProps> = ({ employees }) => {
  const addNotification = useAppStore((s) => s.addNotification);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterDate, setFilterDate] = useState(today());
  const [filterEmpId, setFilterEmpId] = useState<string>('');
  const [showPanel, setShowPanel] = useState(false);
  const [editLog, setEditLog] = useState<AttendanceLog | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: { employee_id?: number; date?: string } = {};
      if (filterEmpId) filters.employee_id = Number(filterEmpId);
      if (filterDate) filters.date = filterDate;
      const data = await api.getAttendanceLogs(filters);
      setLogs(data);
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Failed to load logs.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filterDate, filterEmpId, addNotification]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const openAdd = () => { setEditLog(null); setShowPanel(true); };
  const openEdit = (log: AttendanceLog) => { setEditLog(log); setShowPanel(true); };
  const closePanel = () => { setShowPanel(false); setEditLog(null); };

  const handleDelete = async (log: AttendanceLog) => {
    setDeletingId(log.id);
    try {
      await api.deleteAttendanceLog(log.id);
      addNotification('Attendance log deleted.', 'info');
      fetchLogs();
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Failed to delete.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FF7A10]/10 border border-[#FF7A10]/20 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-[18px] h-[18px] text-[#FF7A10]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#1F221D]">Attendance</h2>
            <p className="text-xs text-[#555754]">{logs.length} record{logs.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          {/* Date picker */}
          <div className="relative flex items-center">
            <Calendar className="absolute left-3 w-3.5 h-3.5 text-[#555754]/50 pointer-events-none" />
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
              className="bg-white border border-[#1F221D]/10 rounded-xl pl-9 pr-3 py-2 text-xs text-[#1F221D] focus:outline-none focus:border-[#FF7A10]/50 transition-all" />
          </div>
          {/* Employee filter */}
          <div className="relative flex items-center">
            <select value={filterEmpId} onChange={(e) => setFilterEmpId(e.target.value)}
              className="bg-white border border-[#1F221D]/10 rounded-xl px-3 py-2 text-xs text-[#1F221D] appearance-none pr-7 focus:outline-none focus:border-[#FF7A10]/50 transition-all min-w-[140px]">
              <option value="">All Employees</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 w-3.5 h-3.5 text-[#555754]/50 pointer-events-none" />
          </div>
          <button onClick={fetchLogs} disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#555754] border border-[#1F221D]/10 bg-white hover:bg-[#ECEAE7] transition-all active:scale-95 disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#FF7A10] text-white hover:bg-[#E86000] active:scale-[0.98] transition-all">
            <Plus className="w-4 h-4" /> Log Attendance
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {showPanel && (
          <AttendanceFormPanel editLog={editLog} employees={employees} onClose={closePanel} onSaved={fetchLogs} />
        )}
        <div className="flex-1 min-w-0 overflow-x-auto">
          {isLoading ? (
            <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-10 flex flex-col items-center gap-3">
              <RefreshCw className="w-7 h-7 text-[#555754]/40 animate-spin" />
              <p className="text-sm font-semibold text-[#1F221D]/60">Loading logs…</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#ECEAE7] border border-[#1F221D]/10 flex items-center justify-center mb-1">
                <ClipboardList className="w-7 h-7 text-[#555754]/40" />
              </div>
              <p className="text-sm font-semibold text-[#1F221D]/60">No attendance logs</p>
              <p className="text-xs text-[#555754]/50 max-w-xs">Click "Log Attendance" to record an entry.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#1F221D]/10 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1F221D]/10 bg-[#F4F2F0]">
                    <th className="text-left text-xs font-semibold text-[#555754] uppercase tracking-wider px-4 py-3">Employee</th>
                    <th className="text-left text-xs font-semibold text-[#555754] uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Date</th>
                    <th className="text-left text-xs font-semibold text-[#555754] uppercase tracking-wider px-4 py-3 hidden md:table-cell">Check In</th>
                    <th className="text-left text-xs font-semibold text-[#555754] uppercase tracking-wider px-4 py-3 hidden md:table-cell">Check Out</th>
                    <th className="text-left text-xs font-semibold text-[#555754] uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-[#555754] uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Notes</th>
                    <th className="text-right text-xs font-semibold text-[#555754] uppercase tracking-wider px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F221D]/5">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F4F2F0] transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-medium text-[#1F221D] text-sm">{log.employeeName ?? `#${log.employee_id}`}</span>
                      </td>
                      <td className="px-4 py-3 text-[#555754] text-xs hidden sm:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                          {log.date}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#555754] text-xs hidden md:table-cell">
                        {log.check_in ? (
                          <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 flex-shrink-0" />{log.check_in}</div>
                        ) : <span className="text-[#555754]/40">—</span>}
                      </td>
                      <td className="px-4 py-3 text-[#555754] text-xs hidden md:table-cell">
                        {log.check_out ? (
                          <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 flex-shrink-0" />{log.check_out}</div>
                        ) : <span className="text-[#555754]/40">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadgeCls(log.status)}`}>
                          {STATUS_LABELS[log.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#555754] hidden lg:table-cell max-w-[160px]">
                        {log.notes ? (
                          <div className="flex items-start gap-1.5">
                            <StickyNote className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{log.notes}</span>
                          </div>
                        ) : <span className="text-[#555754]/40">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEdit(log)}
                            className="p-1.5 rounded-lg text-[#FF7A10] border border-[#FF7A10]/20 bg-[#FF7A10]/10 hover:bg-[#FF7A10]/15 transition-all active:scale-95">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(log)} disabled={deletingId === log.id}
                            className="p-1.5 rounded-lg text-[#C62828] border border-[#C62828]/20 bg-[#C62828]/10 hover:bg-[#C62828]/15 transition-all active:scale-95 disabled:opacity-40">
                            {deletingId === log.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main StaffScreen ─────────────────────────────────────────────────────────

export const StaffScreen: React.FC = () => {
  const addNotification = useAppStore((s) => s.addNotification);
  const [activeTab, setActiveTab] = useState<TabId>('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [empLoading, setEmpLoading] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setEmpLoading(true);
    try {
      const data = await api.getEmployees();
      setEmployees(data);
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Failed to load employees.', 'error');
    } finally {
      setEmpLoading(false);
    }
  }, [addNotification]);

  const fetchRoles = useCallback(async () => {
    try {
      const data = await api.getRoles();
      setRoles(data.map((r: any) => ({ id: r.id, name: r.name })));
    } catch {
      // roles are optional, silently fail
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, [fetchEmployees, fetchRoles]);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'employees', label: 'Employees' },
    { id: 'attendance', label: 'Attendance' },
  ];

  return (
    <PageWrapper className="h-full overflow-y-auto bg-[#F4F2F0]">
      <div className="p-6 pb-24 md:pb-6">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FF7A10]/10 border border-[#FF7A10]/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#FF7A10]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#1F221D] tracking-tight">Staff Management</h1>
            <p className="text-xs text-[#555754] font-medium mt-0.5">Manage employees and attendance records</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-[#FF7A10] text-white'
                  : 'bg-white text-[#555754] border border-[#1F221D]/10 hover:bg-[#ECEAE7] hover:text-[#1F221D]'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'employees' && (
          <EmployeesTab employees={employees} roles={roles} isLoading={empLoading} onReload={fetchEmployees} />
        )}
        {activeTab === 'attendance' && (
          <AttendanceTab employees={employees} />
        )}
      </div>
    </PageWrapper>
  );
};

export default StaffScreen;
