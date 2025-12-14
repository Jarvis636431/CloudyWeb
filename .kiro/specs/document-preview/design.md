# 文档预览功能设计文档

## 概述

本设计文档描述了 Cloudy 智能文档管理平台的文档预览功能实现方案。该功能将提供多格式文档的在线预览能力，支持丰富的阅读体验、搜索导航、AI 集成和个性化设置。

## 架构

### 组件架构

```
DocumentViewer (主容器)
├── PreviewHeader (预览头部)
│   ├── DocumentInfo (文档信息)
│   ├── PreviewToolbar (工具栏)
│   └── SearchBar (搜索栏)
├── PreviewContent (预览内容区)
│   ├── MarkdownRenderer (Markdown 渲染器)
│   ├── CodeRenderer (代码渲染器)
│   ├── ImageViewer (图片查看器)
│   ├── PDFViewer (PDF 查看器)
│   ├── TextViewer (文本查看器)
│   └── UnsupportedViewer (不支持格式提示)
├── DocumentOutline (文档大纲)
├── PreviewSettings (预览设置)
└── AnnotationLayer (注释层)
```

### 渲染器架构

```
FileRenderer (文件渲染器工厂)
├── getRenderer(fileType) → 选择合适的渲染器
├── MarkdownRenderer → react-markdown + remark-gfm
├── CodeRenderer → Prism.js 语法高亮
├── ImageViewer → 缩放、旋转、全屏
├── PDFViewer → PDF.js 集成
└── TextViewer → 虚拟滚动优化
```

### 数据流架构

```
File Selection → DocumentStore → FileService → Content Loading
      ↓              ↓              ↓
UI Update ← Renderer Selection ← Content Processing
      ↓
AI Integration ← Text Selection ← User Interaction
```

## 组件和接口

### 核心组件

#### DocumentViewer

- **职责**: 文档预览的主容器组件
- **状态**: 当前文档、渲染模式、设置配置
- **接口**: 提供完整的文档预览功能

#### FileRenderer

- **职责**: 根据文件类型选择合适的渲染器
- **接口**:
  - `getRenderer(fileType)`: 获取渲染器
  - `canPreview(fileType)`: 检查是否支持预览
  - `getFileInfo(file)`: 获取文件信息

#### MarkdownRenderer

- **职责**: 渲染 Markdown 文档
- **接口**:
  - `render(content)`: 渲染 Markdown 内容
  - `generateOutline(content)`: 生成文档大纲
  - `highlightText(query)`: 高亮搜索文本

#### CodeRenderer

- **职责**: 渲染代码文件并提供语法高亮
- **接口**:
  - `render(content, language)`: 渲染代码内容
  - `detectLanguage(filename)`: 检测编程语言
  - `setTheme(theme)`: 设置高亮主题

#### ImageViewer

- **职责**: 显示和操作图片文件
- **接口**:
  - `render(imageUrl)`: 显示图片
  - `zoom(factor)`: 缩放图片
  - `rotate(angle)`: 旋转图片
  - `toggleFullscreen()`: 切换全屏

#### PreviewToolbar

- **职责**: 提供预览操作工具
- **接口**:
  - `onZoomIn()`: 放大
  - `onZoomOut()`: 缩小
  - `onSearch(query)`: 搜索
  - `onSettings()`: 打开设置
  - `onDownload()`: 下载文件

### 服务接口

#### DocumentService

```typescript
interface DocumentService {
  // 文档加载
  loadDocument(docId: string): Promise<DocumentContent>;
  getDocumentInfo(docId: string): Promise<DocumentInfo>;

  // 内容处理
  processContent(content: string, type: string): Promise<ProcessedContent>;
  generateOutline(content: string, type: string): Promise<OutlineItem[]>;

  // 搜索功能
  searchInDocument(content: string, query: string): Promise<SearchResult[]>;

  // 注释功能
  saveAnnotation(docId: string, annotation: Annotation): Promise<void>;
  getAnnotations(docId: string): Promise<Annotation[]>;
}
```

