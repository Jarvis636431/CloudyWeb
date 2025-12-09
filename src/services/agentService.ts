import request from './request';
import type {
  AgentActRequest,
  AgentActResponse,
  SSEPlanEvent,
  SSETraceEvent,
  SSETokenEvent,
  SSEErrorEvent,
} from '../types';

/**
 * Agent 服务
 */
export const agentService = {
  /**
   * Agent 编排执行（非流式）
   * POST /agent/act
   * 需要认证
   */
  act: async (params: AgentActRequest): Promise<AgentActResponse> => {
    return request.post('/agent/act', { ...params, stream: false });
  },

  /**
   * Agent 编排执行（流式 SSE）
   * POST /agent/act
   * 需要认证
   */
  actStream: async (
    params: AgentActRequest,
    callbacks: {
      onPlan?: (data: SSEPlanEvent) => void;
      onTrace?: (data: SSETraceEvent) => void;
      onToken?: (data: SSETokenEvent) => void;
      onDone?: () => void;
      onError?: (error: SSEErrorEvent) => void;
    }
  ): Promise<void> => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
    const url = `${baseURL}/agent/act`;

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
            continue;
          }

          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            try {
              const parsed = JSON.parse(data);

              // 根据字段判断事件类型
              if (parsed.raw && parsed.steps) {
                // plan 事件
                callbacks.onPlan?.(parsed as SSEPlanEvent);
              } else if (parsed.tool && parsed.elapsed_ms !== undefined) {
                // trace 事件
                callbacks.onTrace?.(parsed as SSETraceEvent);
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
              console.warn('SSE 解析错误:', e);
            }
          }
        }
      }
    } catch (error) {
      callbacks.onError?.({ message: (error as Error).message });
    }
  },
};
