# AI 对话功能设计文档

## 概述

本设计文档描述了 Cloudy 智能文档管理平台的 AI 对话功能实现方案。该功能将提供基于 RAG 和 Agent 的智能对话体验，支持流式响应、文档引用、对话历史管理等核心功能。

## 架构

### 组件架构

```
ChatPanel (主容器)
├── ChatHeader (头部信息)
├── MessageList (消息列表)
│   ├── UserMessage (用户消息)
│   ├── AssistantMessage (AI 回复)
│   │   ├── MessageContent (消息内容)
│   │   ├── ContextPanel (上下文面板)
│   │   ├── CitationLinks (引用链接)
│   │   └── AgentTrace (Agent 轨迹)
│   └── StreamingMessage (流式消息)
├── ChatInput (输入区域)
│   ├── MessageInput (消息输入框)
│   ├── SendButton (发送按钮)
│   └── SettingsButton (设置按钮)
└── ChatSettings (设置面板)
    ├── RAGSettings (RAG 参数设置)
    └── AgentSettings (Agent 工具设置)
```

### 数据流架构

```
User Input → ChatStore → Service Layer → Backend API
     ↓           ↓            ↓
UI Update ← State Update ← SSE Stream ← Streaming Response
```

### 服务集成架构

```
ChatPanel
├── RAG Mode: ragService.queryStream()
├── Agent Mode: agentService.actStream()
└── Hybrid Mode: 智能路由选择
```

## 组件和接口

### 核心组件

#### ChatPanel

- **职责**: 对话功能的主容器组件
- **状态**: 消息列表、生成状态、设置配置
- **接口**: 提供完整的对话交互功能

#### MessageList

- **职责**: 显示对话历史和实时消息
- **接口**:
  - `renderMessage(message)`: 渲染单条消息
  - `scrollToBottom()`: 滚动到最新消息
  - `highlightContext(contextId)`: 高亮引用内容

#### ChatInput

- **职责**: 处理用户输入和消息发送
- **接口**:
  - `onMessageSend(content)`: 发送消息处理
  - `onKeyPress(event)`: 键盘事件处理
  - `validateInput(content)`: 输入验证

#### AssistantMessage

- **职责**: 显示 AI 回复和相关信息
- **接口**:
  - `renderContent(content)`: 渲染消息内容
  - `renderContexts(contexts)`: 渲染文档上下文
  - `renderCitations(citations)`: 渲染引用标记
  - `renderAgentTrace(traces)`: 渲染 Agent 轨迹

#### ChatSettings

- **职责**: 管理对话参数配置
- **接口**:
  - `updateRAGSettings(settings)`: 更新 RAG 参数
  - `updateAgentSettings(settings)`: 更新 Agent 设置
  - `saveSettings()`: 保存配置
  - `resetSettings()`: 重置为默认值

### 服务接口扩展

#### ChatService

```typescript
interface ChatService {
  // 智能路由
  determineMode(query: string): "rag" | "agent" | "hybrid";

  // RAG 查询
  queryRAG(params: RagQueryRequest, callbacks: StreamCallbacks): Promise<void>;

  // Agent 执行
  executeAgent(
    params: AgentActRequest,
    callbacks: StreamCallbacks
  ): Promise<void>;

  // 混合模式
  hybridQuery(query: string, callbacks: StreamCallbacks): Promise<void>;
}
```

#### StreamCallbacks

```typescript
interface StreamCallbacks {
  onStart?: () => void;
  onContexts?: (contexts: RagContext[]) => void;
  onPlan?: (plan: SSEPlanEvent) => void;
  onTrace?: (trace: SSETraceEvent) => void;
  onToken?: (token: string) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}
```

## 数据模型

### ChatMessage 扩展

```typescript
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;

  // RAG 相关
  contexts?: RagContext[];
  citations?: number[];

  // Agent 相关
  agentPlan?: SSEPlanEvent;
  agentTraces?: SSETraceEvent[];

  // 状态相关
  isStreaming?: boolean;
  isComplete?: boolean;
  hasError?: boolean;
  errorMessage?: string;

  // 元数据
  mode?: "rag" | "agent" | "hybrid";
  processingTime?: number;
}
```

### ChatSettings

```typescript
interface ChatSettings {
  // RAG 设置
  rag: {
    topK: number;
    minScore: number;
    filters?: Record<string, unknown>;
  };

  // Agent 设置
  agent: {
    tools: string[];
    constraints?: Record<string, unknown>;
  };

  // 界面设置
  ui: {
    showContexts: boolean;
    showTraces: boolean;
    autoScroll: boolean;
    theme: "light" | "dark";
  };
}
```

### ChatStore 状态扩展

```typescript
interface ChatState {
  // 现有状态...

  // 新增状态
  settings: ChatSettings;
  selectedContextId: string | null;
  retryCount: number;
  lastQuery: string | null;

  // 操作扩展
  sendMessage: (content: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  updateSettings: (settings: Partial<ChatSettings>) => void;
  selectContext: (contextId: string | null) => void;
  exportHistory: () => string;
  importHistory: (data: string) => void;
}
```

