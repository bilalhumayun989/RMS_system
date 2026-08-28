import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Table, TableStatus } from '../types';
import { MOCK_TABLES } from '../constants/mockData';
import { api } from '../services/api';

interface TableStore {
  tables: Table[];
  isLoading: boolean;
  error: string;
  fetchTables: () => Promise<void>;
  updateTableStatus: (id: number, status: TableStatus, orderId?: string, amount?: number) => Promise<void>;
  getTableById: (id: number) => Table | undefined;
}

export const useTableStore = create<TableStore>()(
  persist(
    (set, get) => ({
      tables: MOCK_TABLES,
      isLoading: false,
      error: '',
      fetchTables: async () => {
        const { tables } = get();
        if (tables.length === 0 || tables === MOCK_TABLES) set({ isLoading: true, error: '' });
        try {
          const data = await api.getTables();
          set({ tables: data, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Could not load tables.',
          });
        }
      },
  updateTableStatus: async (id, status, orderId, amount) => {
    const current = get().getTableById(id);
    if (!current) return;

    // 'served' = food delivered, awaiting payment. Keep orderId/amount.
    const isOccupiedOrServed = status === 'occupied' || status === 'served';

    set((state) => ({
      tables: state.tables.map((table) =>
        table.id === id
          ? {
              ...table,
              status,
              orderId: isOccupiedOrServed ? orderId || table.orderId : undefined,
              amount: isOccupiedOrServed ? (amount !== undefined ? amount : table.amount) : undefined,
              duration: isOccupiedOrServed ? table.duration || 5 : undefined,
            }
          : table
      ),
    }));

    try {
      const updatedTable = await api.updateTable(id, {
        seats: current.seats,
        section: current.section,
        status,
        current_order_code: isOccupiedOrServed ? orderId ?? current.orderId ?? null : null,
        amount: isOccupiedOrServed ? amount ?? current.amount ?? null : null,
        duration: isOccupiedOrServed ? current.duration ?? 5 : null,
        reserved_for: status === 'reserved' ? current.reservedFor ?? null : null,
        guest_name: status === 'reserved' ? current.guestName ?? null : null,
      });
      set((state) => ({
        tables: state.tables.map((table) =>
          table.id === id ? updatedTable : table
        ),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Could not update table.' });
      await get().fetchTables();
    }
  },
      getTableById: (id) => get().tables.find((t) => t.id === id),
    }),
    {
      name: 'table-storage',
      partialize: (state) => ({ tables: state.tables }),
    }
  )
);

export default useTableStore;
