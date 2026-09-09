import { Customer, Expense, KitchenOrder, KitchenStatus, MenuCategory, MenuItem, OrderStatus, OrderType, RecentOrder, Supply, SupplyLog, Table, TableStatus, AttendanceLog, Employee } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

interface LoginResponse {
  message: string;
  token: string;
  role: string;
  role_name: string;
  name: string;
  screen: string;
  permissions: string[];
}

interface BackendMenuItem {
  id: number;
  name: string;
  category: string;
  price: string | number;
  emoji?: string | null;
  prep_time?: string | null;
  popular?: boolean | number;
  description?: string | null;
  image?: string | null;
  discount?: number | null;
  is_available?: boolean | number;
}

interface BackendTable {
  id: number;
  seats: number;
  section: string;
  status: TableStatus;
  current_order_code?: string | null;
  amount?: string | number | null;
  duration?: number | null;
  reserved_for?: string | null;
  guest_name?: string | null;
}

interface BackendOrderItem {
  menu_item_id: number;
  name: string;
  quantity: number;
}

interface BackendOrder {
  id: number;
  code: string;
  restaurant_table_id?: number | null;
  order_type: OrderType;
  status: OrderStatus;
  subtotal: string | number;
  tax: string | number;
  total: string | number;
  created_at?: string;
  items?: BackendOrderItem[];
}

interface BackendKitchenOrderItem {
  name: string;
  quantity: number;
}

interface BackendKitchenOrder {
  id: number;
  code: string;
  restaurant_table_id?: number | null;
  status: KitchenStatus;
  estimated_minutes: number;
  created_at?: string;
  items?: BackendKitchenOrderItem[];
}

import { useAppStore } from '../store/useAppStore';

const asNumber = (value: string | number | null | undefined) => Number(value ?? 0);

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = useAppStore.getState().token;
  
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(data.message ?? 'Backend request failed.') as Error & { status: number };
    err.status = response.status;
    throw err;
  }

  return data as T;
};

export const mapMenuItem = (item: BackendMenuItem): MenuItem => ({
  id: item.id,
  name: item.name,
  category: item.category as MenuCategory,
  price: asNumber(item.price),
  emoji: item.emoji || 'item',
  prepTime: item.prep_time || '10 min',
  popular: Boolean(item.popular),
  description: item.description ?? undefined,
  image: item.image ?? undefined,
  discount: item.discount ?? undefined,
});

export const mapTable = (table: BackendTable): Table => ({
  id: table.id,
  seats: table.seats,
  section: table.section,
  status: table.status,
  orderId: table.current_order_code ?? undefined,
  amount: table.amount == null ? undefined : asNumber(table.amount),
  duration: table.duration ?? undefined,
  reservedFor: table.reserved_for ?? undefined,
  guestName: table.guest_name ?? undefined,
});

export const mapRecentOrder = (order: BackendOrder): RecentOrder => ({
  id: order.code,
  tableId: order.restaurant_table_id ?? 0,
  items: order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
  status: order.status,
  amount: asNumber(order.total),
  time: order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
});

export const mapKitchenOrder = (order: BackendKitchenOrder): KitchenOrder => ({
  id: String(order.id),
  tableId: order.restaurant_table_id ?? 0,
  items: order.items?.map((item) => ({ name: item.name, qty: item.quantity })) ?? [],
  status: order.status,
  createdAt: order.created_at ? new Date(order.created_at) : new Date(),
  estimatedMinutes: order.estimated_minutes,
});

interface BackendCustomer {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
}

export const mapCustomer = (c: BackendCustomer): Customer => ({
  id: c.id,
  name: c.name,
  phone: c.phone ?? undefined,
  email: c.email ?? undefined,
  notes: c.notes ?? undefined,
});

// ─── Attendance ───────────────────────────────────────────────────────────────

interface BackendAttendanceLog {
  id: number;
  employee_id: number;
  employee?: { name: string };
  date: string;
  check_in?: string | null;
  check_out?: string | null;
  status: 'present' | 'absent' | 'late' | 'half-day';
  notes?: string | null;
}

