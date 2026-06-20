import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: string;
  permissions: string[];
  branchId?: string;
  branchName?: string;
  tenantId: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthActions {
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (isLoading: boolean) => void;
  initialize: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

function decodeJWT(token: string): { exp: number } | null {
  try {
    const base64Url = token.split('.')[1] || '';
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,

      login: (user: User, accessToken: string, refreshToken: string) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });

        try {
          localStorage.removeItem('smart-pos-auth');
        } catch {
          // localStorage unavailable
        }

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      initialize: async () => {
        const state = get();
        set({ isLoading: true });

        const accessToken = state.accessToken;
        const refreshToken = state.refreshToken;

        if (!accessToken || !refreshToken) {
          set({
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            user: null,
            accessToken: null,
            refreshToken: null,
          });
          return;
        }

        if (isTokenExpired(accessToken)) {
          if (isTokenExpired(refreshToken)) {
            set({
              isAuthenticated: false,
              isLoading: false,
              isInitialized: true,
              user: null,
              accessToken: null,
              refreshToken: null,
            });
            return;
          }

          try {
            const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const response = await fetch(`${VITE_API_URL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (response.ok) {
              const data = await response.json();
              set({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken || refreshToken,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true,
              });
              return;
            }
          } catch {
            // Refresh failed, continue to mark as unauthenticated
          }

          set({
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            user: null,
            accessToken: null,
            refreshToken: null,
          });
          return;
        }

        set({
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      },
    }),
    {
      name: 'smart-pos-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);