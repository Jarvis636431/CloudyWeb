import { create } from 'zustand';
import type { DocInfo, ChunkInfo } from '../types';

interface FileState {
  // 状态
  currentDirectory: string;
  directories: string[];
  documents: DocInfo[];
  selectedDocId: string | null;
  selectedDoc: DocInfo | null;
  docChunks: ChunkInfo[];
  isLoading: boolean;
  refreshTrigger: number; // 用于触发刷新

  // 操作
  setCurrentDirectory: (path: string) => void;
  setDirectories: (dirs: string[]) => void;
  setDocuments: (docs: DocInfo[]) => void;
  selectDocument: (docId: string, doc: DocInfo) => void;
  setDocChunks: (chunks: ChunkInfo[]) => void;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  triggerRefresh: () => void; // 触发刷新
}

export const useFileStore = create<FileState>((set) => ({
  // 初始状态
  currentDirectory: '/',
  directories: [],
  documents: [],
  selectedDocId: null,
  selectedDoc: null,
  docChunks: [],
  isLoading: false,
  refreshTrigger: 0,

  // 设置当前目录
  setCurrentDirectory: (path) => set({ currentDirectory: path }),

  // 设置目录列表
  setDirectories: (dirs) => set({ directories: dirs }),

  // 设置文档列表
  setDocuments: (docs) => set({ documents: docs }),

  // 选择文档
  selectDocument: (docId, doc) =>
    set({
      selectedDocId: docId,
      selectedDoc: doc,
    }),

  // 设置文档分片
  setDocChunks: (chunks) => set({ docChunks: chunks }),

  // 清除选择
  clearSelection: () =>
    set({
      selectedDocId: null,
      selectedDoc: null,
      docChunks: [],
    }),

  // 设置加载状态
  setLoading: (loading) => set({ isLoading: loading }),

  // 触发刷新
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));
