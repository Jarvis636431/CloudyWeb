import request from './request';
import type {
  IngestRequest,
  IngestResponse,
  RagQueryRequest,
  RagQueryResponse,
  RagStatsResponse,
  SSEContextsEvent,
  SSETokenEvent,
  SSEErrorEvent,
} from '../types';

/**
 * RAG 服务
 */
export const ragService = {
  /**
   * 文档入库
   * POST /rag/ingest
   */
  ingest: async (params: IngestRequest): Promise<IngestResponse> => {
    return request.post('/rag/ingest', params);
  },

  /**
   * 检索并生成回答（非流式）
   * POST /rag/query
   */
  query: async (params: RagQueryRequest): Promise<RagQueryResponse> => {
    return request.post('/rag/query', { ...params, stream: false });
  },

  /**
   * 检索并生成回答（流式 SSE）
   * POST /rag/query
   */
  queryStream: async (
    params: RagQueryRequest,
    callbacks: {
      onContexts?: (data: SSEContextsEvent) => void;
      onToken?: (data: SSETokenEvent) => void;
      onDone?: () => void;
      onError?: (error: SSEErrorEvent) => void;
    }
  ): Promise<void> => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
    const url = `${baseURL}/rag/query`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: JSON.stringify({ ...params, stream: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法获取响应流');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          callbacks.onDone?.();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          if (line.startsWith('event: ')) {
            // 跳过事件类型行
            continue;
          }

          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            try {
              const parsed = JSON.parse(data);

              // 根据事件类型分发
              if (parsed.items && parsed.hits !== undefined) {
                // contexts 事件
                callbacks.onContexts?.(parsed as SSEContextsEvent);
              } else if (parsed.text !== undefined) {
                // token 事件
                callbacks.onToken?.(parsed as SSETokenEvent);
              } else if (parsed.message) {
                // error 事件
                callbacks.onError?.(parsed as SSEErrorEvent);
              } else if (Object.keys(parsed).length === 0) {
                // done 事件
                callbacks.onDone?.();
              }
            } catch (e) {
              // 忽略解析错误
              console.warn('SSE 解析错误:', e);
            }
          }
        }
      }
    } catch (error) {
      callbacks.onError?.({ message: (error as Error).message });
    }
  },

  /**
   * 获取向量库统计信息
   * GET /rag/stats
   */
  getStats: async (): Promise<RagStatsResponse> => {
    return request.get('/rag/stats');
  },
};
