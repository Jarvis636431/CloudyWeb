import { create } from 'zustand';
import type { RagContext } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  contexts?: RagContext[];
  isStreaming?: boolean;
}

interface ChatState {
  // 状态
  messages: ChatMessage[];
  isGenerating: boolean;
  currentStreamingId: string | null;

  // 操作
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  appendToMessage: (id: string, chunk: string) => void;
  setGenerating: (generating: boolean) => void;
  setCurrentStreamingId: (id: string | null) => void;
  clearMessages: () => void;
  deleteMessage: (id: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  // 初始状态
  messages: [],
  isGenerating: false,
  currentStreamingId: null,

  // 添加消息
  addMessage: (message) => {
    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const newMessage: ChatMessage = {
      ...message,
      id,
      timestamp: Date.now(),
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
    return id;
  },

  // 更新消息
  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),

  // 追加内容到消息（用于流式响应）
  appendToMessage: (id, chunk) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, content: msg.content + chunk } : msg
      ),
    })),

  // 设置生成状态
  setGenerating: (generating) => set({ isGenerating: generating }),

  // 设置当前流式消息 ID
  setCurrentStreamingId: (id) => set({ currentStreamingId: id }),

  // 清空消息
  clearMessages: () => set({ messages: [] }),

  // 删除消息
  deleteMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    })),
}));