export const mapAttendanceLog = (log: BackendAttendanceLog): AttendanceLog => ({
  id: log.id,
  employee_id: log.employee_id,
  employeeName: log.employee?.name,
  date: log.date,
  check_in: log.check_in ?? undefined,
  check_out: log.check_out ?? undefined,
  status: log.status,
  notes: log.notes ?? undefined,
});

// ─── Employee mapper ──────────────────────────────────────────────────────────

interface BackendEmployee {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  role_id?: number | null;
  is_active: boolean | number;
  role?: { id: number; name: string } | null;
}

export const mapEmployee = (e: BackendEmployee): Employee => ({
  id: e.id,
  name: e.name,
  email: e.email ?? undefined,
  phone: e.phone ?? undefined,
  role_id: e.role_id ?? undefined,
  is_active: Boolean(e.is_active),
  role: e.role ? { id: e.role.id, name: e.role.name } : undefined,
});

// ─── Expenses ─────────────────────────────────────────────────────────────────

interface BackendExpense {
  id: number;
  title: string;
  amount: string | number;
  category: string;
  date: string;
  notes?: string | null;
}

export const mapExpense = (e: BackendExpense): Expense => ({
  id: e.id,
  title: e.title,
  amount: asNumber(e.amount),
  category: e.category,
  date: typeof e.date === 'string' ? e.date.slice(0, 10) : String(e.date),
  notes: e.notes ?? undefined,
});

import { getDemoStorage, saveDemoStorage, checkAndIncrementDemoCreation } from '../utils/demoStorage';

const isDemoMode = () => useAppStore.getState().isDemoMode;

