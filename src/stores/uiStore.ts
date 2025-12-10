import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // 侧边栏状态
  sidebarCollapsed: boolean;
  rightPanelCollapsed: boolean;

  // 加载状态
  globalLoading: boolean;
  uploadProgress: number;

  // 通知/提示
  notification: {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    visible: boolean;
  } | null;

  // 操作
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  setGlobalLoading: (loading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  showNotification: (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ) => void;
  hideNotification: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // 初始状态
      sidebarCollapsed: false,
      rightPanelCollapsed: false,
      globalLoading: false,
      uploadProgress: 0,
      notification: null,

      // 切换左侧边栏
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // 切换右侧面板
      toggleRightPanel: () =>
        set((state) => ({ rightPanelCollapsed: !state.rightPanelCollapsed })),

      // 设置全局加载状态
      setGlobalLoading: (loading) => set({ globalLoading: loading }),

      // 设置上传进度
      setUploadProgress: (progress) => set({ uploadProgress: progress }),

      // 显示通知
      showNotification: (message, type) =>
        set({
          notification: {
            message,
            type,
            visible: true,
          },
        }),

      // 隐藏通知
      hideNotification: () => set({ notification: null }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        rightPanelCollapsed: state.rightPanelCollapsed,
      }),
    }
  )
);
