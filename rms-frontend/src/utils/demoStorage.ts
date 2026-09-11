import { Supply, SupplyLog, TableStatus, OrderStatus, KitchenStatus } from '../types';

export const DEMO_STORAGE_KEY = 'rms_demo_sandbox_v1';
export const MAX_DEMO_CREATIONS = 10;

export interface DemoSandboxData {
  creationCount: number;
  creationCounts?: Record<string, number>;
  menuItems: Array<{
    id: number;
    name: string;
    category: string;
    price: number | string;
    emoji?: string | null;
    prep_time?: string | null;
    popular?: boolean | number;
    description?: string | null;
    image?: string | null;
    discount?: number | null;
    is_available?: boolean | number;
  }>;
  tables: Array<{
    id: number;
    seats: number;
    section: string;
    status: TableStatus;
    current_order_code?: string | null;
    amount?: number | string | null;
    duration?: number | null;
    reserved_for?: string | null;
    guest_name?: string | null;
  }>;
  orders: Array<{
    id: number;
    code: string;
    restaurant_table_id?: number | null;
    order_type: 'dine-in' | 'takeaway' | 'delivery';
    status: OrderStatus;
    subtotal: number | string;
    tax: number | string;
    total: number | string;
    created_at?: string;
    items?: Array<{ menu_item_id: number; name: string; quantity: number }>;
  }>;
  kitchenOrders: Array<{
    id: number;
    code: string;
    restaurant_table_id?: number | null;
    status: KitchenStatus;
    estimated_minutes: number;
    created_at?: string;
    items?: Array<{ name: string; quantity: number }>;
  }>;
  customers: Array<{
    id: number;
    name: string;
    phone?: string | null;
    email?: string | null;
    notes?: string | null;
  }>;
  employees: Array<{
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    role_id?: number | null;
    is_active: boolean | number;
    role?: { id: number; name: string } | null;
  }>;
  attendanceLogs: Array<{
    id: number;
    employee_id: number;
    employee?: { name: string };
    date: string;
    check_in?: string | null;
    check_out?: string | null;
    status: 'present' | 'absent' | 'late' | 'half-day';
    notes?: string | null;
  }>;
  expenses: Array<{
    id: number;
    title: string;
    amount: number | string;
    category: string;
    date: string;
    notes?: string | null;
  }>;
  supplies: Supply[];
  supplyLogs: Record<number, SupplyLog[]>;
  roles: Array<{ id: number; name: string }>;
}

const getTodayDate = (): string => new Date().toISOString().slice(0, 10);

const getDefaultDemoData = (): DemoSandboxData => ({
  creationCount: 0,
  creationCounts: {},
  menuItems: [
    {
      id: 101,
      name: 'Demo Signature Package',
      category: 'Main Package',
      price: 29.99,
      emoji: '⭐',
      prep_time: '15 min',
      popular: 1,
      description: 'Single default demo service package for demo environment.',
      discount: 0,
      is_available: 1,
    },
  ],
  tables: [
    {
      id: 101,
      seats: 4,
      section: 'Main Floor',
      status: 'available',
      guest_name: undefined,
      reserved_for: undefined,
    },
  ],
  customers: [
    {
      id: 101,
      name: 'John Demo Client',
      phone: '+1-555-0199',
      email: 'client@demo.com',
      notes: 'Default demo client record',
    },
  ],
  employees: [
    {
      id: 101,
      name: 'Alex Demo Staff',
      email: 'staff@demo.com',
      phone: '+1-555-0100',
      role_id: 1,
      is_active: 1,
      role: { id: 1, name: 'Staff' },
    },
  ],
  attendanceLogs: [
    {
      id: 101,
      employee_id: 101,
      employee: { name: 'Alex Demo Staff' },
      date: getTodayDate(),
      check_in: '09:00 AM',
      status: 'present',
      notes: 'On time',
    },
  ],
  orders: [
    {
      id: 101,
      code: 'DEMO-ORD-101',
      restaurant_table_id: 101,
      order_type: 'dine-in',
      status: 'completed',
      subtotal: 29.99,
      tax: 3.0,
      total: 32.99,
      created_at: new Date().toISOString(),
      items: [
        {
          menu_item_id: 101,
          name: 'Demo Signature Package',
          quantity: 1,
        },
      ],
    },
  ],
  kitchenOrders: [
    {
      id: 101,
      code: 'DEMO-ORD-101',
      restaurant_table_id: 101,
      status: 'ready',
      estimated_minutes: 15,
      created_at: new Date().toISOString(),
      items: [
        {
          name: 'Demo Signature Package',
          quantity: 1,
        },
      ],
    },
  ],
  supplies: [
    {
      id: 101,
      name: 'Demo Supply Item',
      unit: 'kg',
      quantity: 50,
      min_quantity: 10,
      unit_cost: 5.0,
      supplier: 'Demo Supplier',
      category: 'General',
      is_active: true,
      low_stock: false,
    },
  ],
  supplyLogs: {
    101: [],
  },
  expenses: [
    {
      id: 101,
      title: 'Demo Operating Expense',
      amount: 150.0,
      category: 'Utilities',
      date: getTodayDate(),
      notes: 'Default demo expense entry',
    },
  ],
  roles: [
    { id: 1, name: 'Staff' },
    { id: 2, name: 'Manager' },
  ],
});

