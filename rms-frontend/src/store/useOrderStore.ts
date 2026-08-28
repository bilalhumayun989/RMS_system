import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem, CartItem, OrderType, RecentOrder } from '../types';
import { MOCK_RECENT_ORDERS } from '../constants/mockData';
import { api } from '../services/api';

interface OrderStore {
  cartItems: CartItem[];
  orders: RecentOrder[];
  menuItems: MenuItem[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string;
  orderType: OrderType;
  tableId: number | null;
  fetchMenuItems: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  addItem: (item: MenuItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  setOrderType: (type: OrderType) => void;
  setTableId: (tableId: number | null) => void;
  sendToKitchen: () => Promise<string | null>;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      orders: MOCK_RECENT_ORDERS,
      menuItems: [],
      isLoading: false,
      isSubmitting: false,
      error: '',
      orderType: 'dine-in',
      tableId: null,

      fetchMenuItems: async () => {
        set({ isLoading: true, error: '' });
        try {
          const data = await api.getMenuItems();
          set({ menuItems: data, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Could not load menu.',
          });
        }
      },

  fetchOrders: async () => {
    try {
      set({ orders: await api.getOrders() });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Could not load orders.' });
    }
  },

  addItem: (item) => {
    set((state) => {
      const existing = state.cartItems.find((c) => c.item.id === item.id);
      if (existing) {
        return {
          cartItems: state.cartItems.map((c) =>
            c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
          ),
        };
      }
      return { cartItems: [...state.cartItems, { item, quantity: 1 }] };
    });
  },

  removeItem: (id) =>
    set((state) => ({
      cartItems: state.cartItems.filter((c) => c.item.id !== id),
    })),

  updateQuantity: (id, qty) =>
    set((state) => ({
      cartItems:
        qty <= 0
          ? state.cartItems.filter((c) => c.item.id !== id)
          : state.cartItems.map((c) =>
              c.item.id === id ? { ...c, quantity: qty } : c
            ),
    })),

  setOrderType: (type) => set({ orderType: type }),
  setTableId: (id) => set({ tableId: id }),

  sendToKitchen: async () => {
    const { cartItems, tableId, orderType } = get();
    if (cartItems.length === 0 || tableId === null) return null;

    set({ isSubmitting: true, error: '' });
    try {
      const order = await api.createOrder({
        restaurant_table_id: tableId,
        order_type: orderType,
        items: cartItems.map((cartItem) => ({
          menu_item_id: cartItem.item.id,
          quantity: cartItem.quantity,
        })),
      });

      const newRecentOrder: RecentOrder = {
        id: order.code,
        tableId: order.restaurant_table_id ?? tableId,
        items: cartItems.reduce((acc, c) => acc + c.quantity, 0),
        status: order.status,
        amount: Number(order.total),
        time: 'Just now',
      };

      set((state) => ({
        orders: [newRecentOrder, ...state.orders],
        cartItems: [],
        tableId: null,
        orderType: 'dine-in',
        isSubmitting: false,
      }));

      const [{ useKitchenStore }, { useTableStore }] = await Promise.all([
        import('./useKitchenStore'),
        import('./useTableStore'),
      ]);
      await Promise.all([
        useKitchenStore.getState().fetchKitchenOrders(),
        useTableStore.getState().fetchTables(),
      ]);

      return order.code;
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Could not create order.',
      });
      return null;
    }
  },

  clearCart: () =>
    set({
      cartItems: [],
      tableId: null,
      orderType: 'dine-in',
    }),

  getSubtotal: () =>
    get().cartItems.reduce((acc, c) => acc + c.item.price * c.quantity, 0),

  getTax: () => Number((get().getSubtotal() * 0.1).toFixed(2)),

      getTotal: () => get().getSubtotal() + get().getTax(),
    }),
    {
      name: 'order-storage',
      partialize: (state) => ({
        cartItems: state.cartItems,
        orders: state.orders,
        menuItems: state.menuItems,
        orderType: state.orderType,
        tableId: state.tableId,
      }),
    }
  )
);

export default useOrderStore;