#### AIIntegrationService

```typescript
interface AIIntegrationService {
  // AI 集成
  setCurrentDocument(docId: string, content: string): void;
  askAboutSelection(selectedText: string): Promise<void>;
  highlightReferences(references: Reference[]): void;
  scrollToReference(referenceId: string): void;
}
```

## 数据模型

### DocumentContent

```typescript
interface DocumentContent {
  id: string;
  filename: string;
  type: string;
  size: number;
  content: string | ArrayBuffer;
  mimeType: string;
  encoding?: string;
  lastModified: string;
}
```

### ProcessedContent

```typescript
interface ProcessedContent {
  html?: string;
  text?: string;
  outline?: OutlineItem[];
  metadata?: Record<string, unknown>;
  language?: string;
  theme?: string;
}
```

### PreviewSettings

```typescript
interface PreviewSettings {
  // 显示设置
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  maxWidth: number;

  // 主题设置
  theme: "light" | "dark" | "auto";
  codeTheme: string;

  // 功能设置
  showOutline: boolean;
  showLineNumbers: boolean;
  wordWrap: boolean;
  autoScroll: boolean;

  // AI 集成设置
  enableAIIntegration: boolean;
  showSelectionHelper: boolean;
}
```

### DocumentStore 状态

```typescript
interface DocumentState {
  // 当前文档
  currentDocument: DocumentContent | null;
  processedContent: ProcessedContent | null;

  // 预览状态
  isLoading: boolean;
  error: string | null;
  zoom: number;

  // 搜索状态
  searchQuery: string;
  searchResults: SearchResult[];
  currentSearchIndex: number;

  // 大纲和导航
  outline: OutlineItem[];
  selectedOutlineItem: string | null;

  // 注释
  annotations: Annotation[];
  selectedAnnotation: string | null;

  // 设置
  settings: PreviewSettings;

  // AI 集成
  selectedText: string | null;
  highlightedReferences: Reference[];

  // 操作方法
  loadDocument: (docId: string) => Promise<void>;
  setZoom: (zoom: number) => void;
  search: (query: string) => void;
  navigateSearch: (direction: "next" | "prev") => void;
  selectOutlineItem: (itemId: string) => void;
  addAnnotation: (annotation: Annotation) => void;
  updateSettings: (settings: Partial<PreviewSettings>) => void;
  selectText: (text: string, range: TextRange) => void;
  askAI: (text?: string) => void;
}
```

## 正确性属性

_属性是一个特征或行为，应该在系统的所有有效执行中保持为真。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。_

### 属性反思

在编写正确性属性之前，让我审查预工作分析中识别的可测试属性，以消除冗余：

**冗余分析:**

- 多个渲染相关属性（1.2, 1.3, 2.1, 2.2）可以合并为"文件渲染一致性"属性
- 多个搜索导航属性（3.1, 3.2, 3.4）可以合并为"搜索导航功能性"属性
- 多个设置相关属性（5.1, 5.2, 5.3, 5.4, 5.5）可以合并为"设置配置生效性"属性
- 多个 AI 集成属性（4.1, 4.2, 4.3, 4.4）可以合并为"AI 集成一致性"属性

**合并后的核心属性:**

**属性 1: 文档加载和显示一致性**
*对于任何*支持的文档格式，选择文档后应该正确加载并根据文件类型选择合适的渲染方式
**验证: 需求 1.1, 1.2, 1.3, 1.4, 1.5**

**属性 2: 文件渲染格式正确性**
*对于任何*文档内容，渲染器应该根据文件类型正确处理和显示内容，保持格式完整性
**验证: 需求 2.1, 2.2, 2.4**

**属性 3: 搜索和导航功能性**
*对于任何*文档搜索操作，应该正确高亮匹配文本并提供准确的导航功能
**验证: 需求 3.1, 3.2, 3.3, 3.4**