export const getDemoStorage = (): DemoSandboxData => {
  if (typeof window === 'undefined') return getDefaultDemoData();
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) {
      const defaultData = getDefaultDemoData();
      window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(defaultData));
      return defaultData;
    }
    const parsed = JSON.parse(raw) as Partial<DemoSandboxData>;
    return {
      creationCount: typeof parsed.creationCount === 'number' ? parsed.creationCount : 0,
      creationCounts: parsed.creationCounts ?? {},
      menuItems: parsed.menuItems ?? getDefaultDemoData().menuItems,
      tables: parsed.tables ?? getDefaultDemoData().tables,
      orders: parsed.orders ?? getDefaultDemoData().orders,
      kitchenOrders: parsed.kitchenOrders ?? getDefaultDemoData().kitchenOrders,
      customers: parsed.customers ?? getDefaultDemoData().customers,
      employees: parsed.employees ?? getDefaultDemoData().employees,
      attendanceLogs: parsed.attendanceLogs ?? getDefaultDemoData().attendanceLogs,
      expenses: parsed.expenses ?? getDefaultDemoData().expenses,
      supplies: (parsed.supplies ?? getDefaultDemoData().supplies).map((s) => ({
        ...s,
        low_stock: typeof s.low_stock === 'boolean' ? s.low_stock : (s.quantity <= (s.min_quantity ?? 0)),
      })),
      supplyLogs: parsed.supplyLogs ?? getDefaultDemoData().supplyLogs,
      roles: parsed.roles ?? getDefaultDemoData().roles,
    };
  } catch {
    return getDefaultDemoData();
  }
};

export const saveDemoStorage = (data: DemoSandboxData): void => {
  if (typeof window === 'undefined') return;
  try {
    data.supplies = data.supplies.map((s) => ({
      ...s,
      low_stock: s.quantity <= (s.min_quantity ?? 0),
    }));
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('demo-storage-updated', { detail: data }));
  } catch (err) {
    console.error('Failed to save demo storage:', err);
  }
};

export const checkAndIncrementDemoCreation = (type: string = 'item'): DemoSandboxData => {
  const data = getDemoStorage();
  if (!data.creationCounts) {
    data.creationCounts = {};
  }
  const currentCount = data.creationCounts[type] || 0;
  if (currentCount >= MAX_DEMO_CREATIONS) {
    throw new Error(
      `Demo limit reached (${MAX_DEMO_CREATIONS}/${MAX_DEMO_CREATIONS} ${type}s created)! You cannot create any more of this item type, but you can still create other items.`
    );
  }
  data.creationCounts[type] = currentCount + 1;
  data.creationCount += 1;
  saveDemoStorage(data);
  return data;
};

export const resetDemoStorage = (): DemoSandboxData => {
  const fresh = getDefaultDemoData();
  saveDemoStorage(fresh);
  return fresh;
};
