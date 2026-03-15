import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { authApi } from '../services/api';
import { useCartStore } from './cartStore';

const AUTH_STORAGE_KEY = 'auth-storage';
const AUTH_SESSION_STORAGE_KEY = 'auth-storage-session';

const readStoredAuth = (name) => {
  const fromSession = sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (fromSession) {
    return fromSession;
  }
  return localStorage.getItem(name);
};

const writeStoredAuth = (name, value) => {
  try {
    const parsed = JSON.parse(value);
    const shouldRemember = Boolean(parsed?.state?.rememberMe);

    if (shouldRemember) {
      localStorage.setItem(name, value);
      sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      return;
    }
  } catch (error) {
    // Fallback to durable storage if parsing fails.
  }

  sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, value);
  localStorage.removeItem(name);
};

const removeStoredAuth = (name) => {
  localStorage.removeItem(name);
  sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
};

const authStorage = {
  getItem: (name) => readStoredAuth(name),
  setItem: (name, value) => writeStoredAuth(name, value),
  removeItem: (name) => removeStoredAuth(name),
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,
      isLoading: false,
      error: null,
      rememberMe: true,

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      syncAuthFromToken: () => {
        const token = get().token;
        set({ isAuthenticated: Boolean(token) });
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { rememberMe = true, ...loginPayload } = credentials;
          const response = await authApi.login(loginPayload);
          // BE returns { accessToken, tokenType, expiresIn, user }
          const { accessToken, user } = response.data;
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            rememberMe,
            isLoading: false,
          });
          // Sync local cart to server after login
          await useCartStore.getState().syncLocalCartToServer();
          return { success: true };
        } catch (error) {
          const status = error.response?.status;
          const data = error.response?.data;

          let message = 'Đăng nhập thất bại';
          if (!error.response) {
            message = 'Không thể kết nối tới server. Vui lòng kiểm tra backend đang chạy (http://localhost:8080).';
          } else if (data?.errors && typeof data.errors === 'object') {
            // Validation errors from ApiResponse.error(..., errors)
            const firstError = Object.values(data.errors).find(Boolean);
            message = String(firstError || data?.message || message);
          } else if (data?.message) {
            message = data.message;
          } else if (status) {
            message = `${message} (HTTP ${status})`;
          }
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          // BE returns { accessToken, tokenType, expiresIn, user }
          const { accessToken, user } = response.data;
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          // Sync local cart to server after register
          await useCartStore.getState().syncLocalCartToServer();
          return { success: true };
        } catch (error) {
          const status = error.response?.status;
          const respData = error.response?.data;

          let message = 'Đăng ký thất bại';
          if (!error.response) {
            message = 'Không thể kết nối tới server. Vui lòng kiểm tra backend đang chạy (http://localhost:8080).';
          } else if (respData?.errors && typeof respData.errors === 'object') {
            const firstError = Object.values(respData.errors).find(Boolean);
            message = String(firstError || respData?.message || message);
          } else if (respData?.message) {
            message = respData.message;
          } else if (status) {
            message = `${message} (HTTP ${status})`;
          }
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          rememberMe: true,
        });
        // Clear cart on logout so next guest starts fresh
        useCartStore.getState().clearCartLocal();
      },

      fetchUser: async () => {
        if (!get().token) return;
        set({ isLoading: true });
        try {
          const response = await authApi.getMe();
          set({ user: response.data, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          get().logout();
        }
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => authStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          // If rehydration fails, still unblock route guards.
          state?.setHasHydrated(true);
          return;
        }

        state?.setHasHydrated(true);
        state?.syncAuthFromToken?.();
        // Validate token by fetching current user from server
        state?.fetchUser?.();
      },
    }
  )
);
