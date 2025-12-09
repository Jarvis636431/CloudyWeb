# Cloudy API 文档

本项目是一个基于 FastAPI 的示例应用，集成了 RAG（检索增强生成）、Agent 编排、文件管理和认证能力。

## 基础信息

- **Base URL**：`http://127.0.0.1:8000`
- **API 文档**：
  - Swagger UI: `http://127.0.0.1:8000/docs`
  - ReDoc: `http://127.0.0.1:8000/redoc`
- **认证方式**：Bearer Token（JWT 双 Token 机制：access_token + refresh_token）

---

## 一、认证模块（/auth）

### 1. `POST /auth/register` 注册并签发 Token

**说明**：注册新用户（仅存储在当前进程内存中），成功后直接返回一对 access_token/refresh_token。适合 Demo/开发环境，服务重启后用户信息会丢失。

**请求体**

```json
{
  "username": "alice",
  "password": "123456",
  "tenant_id": "tenant-1"
}
```

**字段说明**

- `username`: string，必填，长度 ≥ 1
- `password`: string，必填，长度 ≥ 6，后端使用 `sha256` 进行 hash 存储
- `tenant_id`: string，可选，租户 ID，会写入 JWT payload

**响应体**

```json
{
  "token_type": "bearer",
  "access_token": "<access-token>",
  "refresh_token": "<refresh-token>",
  "expires_in": 1800
}
```

**备注**

- 用户保存在进程内的 `_USERS` 字典中，不会持久化
- 生产环境请改用数据库存储并加强密码加密策略

---

### 2. `POST /auth/login` 登录并签发 Token

**说明**：支持两种登录方式：

1. 通过 `/auth/register` 注册的内存用户
2. 预置的 demo 账号（由 `AUTH_DEMO_USERNAME` / `AUTH_DEMO_PASSWORD` 配置）

**请求体**

```json
{
  "username": "alice",
  "password": "123456",
  "tenant_id": "tenant-1"
}
```

**认证逻辑**

- 优先在内存用户表 `_USERS` 中查找 `username`
  - 找到：对比 `sha256(password)`，不匹配返回 `401 invalid credentials`
- 否则回退使用 demo 账号
  - 需与 `.env` 中的 `AUTH_DEMO_USERNAME` / `AUTH_DEMO_PASSWORD` 一致，否则 `401 invalid credentials`

**响应体**

与注册接口相同：

```json
{
  "token_type": "bearer",
  "access_token": "<access-token>",
  "refresh_token": "<refresh-token>",
  "expires_in": 1800
}
```

**后续调用受保护接口**

```http
Authorization: Bearer <access_token>
```

---

### 3. `POST /auth/refresh` 刷新 Token

**说明**：使用 `refresh_token` 换取新的 access_token 和 refresh_token。

**请求体**

```json
{
  "refresh_token": "<refresh-token>"
}
```

**响应体**

```json
{
  "token_type": "bearer",
  "access_token": "<new-access-token>",
  "refresh_token": "<new-refresh-token>",
  "expires_in": 1800
}
```

---

## 二、RAG 模块（/rag）

### 1. `POST /rag/ingest` 文档入库

**说明**：将文档内容切分为多个分片（chunks），向量化后写入向量库（默认 ChromaDB）。支持直接传文本或服务器本地文件路径。

**请求体**

```json
{
  "content": "Cloudy 是一个 FastAPI 示例项目，集成了 RAG 能力。",
  "file_path": null,
  "tags": ["demo", "fastapi"]
}
```

**字段说明**

- `content`: string，可选，直接传入的文本内容
- `file_path`: string，可选，服务器本地文件路径，后端读取文件内容
- `tags`: string[]，可选，标签，会写入 metadata（如过滤使用）
- **注意**：`content` 和 `file_path` 必须至少提供一个，否则返回 400

**响应体**

```json
{
  "ingested": 3,
  "dataset": "default"
}
```

- `ingested`: int，写入的分片数量

---

### 2. `POST /rag/query` 检索并生成回答（默认 SSE 流式）

**说明**：根据用户问题进行语义检索，并调用 LLM 生成回答。  
默认以 SSE（Server-Sent Events）流式返回检索片段和增量回答；通过 `stream=false` 回退为一次性 JSON 响应。

