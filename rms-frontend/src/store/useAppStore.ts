import { create } from 'zustand';
import { Screen } from '../constants/routes';

type UserRole = 'employee' | 'admin' | string;

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: Date;
}

interface AppState {
  userRole: UserRole | null;
  userName: string | null;
  userRoleName: string | null;
  setUserRole: (role: UserRole, permissions?: string[], token?: string, userName?: string, userRoleName?: string) => void;

  isDemoMode: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  resetDemoData: () => void;

  activeScreen: Screen;
  sidebarCollapsed: boolean;
  selectedTableId: number | null;
  notifications: Notification[];
  permissions: string[];
  token: string | null;

  setScreen: (screen: Screen) => void;
  setPermissions: (permissions: string[]) => void;
  logout: () => void;
  toggleSidebar: () => void;

  addNotification: (
    message: string,
    type?: Notification['type']
  ) => void;

  clearNotification: (id: string) => void;
}

interface StoredSession {
  userRole: UserRole | string;
  activeScreen: Screen;
  permissions: string[];
  token: string | null;
  userName: string | null;
  userRoleName: string | null;
  isDemoMode?: boolean;
}

const SESSION_KEY = 'rms_session';
const DEMO_MODE_KEY = 'rms_is_demo_mode';
const COOKIE_MAX_AGE = 60 * 60 * 12;

const defaultScreenForRole = (role: UserRole | string): Screen => {
  if (role === 'admin') return 'dashboard';
  return 'tables';
};

const isBrowser = () => typeof window !== 'undefined';

const readStoredSession = (): StoredSession | null => {
  if (!isBrowser()) return null;

  try {
    const rawSession =
      window.localStorage.getItem(SESSION_KEY) ??
      document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${SESSION_KEY}=`))
        ?.split('=')[1];
    if (!rawSession) return null;

    const session = JSON.parse(decodeURIComponent(rawSession)) as Partial<StoredSession>;
    if (!session.userRole) return null;

    return {
      userRole: session.userRole,
      activeScreen: session.activeScreen ?? defaultScreenForRole(session.userRole),
      permissions: session.permissions ?? [],
      token: session.token ?? null,
      userName: session.userName ?? null,
      userRoleName: session.userRoleName ?? null,
      isDemoMode: Boolean(session.isDemoMode ?? window.localStorage.getItem(DEMO_MODE_KEY)),
    };
  } catch {
    return null;
  }
};

const writeStoredSession = (session: StoredSession) => {
  if (!isBrowser()) return;

  const serialized = JSON.stringify(session);
  window.localStorage.setItem(SESSION_KEY, serialized);
  document.cookie = `${SESSION_KEY}=${encodeURIComponent(serialized)}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
  if (session.isDemoMode) {
    window.localStorage.setItem(DEMO_MODE_KEY, 'true');
  } else {
    window.localStorage.removeItem(DEMO_MODE_KEY);
  }
};

const clearStoredSession = () => {
  if (!isBrowser()) return;

  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(DEMO_MODE_KEY);
  document.cookie = `${SESSION_KEY}=; Max-Age=0; Path=/; SameSite=Lax`;
};

const storedSession = readStoredSession();

export const useAppStore = create<AppState>((set, get) => ({
  activeScreen: storedSession?.activeScreen ?? 'login',
  sidebarCollapsed: false,
  selectedTableId: null,
  notifications: [],

  isDemoMode: storedSession?.isDemoMode ?? (isBrowser() && Boolean(window.localStorage.getItem(DEMO_MODE_KEY))),

  userRole: storedSession?.userRole ?? null,
  userName: storedSession?.userName ?? null,
  userRoleName: storedSession?.userRoleName ?? null,
  permissions: storedSession?.permissions ?? [],
  token: storedSession?.token ?? null,

  enableDemoMode: () => {
    const demoSession: StoredSession = {
      userRole: 'admin',
      activeScreen: 'dashboard',
      permissions: ['*'],
      token: 'demo-token',
      userName: 'Owner Administrator',
      userRoleName: 'Owner / Administrator',
      isDemoMode: true,
    };
    writeStoredSession(demoSession);
    set({
      isDemoMode: true,
      userRole: 'admin',
      userName: 'Owner Administrator',
      userRoleName: 'Owner / Administrator',
      permissions: ['*'],
      token: 'demo-token',
      activeScreen: 'dashboard',
    });
  },

  disableDemoMode: () => {
    clearStoredSession();
    set({
      isDemoMode: false,
      activeScreen: 'login',
      userRole: null,
      userName: null,
      userRoleName: null,
      selectedTableId: null,
      notifications: [],
      permissions: [],
      token: null,
    });
  },

  resetDemoData: () => {
    import('../utils/demoStorage').then(({ resetDemoStorage }) => {
      resetDemoStorage();
      get().addNotification('Demo sandbox environment has been reset to defaults.', 'success');
    });
  },

  setUserRole: (role, permissions = [], token, userName, userRoleName) => {
    const session: StoredSession = {
      userRole: role,
      activeScreen: defaultScreenForRole(role),
      permissions,
      token: token ?? null,
      userName: userName ?? null,
      userRoleName: userRoleName ?? null,
      isDemoMode: false,
    };
    writeStoredSession(session);
    set({ isDemoMode: false, userRole: role, permissions, token: token ?? null, userName: userName ?? null, userRoleName: userRoleName ?? null });
  },

  setPermissions: (permissions) => {
    const currentSession = readStoredSession();
    if (currentSession) {
      writeStoredSession({ ...currentSession, permissions });
    }
    set({ permissions });
  },

  setScreen: (screen) =>
    set((state) => {
      if (screen === 'login') {
        clearStoredSession();
        return {
          isDemoMode: false,
          activeScreen: screen,
          userRole: null,
          userName: null,
          userRoleName: null,
          selectedTableId: null,
          token: null,
          permissions: [],
        };
      }

      if (state.userRole) {
        writeStoredSession({
          userRole: state.userRole,
          activeScreen: screen,
          permissions: state.permissions,
          token: state.token,
          userName: state.userName,
          userRoleName: state.userRoleName,
          isDemoMode: state.isDemoMode,
        });
      }

      return { activeScreen: screen };
    }),

  logout: () => {
    clearStoredSession();
    set({
      isDemoMode: false,
      activeScreen: 'login',
      userRole: null,
      userName: null,
      userRoleName: null,
      selectedTableId: null,
      notifications: [],
      permissions: [],
      token: null,
    });
  },

  toggleSidebar: () =>
    set((state) => ({
      sidebarCollapsed: !state.sidebarCollapsed,
    })),

  addNotification: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);

    const newNotification: Notification = {
      id,
      message,
      type,
      createdAt: new Date(),
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 4000);
  },

  clearNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));

export default useAppStore;

