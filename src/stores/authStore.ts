import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Notification } from '../types';
import { authApi, setAuthFunctions } from '../lib/api';
import type { User as ApiUser } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requires2FA: boolean;
  tempEmail: string | null;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  fetchCurrentUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Helper to convert API user to local user type
const mapApiUserToUser = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  email: apiUser.email,
  firstName: apiUser.name.split(' ')[0] || apiUser.name,
  lastName: apiUser.name.split(' ').slice(1).join(' ') || '',
  role: apiUser.role.toLowerCase() as 'client' | 'staff' | 'admin',
  balance: 0,
  createdAt: new Date(apiUser.createdAt),
  lastLogin: new Date(),
  twoFactorEnabled: apiUser.twoFactorEnabled,
  emailVerified: apiUser.emailVerified,
  avatar: apiUser.avatar,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      requires2FA: false,
      tempEmail: null,

      login: async (email: string, password: string, twoFactorCode?: string) => {
        set({ isLoading: true });

        try {
          const response = await authApi.login({ email, password, twoFactorCode });
          
          if (response.success) {
            const { user: apiUser, accessToken, refreshToken } = response.data;
            
            set({
              user: mapApiUserToUser(apiUser),
              token: accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
              requires2FA: false,
              tempEmail: null,
            });
          }
        } catch (error: unknown) {
          set({ isLoading: false });
          
          // Check if 2FA is required
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { data?: { error?: { code?: string } } } };
            if (axiosError.response?.data?.error?.code === '2FA_REQUIRED') {
              set({ requires2FA: true, tempEmail: email });
              return;
            }
          }
          
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });

        try {
          const response = await authApi.register({
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            password: data.password,
          });

          if (response.success) {
            const { user: apiUser, accessToken, refreshToken } = response.data;

            set({
              user: mapApiUserToUser(apiUser),
              token: accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        if (get().token) {
          authApi.logout().catch(console.error);
        }

        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          requires2FA: false,
          tempEmail: null,
        });
      },

      updateUser: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({ token: accessToken, refreshToken });
      },

      fetchCurrentUser: async () => {
        try {
          const response = await authApi.me();
          if (response.success) {
            set({ user: mapApiUserToUser(response.data) });
          }
        } catch (error) {
          // If fetch fails, logout
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Inyectar funciones de autenticación en la API para evitar importación circular
setAuthFunctions({
  getToken: () => useAuthStore.getState().token,
  getRefresh: () => useAuthStore.getState().refreshToken,
  setTokens: (access, refresh) => useAuthStore.getState().setTokens(access, refresh),
  logout: () => useAuthStore.getState().logout(),
});

// Notification Store
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: '1',
      userId: '2',
      type: 'info',
      title: 'Welcome to SerpentixsPay!',
      message: 'Thank you for joining us. Explore our services and get started.',
      read: false,
      createdAt: new Date(),
    },
    {
      id: '2',
      userId: '2',
      type: 'success',
      title: 'Payment Received',
      message: 'Your payment of $29.99 has been processed successfully.',
      read: false,
      link: '/client/invoices',
      createdAt: new Date(Date.now() - 3600000),
    },
  ],
  unreadCount: 2,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}`,
      createdAt: new Date(),
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  removeNotification: (id: string) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notification && !notification.read
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    });
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));

// UI Store for theme, sidebar, etc.
interface UIState {
  sidebarOpen: boolean;
  theme: 'dark' | 'light';
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'dark',

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        }));
      },

      setTheme: (theme: 'dark' | 'light') => {
        set({ theme });
      },
    }),
    {
      name: 'ui-storage',
    }
  )
);