#### 请求体

```json
{
  "query": "Cloudy 项目是什么？",
  "top_k": 5,
  "filters": {
    "tags": "demo"
  },
  "min_score": 0.6,
  "stream": true
}
```

**字段说明**

- `query`: string，必填，用户问题
- `top_k`: int，可选，默认 5，返回的最大检索结果数
- `filters`: object，可选，用于 metadata 精确匹配，如 `{"tags": "demo"}`
- `min_score`: float，可选，0～1，过滤掉相似度低于阈值的结果
- `stream`: bool，可选，默认 `true`
  - `true`：返回 SSE 流
  - `false`：返回一次性 JSON

#### 非流式响应（`stream=false`）

```json
{
  "answer": "Cloudy 是一个 FastAPI 项目…参考：[1][2]",
  "contexts": [
    {
      "content": "Cloudy 是一个 FastAPI 示例项目...",
      "score": 0.95,
      "source": "ingest",
      "metadata": {
        "doc_id": "doc_0",
        "chunk_id": "1",
        "tags": "demo"
      }
    }
  ]
}
```

#### 流式响应（`stream=true`，默认）

- **Content-Type**：`text/event-stream`
- 单个事件格式示例：

```text
event: <event-name>
data: <json-string>

```

**事件类型**

- **`contexts`**：检索到的片段（最多 5 条）

  ```json
  {
    "items": [
      {
        "content": "Cloudy 是一个 FastAPI 示例项目...",
        "score": 0.95,
        "source": "ingest",
        "metadata": { "doc_id": "doc_0", "chunk_id": "1" }
      }
    ],
    "hits": 3
  }
  ```

- **`token`**：增量回答文本

  ```json
  { "text": "Cloudy 是一个 FastAPI 项目" }
  ```

- **`done`**：流式结束

  ```json
  {}
  ```

- **`error`**（可选）：错误信息

  ```json
  { "message": "stream failed" }
  ```

> **提示**：实现客户端时，`/rag/query` 流式接口是 **POST** + SSE，需要用 `fetch + ReadableStream` 这类方式解析，不适合直接用原生 `EventSource`（因为它只支持 GET）。

---

### 3. `GET /rag/stats` 向量库统计信息

**说明**：返回当前向量库中的文档和分片统计信息，用于监控、调试和前端展示。

**请求参数**

- 无（若后续扩展可以加入 `directory_path` 等）

**响应体**

```json
{
  "total_docs": 12,
  "total_chunks": 120,
  "docs": [
    {
      "doc_id": "doc_0",
      "filename": "README.md",
      "directory_path": "docs",
      "chunk_count": 10,
      "tags": "demo",
      "updated_at": "2025-12-09T12:00:00"
    }
  ]
}
```

**字段说明**

- `total_docs`: int，总文档数（按照 doc_id 聚合）
- `total_chunks`: int，总分片数
- `docs`: 文档聚合列表，包含 doc_id、文件名、目录、chunk 数、tags、最近更新时间等

---

## 三、Agent 模块（/agent）

### `POST /agent/act` Agent 编排执行（默认 SSE 流式）

**说明**：根据 `goal` 和允许使用的工具列表 `tools` 进行规划和执行，默认使用 SSE 流式输出计划、工具调用轨迹和回答增量。

**鉴权**：受保护接口，必须在 Header 中携带：

```http
Authorization: Bearer <access_token>
```

#### 请求体

```json
{
  "goal": "Cloudy 项目是什么？",
  "tools": ["rag"],
  "constraints": {
    "top_k": 3,
    "min_score": 0.5
  },
  "stream": true
}
```

**字段说明**

- `goal`: string，必填，任务目标或问题
- `tools`: string[]，可选，允许使用的工具（如 `["rag"]`, `["rag","calculator"]`）
- `constraints`: object，可选，约束工具行为（如 RAG 的 `top_k`、`min_score`）
- `stream`: bool，可选，默认 `true`
  - `true`：SSE 流式
  - `false`：一次性 JSON

#### 非流式响应（`stream=false`）

