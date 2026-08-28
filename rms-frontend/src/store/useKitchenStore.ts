import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { KitchenOrder, KitchenStatus } from '../types';
import { MOCK_KITCHEN_ORDERS } from '../constants/mockData';
import { api } from '../services/api';

interface KitchenStore {
  orders: KitchenOrder[];
  isLoading: boolean;
  error: string;
  fetchKitchenOrders: () => Promise<void>;
  addOrder: (order: KitchenOrder) => void;
  updateOrderStatus: (id: string, status: KitchenStatus) => Promise<void>;
  removeOrder: (id: string) => Promise<void>;
}

export const useKitchenStore = create<KitchenStore>()(
  persist(
    (set, get) => ({
      orders: MOCK_KITCHEN_ORDERS,
      isLoading: false,
      error: '',

      fetchKitchenOrders: async () => {
        // Don't clobber in-flight optimistic updates
        if (get().isLoading) return;
        set({ isLoading: true, error: '' });
        try {
          const data = await api.getKitchenOrders();
          set({ orders: data, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Could not load kitchen orders.',
          });
        }
      },

  addOrder: (order) =>
    set((state) => ({ orders: [order, ...state.orders] })),

  updateOrderStatus: async (id, status) => {
    // Optimistic update — move card immediately, no bounce
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id ? { ...order, status } : order
      ),
    }));
    try {
      // Persist to backend silently — don't overwrite local state with response
      await api.updateKitchenOrder(id, status);
    } catch (error) {
      // On failure, revert the optimistic update
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === id ? { ...order, status: order.status } : order
        ),
        error: error instanceof Error ? error.message : 'Could not update kitchen order.',
      }));
    }
  },

      removeOrder: async (id) => {
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== id),
        }));
        try {
          await api.deleteKitchenOrder(id);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Could not remove kitchen order.' });
        }
      },
    }),
    {
      name: 'kitchen-storage',
      partialize: (state) => ({ orders: state.orders }),
    }
  )
);

export default useKitchenStore;
