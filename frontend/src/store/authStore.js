import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          // BE returns { accessToken, tokenType, expiresIn, user }
          const { accessToken, user } = response.data;
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Đăng nhập thất bại';
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
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Đăng ký thất bại';
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
        });
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
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