**属性 4: 用户交互响应性**
*对于任何*用户操作（缩放、滚动、点击），界面应该及时响应并保持操作状态的一致性
**验证: 需求 2.3, 2.5, 3.5**

**属性 5: AI 集成同步性**
*对于任何*与 AI 对话的集成操作，文档预览应该与 AI 系统保持状态同步和正确的引用关联
**验证: 需求 4.1, 4.2, 4.3, 4.4**

**属性 6: 注释持久性**
*对于任何*用户添加的注释，应该正确保存并在后续预览中准确显示在对应位置
**验证: 需求 4.5**

**属性 7: 设置配置生效性**
*对于任何*用户修改的预览设置，应该立即生效并在后续会话中保持持久化
**验证: 需求 5.1, 5.2, 5.3, 5.4, 5.5**

**属性 8: 错误处理完整性**
*对于任何*错误情况（加载失败、格式不支持、网络异常），应该显示适当的错误信息和恢复选项
**验证: 需求 6.1, 6.2, 6.3, 6.4, 6.5**

## 错误处理

### 错误类型和处理策略

#### 文档加载错误

- **文件不存在**: 显示文件不存在提示，提供返回文件列表选项
- **权限不足**: 显示权限错误，引导用户联系管理员
- **网络超时**: 显示超时提示，提供重试选项
- **文件损坏**: 显示文件损坏提示，建议重新上传

#### 渲染错误

- **格式不支持**: 显示不支持提示，提供下载和基本信息
- **内容解析失败**: 显示解析错误，提供原始内容查看
- **渲染异常**: 降级到文本模式显示
- **内存不足**: 提供分页或部分加载选项

#### 功能错误

- **搜索失败**: 显示搜索错误，保持界面可用
- **大纲生成失败**: 隐藏大纲面板，不影响主要功能
- **注释保存失败**: 显示保存错误，保留本地副本
- **AI 集成失败**: 显示集成错误，保持预览功能可用

### 错误恢复机制

#### 自动恢复

- 网络错误自动重试（最多 3 次）
- 渲染失败自动降级到简单模式
- 部分功能失败不影响核心预览

#### 用户引导

- 提供明确的错误说明和解决建议
- 显示替代操作选项
- 保存用户操作状态，避免重复操作

#### 状态保护

- 错误时保护已加载的内容
- 保存用户的设置和注释
- 维护文档浏览历史

## 测试策略

### 单元测试

- **渲染器测试**: 测试各种文件格式的渲染正确性
- **组件交互测试**: 测试用户操作和界面响应
- **搜索功能测试**: 测试文本搜索和导航功能
- **设置管理测试**: 测试设置的保存和应用

### 属性基础测试

使用 **fast-check** 库进行属性基础测试，每个测试运行 **100** 次迭代。

每个属性基础测试必须使用以下格式标记：
**Feature: document-preview, Property {number}: {property_text}**

**属性测试实现要求:**

- 属性 1: 生成随机文档类型和内容，验证加载显示一致性
- 属性 2: 生成各种格式的文档内容，验证渲染正确性
- 属性 3: 生成随机搜索查询，验证搜索导航功能
- 属性 4: 模拟各种用户交互，验证响应性
- 属性 5: 测试 AI 集成的各种场景，验证同步性
- 属性 6: 生成随机注释操作，验证持久性
- 属性 7: 生成随机设置配置，验证生效性
- 属性 8: 模拟各种错误场景，验证处理完整性

### 集成测试

- **端到端预览流程**: 测试从文件选择到内容显示的完整流程
- **AI 集成测试**: 测试与对话功能的集成
- **多格式兼容性**: 测试各种文件格式的预览效果
- **性能测试**: 测试大文件和复杂文档的预览性能

### 视觉回归测试

- **渲染一致性**: 确保不同文档的渲染效果稳定
- **主题适配**: 测试不同主题下的显示效果
- **响应式布局**: 测试不同屏幕尺寸下的适配
- **跨浏览器兼容**: 测试主流浏览器的兼容性
