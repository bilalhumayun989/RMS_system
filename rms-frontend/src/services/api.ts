import { Customer, Expense, KitchenOrder, KitchenStatus, MenuCategory, MenuItem, OrderStatus, OrderType, RecentOrder, Supply, SupplyLog, Table, TableStatus, AttendanceLog, Employee } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

type LoginRole = 'staff' | 'admin' | 'kitchen';

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

export const api = {
  login: (payload: { type: 'admin' | 'employee'; pin?: string; email?: string; password?: string }) =>
    request<{ message: string; role: string; screen: string; permissions: string[] }>('/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMenuItems: async () => (await request<BackendMenuItem[]>('/menu-items')).map(mapMenuItem),

  createMenuItem: async (payload: {
    name: string; category: string; price: number;
    emoji?: string; prep_time?: string; popular?: boolean;
    description?: string; image?: string; discount?: number;
  }) => mapMenuItem(await request<BackendMenuItem>('/menu-items', { method: 'POST', body: JSON.stringify(payload) })),

  updateMenuItem: async (id: number, payload: Partial<{
    name: string; category: string; price: number;
    emoji: string; prep_time: string; popular: boolean;
    description: string; image: string; discount: number;
    is_available: boolean;
  }>) => mapMenuItem(await request<BackendMenuItem>(`/menu-items/${id}`, { method: 'PUT', body: JSON.stringify(payload) })),

  deleteMenuItem: async (id: number) => request<{ message: string }>(`/menu-items/${id}`, { method: 'DELETE' }),

  getTables: async () => (await request<BackendTable[]>('/tables')).map(mapTable),

  createTable: async (payload: { seats: number; section: string; status?: string }) =>
    mapTable(await request<BackendTable>('/tables', { method: 'POST', body: JSON.stringify(payload) })),

  deleteTable: async (id: number) =>
    request<{ message: string }>(`/tables/${id}`, { method: 'DELETE' }),

  updateTable: async (id: number, payload: Partial<{
    seats: number;
    section: string;
    status: TableStatus;
    current_order_code: string | null;
    amount: number | null;
    duration: number | null;
    reserved_for: string | null;
    guest_name: string | null;
  }>) => mapTable(await request<BackendTable>(`/tables/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })),

  getOrders: async () => (await request<BackendOrder[]>('/orders')).map(mapRecentOrder),

  createOrder: async (payload: {
    restaurant_table_id: number | null;
    order_type: OrderType;
    items: { menu_item_id: number; quantity: number }[];
  }) => request<BackendOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  getKitchenOrders: async () => (await request<BackendKitchenOrder[]>('/kitchen-orders')).map(mapKitchenOrder),

  updateKitchenOrder: async (id: string, status: KitchenStatus) => {
    return mapKitchenOrder(await request<BackendKitchenOrder>(`/kitchen-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }));
  },

  deleteKitchenOrder: async (id: string) => {
    try {
      await request<{ message: string }>(`/kitchen-orders/${id}`, { method: 'DELETE' });
    } catch (err: any) {
      // 404 = already deleted (cascade or race) — treat as success
      if (err?.status === 404) return;
      throw err;
    }
  },

  getRoles: async () => request<any[]>('/roles'),
  createRole: async (payload: any) => request<any>('/roles', { method: 'POST', body: JSON.stringify(payload) }),
  updateRole: async (id: number, payload: any) => request<any>(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteRole: async (id: number) => request<{ message: string }>(`/roles/${id}`, { method: 'DELETE' }),

  getEmployees: async () => (await request<BackendEmployee[]>('/employees')).map(mapEmployee),
  createEmployee: async (payload: any) => mapEmployee(await request<BackendEmployee>('/employees', { method: 'POST', body: JSON.stringify(payload) })),
  updateEmployee: async (id: number, payload: any) => mapEmployee(await request<BackendEmployee>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(payload) })),
  deleteEmployee: async (id: number) => request<{ message: string }>(`/employees/${id}`, { method: 'DELETE' }),

  getAttendanceLogs: async (filters?: { employee_id?: number; date?: string }) => {
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
  }) => mapAttendanceLog(await request<BackendAttendanceLog>('/attendance', { method: 'POST', body: JSON.stringify(payload) })),

  updateAttendanceLog: async (id: number, payload: Partial<{
    employee_id: number;
    date: string;
    check_in: string;
    check_out: string;
    status: 'present' | 'absent' | 'late' | 'half-day';
    notes: string;
  }>) => mapAttendanceLog(await request<BackendAttendanceLog>(`/attendance/${id}`, { method: 'PUT', body: JSON.stringify(payload) })),

  deleteAttendanceLog: async (id: number) => request<{ message: string }>(`/attendance/${id}`, { method: 'DELETE' }),

  getCustomers: async () => (await request<BackendCustomer[]>('/customers')).map(mapCustomer),
  createCustomer: async (payload: { name: string; phone?: string; email?: string; notes?: string }) =>
    mapCustomer(await request<BackendCustomer>('/customers', { method: 'POST', body: JSON.stringify(payload) })),
  updateCustomer: async (id: number, payload: Partial<{ name: string; phone: string; email: string; notes: string }>) =>
    mapCustomer(await request<BackendCustomer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(payload) })),
  deleteCustomer: async (id: number) => request<{ message: string }>(`/customers/${id}`, { method: 'DELETE' }),

  // ─── Order History ──────────────────────────────────────────────────────────
  getOrderHistory: async (filters?: { from?: string; to?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);
    if (filters?.status) params.set('status', filters.status);
    const qs = params.toString();
    return (await request<BackendOrder[]>(`/orders${qs ? `?${qs}` : ''}`)).map(mapRecentOrder);
  },

  // ─── Expenses ───────────────────────────────────────────────────────────────
  getExpenses: async (filters?: { from?: string; to?: string; category?: string }) => {
    const params = new URLSearchParams();
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);
    if (filters?.category) params.set('category', filters.category);
    const qs = params.toString();
    return (await request<BackendExpense[]>(`/expenses${qs ? `?${qs}` : ''}`)).map(mapExpense);
  },

  createExpense: async (payload: { title: string; amount: number; category: string; date: string; notes?: string }) =>
    mapExpense(await request<BackendExpense>('/expenses', { method: 'POST', body: JSON.stringify(payload) })),

  updateExpense: async (id: number, payload: Partial<{ title: string; amount: number; category: string; date: string; notes: string }>) =>
    mapExpense(await request<BackendExpense>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(payload) })),

  deleteExpense: async (id: number) => request<{ message: string }>(`/expenses/${id}`, { method: 'DELETE' }),

  // ─── Supplies ──────────────────────────────────────────────────────────────
  getSupplies: async (filters?: { category?: string; low_stock?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.low_stock) params.set('low_stock', '1');
    const qs = params.toString();
    return request<Supply[]>(`/supplies${qs ? `?${qs}` : ''}`);
  },

  createSupply: async (payload: {
    name: string; unit: string; quantity: number; min_quantity?: number;
    unit_cost?: number; supplier?: string; category: string; notes?: string; is_active?: boolean;
  }) => request<Supply>('/supplies', { method: 'POST', body: JSON.stringify(payload) }),

  updateSupply: async (id: number, payload: Partial<{
    name: string; unit: string; quantity: number; min_quantity: number;
    unit_cost: number; supplier: string; category: string; notes: string; is_active: boolean;
  }>) => request<Supply>(`/supplies/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  deleteSupply: async (id: number) => request<{ message: string }>(`/supplies/${id}`, { method: 'DELETE' }),

  getSupplyLogs: async (supplyId: number) =>
    request<SupplyLog[]>(`/supplies/${supplyId}/logs`),

  addSupplyLog: async (supplyId: number, payload: {
    type: 'purchase' | 'usage' | 'adjustment';
    quantity: number; unit_cost?: number; date: string; notes?: string;
  }) => request<{ log: SupplyLog; supply: Supply }>(`/supplies/${supplyId}/logs`, {
    method: 'POST', body: JSON.stringify(payload),
  }),

  deleteSupplyLog: async (supplyId: number, logId: number) =>
    request<{ message: string; supply: Supply }>(`/supplies/${supplyId}/logs/${logId}`, { method: 'DELETE' }),
};