export const api = {
  login: async (payload: { type: 'admin' | 'employee'; pin?: string; email?: string; password?: string }) => {
    if (isDemoMode()) {
      return {
        message: 'Demo login successful',
        token: 'demo-token',
        role: 'admin',
        role_name: 'Demo Administrator',
        name: 'Demo Admin',
        screen: 'dashboard',
        permissions: ['*'],
      };
    }
    return request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMenuItems: async () => {
    if (isDemoMode()) {
      return getDemoStorage().menuItems.map(mapMenuItem);
    }
    return (await request<BackendMenuItem[]>('/menu-items')).map(mapMenuItem);
  },

  createMenuItem: async (payload: {
    name: string; category: string; price: number;
    emoji?: string; prep_time?: string; popular?: boolean;
    description?: string; image?: string; discount?: number;
  }) => {
    if (isDemoMode()) {
      const data = checkAndIncrementDemoCreation();
      const newItem = {
        id: Date.now(),
        name: payload.name,
        category: payload.category,
        price: payload.price,
        emoji: payload.emoji ?? '⭐',
        prep_time: payload.prep_time ?? '10 min',
        popular: payload.popular ?? false,
        description: payload.description,
        image: payload.image,
        discount: payload.discount,
        is_available: 1,
      };
      data.menuItems.push(newItem);
      saveDemoStorage(data);
      return mapMenuItem(newItem);
    }
    return mapMenuItem(await request<BackendMenuItem>('/menu-items', { method: 'POST', body: JSON.stringify(payload) }));
  },

  updateMenuItem: async (id: number, payload: Partial<{
    name: string; category: string; price: number;
    emoji: string; prep_time: string; popular: boolean;
    description: string; image: string; discount: number;
    is_available: boolean;
  }>) => {
    if (isDemoMode()) {
      const data = getDemoStorage();
      const index = data.menuItems.findIndex((i) => i.id === id);
      if (index !== -1) {
        data.menuItems[index] = { ...data.menuItems[index], ...payload };
        saveDemoStorage(data);
        return mapMenuItem(data.menuItems[index]);
      }
    }
    return mapMenuItem(await request<BackendMenuItem>(`/menu-items/${id}`, { method: 'PUT', body: JSON.stringify(payload) }));
  },

  deleteMenuItem: async (id: number) => {
    if (isDemoMode()) {
      const data = getDemoStorage();
      data.menuItems = data.menuItems.filter((i) => i.id !== id);
      saveDemoStorage(data);
      return { message: 'Deleted' };
    }
    return request<{ message: string }>(`/menu-items/${id}`, { method: 'DELETE' });
  },

  getTables: async () => {
    if (isDemoMode()) {
      return getDemoStorage().tables.map(mapTable);
    }
    return (await request<BackendTable[]>('/tables')).map(mapTable);
  },

  createTable: async (payload: { seats: number; section: string; status?: string }) => {
    if (isDemoMode()) {
      const data = checkAndIncrementDemoCreation();
      const newTable = {
        id: Date.now(),
        seats: payload.seats,
        section: payload.section,
        status: (payload.status as TableStatus) || 'available',
      };
      data.tables.push(newTable);
      saveDemoStorage(data);
      return mapTable(newTable);
    }
    return mapTable(await request<BackendTable>('/tables', { method: 'POST', body: JSON.stringify(payload) }));
  },

  deleteTable: async (id: number) => {
    if (isDemoMode()) {
      const data = getDemoStorage();
      data.tables = data.tables.filter((t) => t.id !== id);
      saveDemoStorage(data);
      return { message: 'Deleted' };
    }
    return request<{ message: string }>(`/tables/${id}`, { method: 'DELETE' });
  },

  updateTable: async (id: number, payload: Partial<{
    seats: number;
    section: string;
    status: TableStatus;
    current_order_code: string | null;
    amount: number | null;
    duration: number | null;
    reserved_for: string | null;
    guest_name: string | null;
  }>) => {
    if (isDemoMode()) {
      const data = getDemoStorage();
      const index = data.tables.findIndex((t) => t.id === id);
      if (index !== -1) {
        data.tables[index] = { ...data.tables[index], ...payload };
        if (payload.status === 'available') {
          data.kitchenOrders = data.kitchenOrders.filter((k) => k.restaurant_table_id !== id);
          data.tables[index].current_order_code = null;
          data.tables[index].amount = null;
          data.tables[index].duration = null;
        }
        saveDemoStorage(data);
        return mapTable(data.tables[index]);
      }
    }
    return mapTable(await request<BackendTable>(`/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }));
  },

  getOrders: async () => {
    if (isDemoMode()) {
      return getDemoStorage().orders.map(mapRecentOrder);
    }
    return (await request<BackendOrder[]>('/orders')).map(mapRecentOrder);
  },

  createOrder: async (payload: {
    restaurant_table_id: number | null;
    order_type: OrderType;
    items: { menu_item_id: number; quantity: number }[];
  }) => {
    if (isDemoMode()) {
      const data = checkAndIncrementDemoCreation();
      const code = `DEMO-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      let subtotal = 0;
      const orderItems = payload.items.map((pi) => {
        const found = data.menuItems.find((m) => m.id === pi.menu_item_id);
        const name = found?.name || 'Menu Item';
        const price = Number(found?.price || 0);
        subtotal += price * pi.quantity;
        return { menu_item_id: pi.menu_item_id, name, quantity: pi.quantity };
      });
      const tax = Number((subtotal * 0.1).toFixed(2));
      const total = Number((subtotal + tax).toFixed(2));
      const newOrder = {
        id: Date.now(),
        code,
        restaurant_table_id: payload.restaurant_table_id,
        order_type: payload.order_type,
        status: 'waiting' as OrderStatus,
        subtotal,
        tax,
        total,
        created_at: new Date().toISOString(),
        items: orderItems,
      };
      data.orders.unshift(newOrder);

      const newKitchenOrder = {
        id: Date.now() + 1,
        code,
        restaurant_table_id: payload.restaurant_table_id,
        status: 'new' as KitchenStatus,
        estimated_minutes: 15,
        created_at: new Date().toISOString(),
        items: orderItems.map((i) => ({ name: i.name, quantity: i.quantity })),
      };
      data.kitchenOrders.unshift(newKitchenOrder);

      if (payload.restaurant_table_id) {
        const tIndex = data.tables.findIndex((t) => t.id === payload.restaurant_table_id);
        if (tIndex !== -1) {
          data.tables[tIndex].status = 'occupied';
          data.tables[tIndex].current_order_code = code;
          data.tables[tIndex].amount = total;
          data.tables[tIndex].duration = 5;
        }
      }

      saveDemoStorage(data);
      return newOrder as any;
    }
    return request<BackendOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getKitchenOrders: async () => {
    if (isDemoMode()) {
      return getDemoStorage().kitchenOrders.map(mapKitchenOrder);
    }
    return (await request<BackendKitchenOrder[]>('/kitchen-orders')).map(mapKitchenOrder);
  },

  updateKitchenOrder: async (id: string, status: KitchenStatus) => {
    if (isDemoMode()) {
      const data = getDemoStorage();
      const index = data.kitchenOrders.findIndex((k) => String(k.id) === id);
      if (index !== -1) {
        data.kitchenOrders[index].status = status;
        saveDemoStorage(data);
        return mapKitchenOrder(data.kitchenOrders[index]);
      }
    }
    return mapKitchenOrder(await request<BackendKitchenOrder>(`/kitchen-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }));
  },

  deleteKitchenOrder: async (id: string) => {
    if (isDemoMode()) {
      const data = getDemoStorage();
      const kOrder = data.kitchenOrders.find((k) => String(k.id) === id);
      if (kOrder && kOrder.restaurant_table_id) {
        const tIndex = data.tables.findIndex((t) => t.id === kOrder.restaurant_table_id);
        if (tIndex !== -1 && data.tables[tIndex].status === 'occupied') {
          data.tables[tIndex].status = 'served';
        }
      }
      data.kitchenOrders = data.kitchenOrders.filter((k) => String(k.id) !== id);
      saveDemoStorage(data);
      return;
    }
    try {
      await request<{ message: string }>(`/kitchen-orders/${id}`, { method: 'DELETE' });
    } catch (err: any) {
      if (err?.status === 404) return;
      throw err;
    }
  },

  getRoles: async () => {
    if (isDemoMode()) {
      return getDemoStorage().roles;
    }
    return request<any[]>('/roles');
  },

  createRole: async (payload: any) => {
    if (isDemoMode()) {
      const data = checkAndIncrementDemoCreation();
      const newRole = { id: Date.now(), name: payload.name };
      data.roles.push(newRole);
      saveDemoStorage(data);
      return newRole;
    }
    return request<any>('/roles', { method: 'POST', body: JSON.stringify(payload) });
  },

  updateRole: async (id: number, payload: any) => {
    if (isDemoMode()) {
      const data = getDemoStorage();
      const index = data.roles.findIndex((r) => r.id === id);
      if (index !== -1) {
        data.roles[index] = { ...data.roles[index], ...payload };
        saveDemoStorage(data);
        return data.roles[index];
      }
    }
    return request<any>(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },

  deleteRole: async (id: number) => {
    if (isDemoMode()) {
      const data = getDemoStorage();
      data.roles = data.roles.filter((r) => r.id !== id);
      saveDemoStorage(data);
      return { message: 'Deleted' };
    }
    return request<{ message: string }>(`/roles/${id}`, { method: 'DELETE' });
  },

  getEmployees: async () => {
    if (isDemoMode()) {
      return getDemoStorage().employees.map(mapEmployee);
    }
    return (await request<BackendEmployee[]>('/employees')).map(mapEmployee);
  },

  createEmployee: async (payload: any) => {
    if (isDemoMode()) {
      const data = checkAndIncrementDemoCreation();
      const newEmployee = {
        id: Date.now(),
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        role_id: payload.role_id ?? 1,
        is_active: payload.is_active ?? 1,
        role: { id: payload.role_id ?? 1, name: 'Staff' },
      };
      data.employees.push(newEmployee);
      saveDemoStorage(data);
      return mapEmployee(newEmployee);
    }
    return mapEmployee(await request<BackendEmployee>('/employees', { method: 'POST', body: JSON.stringify(payload) }));
  },

  updateEmployee: async (id: number, payload: any) => {
    if (isDemoMode()) {
      const data = getDemoStorage();
      const index = data.employees.findIndex((e) => e.id === id);
      if (index !== -1) {
        data.employees[index] = { ...data.employees[index], ...payload };
        saveDemoStorage(data);
        return mapEmployee(data.employees[index]);
      }
    }
    return mapEmployee(await request<BackendEmployee>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(payload) }));
  },

  deleteEmployee: async (id: number) => {
    if (isDemoMode()) {
      const data = getDemoStorage();
      data.employees = data.employees.filter((e) => e.id !== id);
      saveDemoStorage(data);
      return { message: 'Deleted' };
    }
    return request<{ message: string }>(`/employees/${id}`, { method: 'DELETE' });
  },

  getAttendanceLogs: async (filters?: { employee_id?: number; date?: string }) => {
    if (isDemoMode()) {
      let logs = getDemoStorage().attendanceLogs;
      if (filters?.employee_id) logs = logs.filter((l) => l.employee_id === filters.employee_id);
      if (filters?.date) logs = logs.filter((l) => l.date === filters.date);
      return logs.map(mapAttendanceLog);
    }
    const params = new URLSearchParams();
    if (filters?.employee_id != null) params.set('employee_id', String(filters.employee_id));
    if (filters?.date) params.set('date', filters.date);
    const qs = params.toString();
    return (await request<BackendAttendanceLog[]>(`/attendance${qs ? `?${qs}` : ''}`)).map(mapAttendanceLog);
  },

  createAttendanceLog: async (payload: {
    employee_id: number;
    date: string;
    check_in?: string;
    check_out?: string;
    status: 'present' | 'absent' | 'late' | 'half-day';
    notes?: string;
  }) => {
    if (isDemoMode()) {
      const data = checkAndIncrementDemoCreation();
      const emp = data.employees.find((e) => e.id === payload.employee_id);
      const newLog = {
        id: Date.now(),
        employee_id: payload.employee_id,
        employee: { name: emp?.name || 'Staff' },
        date: payload.date,
        check_in: payload.check_in,
        check_out: payload.check_out,
        status: payload.status,
        notes: payload.notes,
      };
      data.attendanceLogs.push(newLog);
      saveDemoStorage(data);
      return mapAttendanceLog(newLog);
    }
    return mapAttendanceLog(await request<BackendAttendanceLog>('/attendance', { method: 'POST', body: JSON.stringify(payload) }));
  },

  updateAttendanceLog: async (id: number, payload: Partial<{
    employee_id: number;
    date: string;
    check_in: string;
    check_out: string;
    status: 'present' | 'absent' | 'late' | 'half-day';
    notes: string;
  }>) => {
    if (isDemoMode()) {
      const data = getDemoStorage();
      const index = data.attendanceLogs.findIndex((a) => a.id === id);
      if (index !== -1) {
        data.attendanceLogs[index] = { ...data.attendanceLogs[index], ...payload };
        saveDemoStorage(data);
        return mapAttendanceLog(data.attendanceLogs[index]);
      }
    }
    return mapAttendanceLog(await request<BackendAttendanceLog>(`/attendance/${id}`, { method: 'PUT', body: JSON.stringify(payload) }));
  },

  deleteAttendanceLog: async (id: number) => {
    if (isDemoMode()) {
      const data = getDemoStorage();
      data.attendanceLogs = data.attendanceLogs.filter((a) => a.id !== id);
      saveDemoStorage(data);
      return { message: 'Deleted' };
    }
    return request<{ message: string }>(`/attendance/${id}`, { method: 'DELETE' });
  },

  getCustomers: async () => {
    if (isDemoMode()) {
      return getDemoStorage().customers.map(mapCustomer);
    }
    return (await request<BackendCustomer[]>('/customers')).map(mapCustomer);
  },

  createCustomer: async (payload: { name: string; phone?: string; email?: string; notes?: string }) => {
    if (isDemoMode()) {
      const data = checkAndIncrementDemoCreation();
      const newCustomer = {
        id: Date.now(),
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        notes: payload.notes,
      };
      data.customers.push(newCustomer);
      saveDemoStorage(data);
      return mapCustomer(newCustomer);
    }
    return mapCustomer(await request<BackendCustomer>('/customers', { method: 'POST', body: JSON.stringify(payload) }));
  },

  updateCustomer: async (id: number, payload: Partial<{ name: string; phone: string; email: string; notes: string }>) => {
    if (isDemoMode()) {
      const data = getDemoStorage();
      const index = data.customers.findIndex((c) => c.id === id);
      if (index !== -1) {
        data.customers[index] = { ...data.customers[index], ...payload };
        saveDemoStorage(data);
        return mapCustomer(data.customers[index]);
      }
    }
    return mapCustomer(await request<BackendCustomer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }));
  },

  deleteCustomer: async (id: number) => {
    if (isDemoMode()) {
      const data = getDemoStorage();
      data.customers = data.customers.filter((c) => c.id !== id);
      saveDemoStorage(data);
      return { message: 'Deleted' };
    }
    return request<{ message: string }>(`/customers/${id}`, { method: 'DELETE' });
  },

  getOrderHistory: async (filters?: { from?: string; to?: string; status?: string }) => {
    if (isDemoMode()) {
      let orders = getDemoStorage().orders;
      if (filters?.status) orders = orders.filter((o) => o.status === filters.status);
      return orders.map(mapRecentOrder);
    }
    const params = new URLSearchParams();
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);
    if (filters?.status) params.set('status', filters.status);
    const qs = params.toString();
    return (await request<BackendOrder[]>(`/orders${qs ? `?${qs}` : ''}`)).map(mapRecentOrder);
  },

  getExpenses: async (filters?: { from?: string; to?: string; category?: string }) => {
    if (isDemoMode()) {
      let expenses = getDemoStorage().expenses;
      if (filters?.category) expenses = expenses.filter((e) => e.category === filters.category);
      return expenses.map(mapExpense);
    }
    const params = new URLSearchParams();
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);
    if (filters?.category) params.set('category', filters.category);
    const qs = params.toString();
    return (await request<BackendExpense[]>(`/expenses${qs ? `?${qs}` : ''}`)).map(mapExpense);
  },

  createExpense: async (payload: { title: string; amount: number; category: string; date: string; notes?: string }) => {
    if (isDemoMode()) {
      const data = checkAndIncrementDemoCreation();
      const newExpense = {
        id: Date.now(),
        title: payload.title,
        amount: payload.amount,
        category: payload.category,
        date: payload.date,
        notes: payload.notes,
      };
      data.expenses.push(newExpense);
      saveDemoStorage(data);
      return mapExpense(newExpense);
    }
    return mapExpense(await request<BackendExpense>('/expenses', { method: 'POST', body: JSON.stringify(payload) }));
  },

  updateExpense: async (id: number, payload: Partial<{ title: string; amount: number; category: string; date: string; notes: string }>) => {
    if (isDemoMode()) {
      const data = getDemoStorage();
      const index = data.expenses.findIndex((e) => e.id === id);
      if (index !== -1) {
        data.expenses[index] = { ...data.expenses[index], ...payload };
        saveDemoStorage(data);
        return mapExpense(data.expenses[index]);
      }
    }
    return mapExpense(await request<BackendExpense>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }));
  },

  deleteExpense: async (id: number) => {
    if (isDemoMode()) {
      const data = getDemoStorage();
      data.expenses = data.expenses.filter((e) => e.id !== id);
      saveDemoStorage(data);
      return { message: 'Deleted' };
    }
    return request<{ message: string }>(`/expenses/${id}`, { method: 'DELETE' });
  },

  getSupplies: async (filters?: { category?: string; low_stock?: boolean }) => {
    if (isDemoMode()) {
      let supplies = getDemoStorage().supplies;
      if (filters?.category) supplies = supplies.filter((s) => s.category === filters.category);
      if (filters?.low_stock) supplies = supplies.filter((s) => s.quantity <= (s.min_quantity ?? 0));
      return supplies;
    }
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.low_stock) params.set('low_stock', '1');
    const qs = params.toString();
    return request<Supply[]>(`/supplies${qs ? `?${qs}` : ''}`);
  },

  createSupply: async (payload: {
    name: string; unit: string; quantity: number; min_quantity?: number;
    unit_cost?: number; supplier?: string; category: string; notes?: string; is_active?: boolean;
  }) => {
    if (isDemoMode()) {
      const data = checkAndIncrementDemoCreation();
      const newSupply: Supply = {
        id: Date.now(),
        name: payload.name,
        unit: payload.unit,
        quantity: payload.quantity,
        min_quantity: payload.min_quantity ?? 10,
        unit_cost: payload.unit_cost ?? 0,
        supplier: payload.supplier,
        category: payload.category,
        notes: payload.notes,
        is_active: payload.is_active ?? true,
        low_stock: payload.quantity <= (payload.min_quantity ?? 10),
      };
      data.supplies.push(newSupply);
      data.supplyLogs[newSupply.id] = [];
      saveDemoStorage(data);
      return newSupply;
    }
    return request<Supply>('/supplies', { method: 'POST', body: JSON.stringify(payload) });
  },

  updateSupply: async (id: number, payload: Partial<{
    name: string; unit: string; quantity: number; min_quantity: number;
    unit_cost: number; supplier: string; category: string; notes: string; is_active: boolean;
  }>) => {
    if (isDemoMode()) {
      const data = getDemoStorage();
      const index = data.supplies.findIndex((s) => s.id === id);
      if (index !== -1) {
        data.supplies[index] = { ...data.supplies[index], ...payload };
        saveDemoStorage(data);
        return data.supplies[index];
      }
    }
    return request<Supply>(`/supplies/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },

  deleteSupply: async (id: number) => {
    if (isDemoMode()) {
      const data = getDemoStorage();
      data.supplies = data.supplies.filter((s) => s.id !== id);
      delete data.supplyLogs[id];
      saveDemoStorage(data);
      return { message: 'Deleted' };
    }
    return request<{ message: string }>(`/supplies/${id}`, { method: 'DELETE' });
  },

  getSupplyLogs: async (supplyId: number) => {
    if (isDemoMode()) {
      return getDemoStorage().supplyLogs[supplyId] || [];
    }
    return request<SupplyLog[]>(`/supplies/${supplyId}/logs`);
  },

  addSupplyLog: async (supplyId: number, payload: {
    type: 'purchase' | 'usage' | 'adjustment';
    quantity: number; unit_cost?: number; date: string; notes?: string;
  }) => {
    if (isDemoMode()) {
      const data = getDemoStorage();
      const log: SupplyLog = {
        id: Date.now(),
        supply_id: supplyId,
        type: payload.type,
        quantity: payload.quantity,
        unit_cost: payload.unit_cost,
        date: payload.date,
        notes: payload.notes,
      };
      if (!data.supplyLogs[supplyId]) data.supplyLogs[supplyId] = [];
      data.supplyLogs[supplyId].unshift(log);

      const supply = data.supplies.find((s) => s.id === supplyId);
      if (supply) {
        if (payload.type === 'purchase') supply.quantity += payload.quantity;
        else if (payload.type === 'usage') supply.quantity = Math.max(0, supply.quantity - payload.quantity);
        else if (payload.type === 'adjustment') supply.quantity = payload.quantity;
      }

      saveDemoStorage(data);
      return { log, supply: supply || ({} as Supply) };
    }
    return request<{ log: SupplyLog; supply: Supply }>(`/supplies/${supplyId}/logs`, {
      method: 'POST', body: JSON.stringify(payload),
    });
  },

  deleteSupplyLog: async (supplyId: number, logId: number) => {
    if (isDemoMode()) {
      const data = getDemoStorage();
      if (data.supplyLogs[supplyId]) {
        data.supplyLogs[supplyId] = data.supplyLogs[supplyId].filter((l) => l.id !== logId);
      }
      const supply = data.supplies.find((s) => s.id === supplyId) || ({} as Supply);
      saveDemoStorage(data);
      return { message: 'Deleted', supply };
    }
    return request<{ message: string; supply: Supply }>(`/supplies/${supplyId}/logs/${logId}`, { method: 'DELETE' });
  },
};
