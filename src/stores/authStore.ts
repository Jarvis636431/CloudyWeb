import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse } from '../types';

interface AuthState {
  // 状态
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  username: string | null;
  tenantId: string | null;

  // 操作
  setAuth: (auth: AuthResponse, username: string, tenantId?: string) => void;
  clearAuth: () => void;
  updateAccessToken: (accessToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 初始状态
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      username: null,
      tenantId: null,

      // 设置认证信息
      setAuth: (auth, username, tenantId) => {
        localStorage.setItem('access_token', auth.access_token);
        localStorage.setItem('refresh_token', auth.refresh_token);
        set({
          isAuthenticated: true,
          accessToken: auth.access_token,
          refreshToken: auth.refresh_token,
          username,
          tenantId,
        });
      },

      // 清除认证信息
      clearAuth: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          username: null,
          tenantId: null,
        });
      },

      // 更新 access token
      updateAccessToken: (accessToken) => {
        localStorage.setItem('access_token', accessToken);
        set({ accessToken });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        username: state.username,
        tenantId: state.tenantId,
      }),
    }
  )
);
