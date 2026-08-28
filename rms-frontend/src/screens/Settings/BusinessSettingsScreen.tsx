import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { api } from '../../services/api';
import { Shield, Users, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface Role {
  id: number;
  name: string;
  permissions: string[];
  employees_count?: number;
}

interface Employee {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role_id: number | null;
  pin: string | null;
  is_active: boolean;
  role?: Role;
}

const AVAILABLE_PERMISSIONS = [
  { id: '/dashboard', label: 'Dashboard View' },
  { id: '/tables', label: 'Tables Map & Management' },
  { id: '/order', label: 'Create Orders' },
  { id: '/kitchen', label: 'Kitchen Board Access' },
  { id: '/payment', label: 'Process Payments' },
  { id: '/settings', label: 'Business Settings (Admin Only)' }
];

const inputBase = 'w-full bg-[#F4F2F0] border border-[#1F221D]/12 rounded-xl px-4 py-2.5 text-[#1F221D] outline-none focus:border-[#FF7A10]/50 focus:bg-white text-sm transition-all';

export const BusinessSettingsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'employees'>('roles');
  const [roles, setRoles] = useState<Role[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [editingRole, setEditingRole] = useState<Partial<Role> | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedRoles, fetchedEmployees] = await Promise.all([api.getRoles(), api.getEmployees()]);
      setRoles(fetchedRoles); setEmployees(fetchedEmployees);
    } catch { toast.error('Failed to load settings data.'); }
    finally { setLoading(false); }
  };

  const saveRole = async () => {
    if (!editingRole?.name) return toast.error('Role name is required.');
    try {
      if (editingRole.id) { await api.updateRole(editingRole.id, editingRole); toast.success('Role updated successfully.'); }
      else { await api.createRole({ ...editingRole, permissions: editingRole.permissions || [] }); toast.success('Role created successfully.'); }
      setEditingRole(null); fetchData();
    } catch (err: any) { toast.error(err.message || 'Failed to save role.'); }
  };

  const deleteRole = async (id: number) => {
    try { await api.deleteRole(id); toast.success('Role deleted.'); fetchData(); }
    catch (err: any) { toast.error(err.message || 'Failed to delete role.'); }
  };

  const saveEmployee = async () => {
    if (!editingEmployee?.name) return toast.error('Employee name is required.');
    try {
      if (editingEmployee.id) { await api.updateEmployee(editingEmployee.id, editingEmployee); toast.success('Employee updated successfully.'); }
      else { await api.createEmployee(editingEmployee); toast.success('Employee created successfully.'); }
      setEditingEmployee(null); fetchData();
    } catch (err: any) { toast.error(err.message || 'Failed to save employee.'); }
  };

  const deleteEmployee = async (id: number) => {
    try { await api.deleteEmployee(id); toast.success('Employee deleted.'); fetchData(); }
    catch (err: any) { toast.error(err.message || 'Failed to delete employee.'); }
  };

  const togglePermission = (permId: string) => {
    if (!editingRole) return;
    const perms = editingRole.permissions || [];
    setEditingRole({ ...editingRole, permissions: perms.includes(permId) ? perms.filter(p => p !== permId) : [...perms, permId] });
  };

  return (
    <PageWrapper className="p-6 md:p-8 bg-[#F4F2F0] min-h-full overflow-y-auto pb-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[rgba(255,122,16,0.08)] flex items-center justify-center border border-[#FF7A10]/20 text-[#FF7A10]">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[#1F221D] tracking-tight">Business Settings</h1>
          <p className="text-sm text-[#555754] font-medium">Manage roles, permissions, and employees</p>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-[#1F221D]/10 mb-6">
        {(['roles', 'employees'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold transition-colors relative capitalize ${activeTab === tab ? 'text-[#FF7A10]' : 'text-[#555754] hover:text-[#1F221D]'}`}>
            {tab === 'roles' ? 'Role Management' : 'Staff & Employees'}
            {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF7A10] rounded-t-full" />}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-2 border-[#FF7A10] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'roles' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-3">
                <button onClick={() => setEditingRole({ name: '', permissions: [] })}
                  className="w-full py-3.5 bg-white border border-dashed border-[#1F221D]/12 rounded-xl flex items-center justify-center gap-2 text-[#FF7A10] font-semibold text-sm hover:bg-[#F4F2F0] transition-all">
                  <Plus className="w-4 h-4" /> Create New Role
                </button>
                {roles.map(role => (
                  <div key={role.id} className="bg-white border border-[#1F221D]/10 rounded-2xl p-4 flex items-center justify-between hover:bg-[#F4F2F0] transition-all">
                    <div>
                      <h3 className="text-[#1F221D] font-semibold">{role.name}</h3>
                      <p className="text-xs text-[#555754]">{role.employees_count || 0} employees</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingRole(role)} className="p-2 bg-[#F4F2F0] hover:bg-[#ECEAE7] rounded-lg text-[#555754] hover:text-[#1F221D] transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteRole(role.id)} className="p-2 bg-[#C62828]/10 hover:bg-[#C62828]/15 border border-[#C62828]/20 rounded-lg text-[#C62828] transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-2">
                {editingRole ? (
                  <div className="bg-white border border-[#1F221D]/10 rounded-3xl p-6 shadow-card">
                    <h2 className="text-base font-semibold text-[#1F221D] mb-5">{editingRole.id ? 'Edit Role' : 'Create Role'}</h2>
                    <div className="mb-6">
                      <label className="text-xs font-semibold text-[#555754] uppercase tracking-widest mb-2 block">Role Name</label>
                      <input type="text" value={editingRole.name || ''} onChange={e => setEditingRole({ ...editingRole, name: e.target.value })}
                        className={inputBase} placeholder="e.g. Manager" />
                    </div>
                    <label className="text-xs font-semibold text-[#555754] uppercase tracking-widest mb-3 block">Permissions / Screen Access</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                      {AVAILABLE_PERMISSIONS.map(perm => {
                        const isSelected = editingRole.permissions?.includes(perm.id);
                        return (
                          <div key={perm.id} onClick={() => togglePermission(perm.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-[rgba(255,122,16,0.08)] border-[#FF7A10]/30' : 'bg-[#F4F2F0] border-[#1F221D]/10 hover:border-[#1F221D]/20'}`}>
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${isSelected ? 'bg-[#FF7A10] border-[#FF7A10] text-white' : 'border-[#1F221D]/20'}`}>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? 'text-[#FF7A10]' : 'text-[#1F221D]'}`}>{perm.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-end gap-3">
                      <button onClick={() => setEditingRole(null)} className="px-5 py-2.5 rounded-xl font-semibold text-sm text-[#555754] hover:text-[#1F221D] bg-[#F4F2F0] border border-[#1F221D]/10 hover:bg-[#ECEAE7] transition-all">Cancel</button>
                      <button onClick={saveRole} className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-[#FF7A10] hover:bg-[#E86000] transition-all">Save Role</button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-[#1F221D]/12 rounded-3xl opacity-50">
                    <Shield className="w-12 h-12 text-[#555754] mb-4" />
                    <p className="text-[#555754] font-medium">Select a role to edit its permissions or create a new one.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 order-2 xl:order-1">
                <div className="bg-white border border-[#1F221D]/10 rounded-3xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F4F2F0] border-b border-[#1F221D]/06 text-xs uppercase text-[#555754] font-semibold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Employee</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">PIN</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F221D]/06">
                      {employees.map(emp => (
                        <tr key={emp.id} className="hover:bg-[#F4F2F0] transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-[#1F221D]">{emp.name}</p>
                            <p className="text-xs text-[#555754]">{emp.email || 'No email'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-[rgba(255,122,16,0.08)] text-[#FF7A10] border border-[#FF7A10]/20">
                              {emp.role?.name || 'Admin / No Role'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-[#555754]">{emp.pin ? '****' : 'N/A'}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => setEditingEmployee(emp)} className="p-1.5 bg-[#F4F2F0] hover:bg-[#ECEAE7] rounded-lg text-[#555754] hover:text-[#1F221D] transition-colors mr-2">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteEmployee(emp.id)} className="p-1.5 bg-[#C62828]/10 hover:bg-[#C62828]/15 rounded-lg text-[#C62828] transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="xl:col-span-1 order-1 xl:order-2">
                <div className="bg-white border border-[#1F221D]/10 rounded-3xl p-6 shadow-card sticky top-6">
                  <h2 className="text-base font-semibold text-[#1F221D] mb-5 flex items-center justify-between">
                    {editingEmployee?.id ? 'Edit Employee' : 'New Employee'}
                    {editingEmployee && (
                      <button onClick={() => setEditingEmployee(null)} className="p-1 rounded-lg hover:bg-[#ECEAE7] text-[#555754]"><X className="w-4 h-4" /></button>
                    )}
                  </h2>
                  <div className="space-y-4 mb-6">
                    {[
                      { label: 'Full Name', type: 'text', key: 'name', placeholder: '' },
                      { label: 'Email (Optional)', type: 'email', key: 'email', placeholder: '' },
                    ].map(({ label, type, key, placeholder }) => (
                      <div key={key}>
                        <label className="text-xs font-semibold text-[#555754] uppercase tracking-widest mb-1.5 block">{label}</label>
                        <input type={type} value={(editingEmployee as any)?.[key] || ''} placeholder={placeholder}
                          onChange={e => setEditingEmployee({ ...editingEmployee, [key]: e.target.value })}
                          className={inputBase} />
                      </div>
                    ))}
                    <div>
                      <label className="text-xs font-semibold text-[#555754] uppercase tracking-widest mb-1.5 block">Assign Role</label>
                      <select value={editingEmployee?.role_id || ''} onChange={e => setEditingEmployee({ ...editingEmployee, role_id: Number(e.target.value) || null })}
                        className={`${inputBase} appearance-none cursor-pointer`}>
                        <option value="">Select a Role...</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#555754] uppercase tracking-widest mb-1.5 block">Login PIN (4-digits)</label>
                      <input type="text" maxLength={4} value={editingEmployee?.pin || ''}
                        onChange={e => setEditingEmployee({ ...editingEmployee, pin: e.target.value })}
                        className={`${inputBase} font-mono tracking-widest`} />
                    </div>
                  </div>
                  <button onClick={saveEmployee} className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-[#FF7A10] hover:bg-[#E86000] transition-all">
                    {editingEmployee?.id ? 'Update Employee' : 'Create Employee'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
};

export default BusinessSettingsScreen;
