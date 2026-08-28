import { create } from 'zustand';
import { api } from '../services/api';

type UserRole = 'staff' | 'admin' | 'kitchen';

interface AuthState {
  loginError: string;
  isLoggingIn: boolean;
  login: (type: 'admin' | 'employee', credentials: { pin?: string; email?: string; password?: string }) => Promise<{ screen: string; permissions: string[]; token: string; name: string; role_name: string; } | null>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  loginError: '',
  isLoggingIn: false,
  login: async (type, credentials) => {
    set({ isLoggingIn: true, loginError: '' });
    try {
      const result = await api.login({ type, ...credentials });
      set({ isLoggingIn: false, loginError: '' });
      return { screen: result.screen, permissions: result.permissions, token: result.token, name: result.name, role_name: result.role_name };
    } catch (error) {
      set({
        isLoggingIn: false,
        loginError: error instanceof Error ? error.message : 'Login failed.',
      });
      return null;
    }
  },
  clearError: () => set({ loginError: '' }),
}));

export type { UserRole };
