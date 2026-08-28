import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer } from '../types';
import { api } from '../services/api';

interface CustomerStore {
  customers: Customer[];
  isLoading: boolean;
  error: string;
  fetchCustomers: () => Promise<void>;
  createCustomer: (payload: { name: string; phone?: string; email?: string; notes?: string }) => Promise<void>;
  updateCustomer: (id: number, payload: Partial<{ name: string; phone: string; email: string; notes: string }>) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set, get) => ({
      customers: [],
      isLoading: false,
      error: '',

      fetchCustomers: async () => {
        set({ isLoading: true, error: '' });
        try {
          const data = await api.getCustomers();
          set({ customers: data, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Could not load customers.',
          });
        }
      },

      createCustomer: async (payload) => {
        set({ isLoading: true, error: '' });
        try {
          const created = await api.createCustomer(payload);
          set((state) => ({
            customers: [...state.customers, created].sort((a, b) => a.name.localeCompare(b.name)),
            isLoading: false,
          }));
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Could not create customer.',
          });
          throw error;
        }
      },

      updateCustomer: async (id, payload) => {
        // Optimistic update
        set((state) => ({
          customers: state.customers
            .map((c) => (c.id === id ? { ...c, ...payload } : c))
            .sort((a, b) => a.name.localeCompare(b.name)),
        }));
        try {
          const updated = await api.updateCustomer(id, payload);
          set((state) => ({
            customers: state.customers
              .map((c) => (c.id === id ? updated : c))
              .sort((a, b) => a.name.localeCompare(b.name)),
          }));
        } catch (error) {
          // Revert on failure
          await get().fetchCustomers();
          set({ error: error instanceof Error ? error.message : 'Could not update customer.' });
          throw error;
        }
      },

      deleteCustomer: async (id) => {
        // Optimistic removal
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        }));
        try {
          await api.deleteCustomer(id);
        } catch (error) {
          // Revert on failure
          await get().fetchCustomers();
          set({ error: error instanceof Error ? error.message : 'Could not delete customer.' });
          throw error;
        }
      },
    }),
    {
      name: 'customer-storage',
      partialize: (state) => ({ customers: state.customers }),
    }
  )
);

export default useCustomerStore;