## 正确性属性

_属性是一个特征或行为，应该在系统的所有有效执行中保持为真。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。_

### 属性反思

在编写正确性属性之前，让我审查预工作分析中识别的可测试属性，以消除冗余：

**冗余分析:**

- 多个流式响应属性（1.4, 3.4, 3.5）可以合并为"流式响应一致性"属性
- 多个状态管理属性（1.3, 1.5, 3.2）可以合并为"UI 状态一致性"属性
- 多个设置相关属性（5.2, 5.3, 5.4, 5.5）可以合并为"设置配置生效性"属性
- 多个错误处理属性（6.1, 6.2, 6.3, 6.4, 6.5）可以合并为"错误处理完整性"属性

**合并后的核心属性:**

**属性 1: 消息发送和接收一致性**
*对于任何*用户发送的消息，系统应该正确添加到对话列表并触发相应的 AI 回复流程
**验证: 需求 1.1, 1.2**

**属性 2: 流式响应完整性**
*对于任何*流式响应过程，从开始到结束应该保持数据完整性，中断时保留已接收内容
**验证: 需求 1.4, 3.4, 6.3**

**属性 3: UI 状态同步性**
*对于任何*对话状态变化（开始生成、完成、错误），UI 显示应该与实际状态保持同步
**验证: 需求 1.3, 1.5, 3.2**

**属性 4: 文档上下文关联性**
*对于任何*包含文档上下文的 AI 回复，上下文信息应该完整显示且与引用标记正确关联
**验证: 需求 2.1, 2.2, 2.3**

**属性 5: Agent 执行轨迹完整性**
*对于任何*Agent 任务执行，所有工具调用和执行步骤应该被完整记录和显示
**验证: 需求 3.1, 3.3, 3.5**

**属性 6: 对话历史持久性**
*对于任何*对话操作（发送、接收、删除），历史记录应该正确更新并在会话间保持持久化
**验证: 需求 4.1, 4.2, 4.5**

**属性 7: 设置配置生效性**
*对于任何*用户修改的设置参数，应该在后续的对话中正确生效并保持持久化
**验证: 需求 5.2, 5.3, 5.4, 5.5**

**属性 8: 错误处理和恢复一致性**
*对于任何*错误情况（网络、服务器、流式中断），应该显示适当的错误信息并提供恢复选项
**验证: 需求 6.1, 6.2, 6.4, 6.5**

## 错误处理

### 错误类型和处理策略

#### 网络错误

- **连接超时**: 显示超时提示，提供重试选项
- **网络中断**: 保存当前状态，提供离线提示
- **请求失败**: 显示具体错误码和描述

#### 流式响应错误

- **连接中断**: 保留已接收内容，标记为不完整
- **解析错误**: 记录错误日志，继续处理后续数据
- **服务端错误**: 显示错误事件内容

#### 服务错误

- **认证失败**: 自动刷新 Token 或跳转登录
- **权限不足**: 显示权限提示
- **服务不可用**: 显示服务状态和预计恢复时间

#### 数据错误

- **消息格式错误**: 显示格式要求
- **内容过长**: 提示长度限制
- **敏感内容**: 显示内容政策提示

### 错误恢复机制

#### 自动重试

- 网络错误自动重试（最多 3 次）
- 指数退避策略
- 重试状态显示

#### 手动恢复

- 重试按钮
- 重新发送最后消息
- 清除错误状态

#### 状态保护

- 错误时保护已有对话
- 防止重复发送
- 保存未发送内容

## 测试策略

### 单元测试

- **组件渲染测试**: 测试各组件的正确渲染
- **交互测试**: 测试用户交互和事件处理
- **状态管理测试**: 测试 ChatStore 的状态变更
- **服务集成测试**: 测试与 RAG/Agent 服务的集成

### 属性基础测试

使用 **fast-check** 库进行属性基础测试，每个测试运行 **100** 次迭代。

每个属性基础测试必须使用以下格式标记：
**Feature: ai-chat, Property {number}: {property_text}**

**属性测试实现要求:**

- 属性 1: 生成随机消息内容，验证发送接收流程
- 属性 2: 模拟流式数据中断，验证数据完整性
- 属性 3: 生成随机状态变化，验证 UI 同步性
- 属性 4: 生成随机上下文数据，验证关联显示
- 属性 5: 模拟 Agent 执行过程，验证轨迹记录
- 属性 6: 测试对话历史的增删改操作
- 属性 7: 生成随机设置配置，验证生效性
- 属性 8: 模拟各种错误场景，验证处理机制

### 集成测试

- **端到端对话流程**: 测试完整的对话体验
- **RAG 集成**: 测试文档检索和回答生成
- **Agent 集成**: 测试复杂任务执行
- **流式响应**: 测试 SSE 流的处理

### 性能测试

- **长对话性能**: 测试大量消息的渲染性能
- **流式响应性能**: 测试高频流式数据的处理
- **内存使用**: 测试长时间使用的内存占用
- **并发对话**: 测试多个对话会话的性能