```json
{
  "plan": "steps=1",
  "answer": "Cloudy 是一个 FastAPI 项目...参考：[1]",
  "traces": [
    {
      "tool": "rag",
      "args": { "query": "Cloudy 项目是什么？" },
      "result": { "contexts": [] },
      "elapsed_ms": 12
    }
  ],
  "citations": [1]
}
```

#### 流式响应（`stream=true`，默认）

- **Content-Type**：`text/event-stream`

**事件类型约定**

- **`plan`**：整体规划信息

  ```json
  {
    "raw": "steps=1: use rag to query Cloudy docs",
    "steps": [
      { "tool": "rag", "args": { "query": "Cloudy 项目是什么？" } }
    ]
  }
  ```

- **`trace`**：单次工具调用轨迹

  ```json
  {
    "tool": "rag",
    "args": { "query": "Cloudy 项目是什么？" },
    "result": { "contexts": [] },
    "elapsed_ms": 12
  }
  ```

- **`token`**：最终回答的增量文本

  ```json
  { "text": "Cloudy 是一个 FastAPI 项目" }
  ```

- **`done`**：本次 Agent 执行结束

  ```json
  {}
  ```

---

## 四、文件与目录模块（/files）

> 该模块提供"网盘式"目录与文件管理功能，可与 RAG 入库能力联动。部分接口需要 Bearer Token。

### 1. `POST /files/dirs` 创建目录

**请求体**

```json
{
  "directory_path": "/projects/demo/reports"
}
```

**说明**

- 创建指定路径的目录（相对于配置的 `STORAGE_ROOT`）

---

### 2. `GET /files/dirs` 列出子目录

**请求参数**

- `path`: string，可选，要列出的父目录路径（相对于 `STORAGE_ROOT`）

**示例**

```bash
GET /files/dirs?path=/projects/demo
```

---

### 3. `POST /files/upload` 上传文件（可选自动入库）

**说明**：上传文件到指定目录，可选是否自动将文件内容入库到向量库。

**请求方式**

- `multipart/form-data`，需要认证头 `Authorization: Bearer <access_token>`

**表单字段**

- `file`: 文件本身
- `directory_path`: 存储目录路径
- `tags`: 逗号分隔标签，如 `demo,fastapi`
- `index`: `true` 或 `false`，是否自动将文件内容入库到 RAG

---

### 4. `GET /files/docs` 列出文档（聚合视图）

**请求参数**

- `directory_path`: string，可选，按目录过滤文档

**说明**

- 返回各个文档的聚合信息（doc_id、文件名、目录、chunk_count 等），方便前端展示文档列表

---

### 5. `GET /files/docs/{doc_id}/chunks` 查看文档分片

**说明**

- 根据 `doc_id` 返回该文档的所有分片（chunk）内容及 metadata

---

### 6. `DELETE /files/docs/{doc_id}` 删除文档

**说明**

- 删除指定 `doc_id` 对应的所有向量库分片与磁盘文件

---

## 五、基础接口

- **`GET /`**：返回欢迎消息或简单的健康信息
- **`GET /healthz`**：健康检查接口，用于探活

---

## 附录

### 认证配置说明

在 `.env` 文件中可配置以下认证相关参数：

```bash
AUTH_ACCESS_TOKEN_TTL_SECONDS=1800        # access_token 有效期（秒）
AUTH_REFRESH_TOKEN_TTL_SECONDS=1209600    # refresh_token 有效期（秒）
AUTH_DEMO_USERNAME=admin                  # demo 账号用户名
AUTH_DEMO_PASSWORD=admin123               # demo 账号密码
SECRET_KEY=change-me                      # JWT 签名密钥（生产环境必须修改）
```

### RAG 配置说明

```bash
RAG_ENABLED=true                          # 启用 RAG 功能
RAG_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2  # 嵌入模型
RAG_VECTOR_PROVIDER=chromadb              # 向量库类型
RAG_DB_PATH=.rag/chroma                   # 本地向量库存储路径
RAG_TOP_K=5                               # 默认检索结果数
```

### 限流与请求大小配置

```bash
RATE_LIMIT_ENABLED=true                   # 是否启用限流
RATE_LIMIT_RPM=60                         # 每分钟请求上限（按 IP）
MAX_REQUEST_SIZE_BYTES=2000000            # 最大请求体大小
```
