// ========== 认证模块类型 ==========
export interface RegisterRequest {
  username: string;
  password: string;
  tenant_id?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  tenant_id?: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface AuthResponse {
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// ========== RAG 模块类型 ==========
export interface IngestRequest {
  content?: string;
  file_path?: string;
  tags?: string[];
}

export interface IngestResponse {
  ingested: number;
  dataset: string;
}

export interface RagQueryRequest {
  query: string;
  top_k?: number;
  filters?: Record<string, unknown>;
  min_score?: number;
  stream?: boolean;
}

export interface RagContext {
  content: string;
  score: number;
  source: string;
  metadata: {
    doc_id: string;
    chunk_id: string;
    tags?: string;
    [key: string]: unknown;
  };
}

export interface RagQueryResponse {
  answer: string;
  contexts: RagContext[];
}

export interface RagStatsDoc {
  doc_id: string;
  filename: string;
  directory_path: string;
  chunk_count: number;
  tags?: string;
  updated_at: string;
}

export interface RagStatsResponse {
  total_docs: number;
  total_chunks: number;
  docs: RagStatsDoc[];
}

// ========== Agent 模块类型 ==========
export interface AgentActRequest {
  goal: string;
  tools?: string[];
  constraints?: Record<string, unknown>;
  stream?: boolean;
}

export interface AgentTrace {
  tool: string;
  args: Record<string, unknown>;
  result: Record<string, unknown>;
  elapsed_ms: number;
}

export interface AgentActResponse {
  plan: string;
  answer: string;
  traces: AgentTrace[];
  citations: number[];
}

// ========== 文件模块类型 ==========
export interface CreateDirRequest {
  directory_path: string;
}

export interface UploadFileRequest {
  file: File;
  directory_path: string;
  tags?: string;
  index?: boolean;
}

export interface DocInfo {
  doc_id: string;
  filename: string;
  directory_path: string;
  chunk_count: number;
  tags?: string;
  updated_at: string;
}

export interface ChunkInfo {
  chunk_id: string;
  content: string;
  metadata: Record<string, unknown>;
}

// ========== SSE 流式事件类型 ==========
export interface SSEContextsEvent {
  items: RagContext[];
  hits: number;
}

export interface SSETokenEvent {
  text: string;
}

export interface SSEErrorEvent {
  message: string;
}

export interface SSEPlanEvent {
  raw: string;
  steps: Array<{
    tool: string;
    args: Record<string, unknown>;
  }>;
}

export interface SSETraceEvent {
  tool: string;
  args: Record<string, unknown>;
  result: Record<string, unknown>;
  elapsed_ms: number;
}

// ========== API 响应包装 ==========
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}
