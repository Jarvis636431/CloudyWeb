# 自定义拖拽分隔条实现文档

## 概述

本文档介绍如何手动实现可调节宽度的三栏布局，不依赖第三方库。适合深入理解拖拽交互原理。

---

## 核心原理

### 1. 鼠标事件监听

```typescript
onMouseDown  // 按下鼠标，开始拖拽
onMouseMove  // 拖动鼠标，计算位移
onMouseUp    // 松开鼠标，结束拖拽
```

### 2. 宽度计算

```typescript
const deltaX = currentMouseX - startMouseX;  // 鼠标移动距离
const newWidth = originalWidth + deltaX;     // 新宽度 = 原宽度 + 位移
```

---

## 完整实现代码

### Step 1: 创建可调节分隔条组件

**文件：`src/components/Layout/ResizeDivider.tsx`**

```typescript
import { type FC } from 'react';

interface ResizeDividerProps {
  onResize: (deltaX: number) => void;
}

const ResizeDivider: FC<ResizeDividerProps> = ({ onResize }) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const startX = e.clientX;  // 记录起始 X 坐标
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      onResize(deltaX);  // 通知父组件调整宽度
    };
    
    const handleMouseUp = () => {
      // 移除事件监听，停止拖拽
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    // 在 document 上监听，防止鼠标移出元素
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  return (
    <div 
      onMouseDown={handleMouseDown}
      className="w-1 bg-gray-200 hover:bg-blue-500 cursor-col-resize transition-colors flex-shrink-0"
    />
  );
};

export default ResizeDivider;
```

---

### Step 2: 主布局组件使用分隔条

**文件：`src/components/Layout/MainLayout.tsx`**

```typescript
import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import Sidebar from './Sidebar';
import DocumentViewer from '@/components/Preview/DocumentViewer';
import ChatPanel from '@/components/Chat/ChatPanel';
import ResizeDivider from './ResizeDivider';

const MainLayout: FC = () => {
  const navigate = useNavigate();
  const { username, clearAuth } = useAuthStore();
  
  // 状态：各栏宽度（px）
  const [leftWidth, setLeftWidth] = useState(256);    // 左侧栏
  const [rightWidth, setRightWidth] = useState(384);  // 右侧栏
  // 中间栏自动填充：flex-1

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      clearAuth();
      navigate('/login', { replace: true });
    }
  };

  // 调整左侧栏宽度
  const handleLeftResize = (deltaX: number) => {
    setLeftWidth(prev => {
      const newWidth = prev + deltaX;
      // 限制最小/最大宽度
      return Math.max(200, Math.min(600, newWidth));
    });
  };

  // 调整右侧栏宽度
  const handleRightResize = (deltaX: number) => {
    setRightWidth(prev => {
      const newWidth = prev - deltaX;  // 注意：右侧栏向左拉是减小
      return Math.max(280, Math.min(800, newWidth));
    });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 顶部导航栏 */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
        <h1 className="text-xl font-bold text-gray-800">知识库系统</h1>
        <div className="ml-auto flex items-center gap-4">
          <input
            type="search"
            placeholder="搜索文档..."
            className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{username}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-600"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      {/* 三栏主体布局 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧栏 - 固定宽度 */}
        <div 
          style={{ width: leftWidth }}
          className="overflow-auto border-r border-gray-200"
        >
          <Sidebar />
        </div>

        {/* 左侧分隔条 */}
        <ResizeDivider onResize={handleLeftResize} />

        {/* 中间栏 - 自动填充 */}
        <div className="flex-1 overflow-auto">
          <DocumentViewer />
        </div>

        {/* 右侧分隔条 */}
        <ResizeDivider onResize={handleRightResize} />

        {/* 右侧栏 - 固定宽度 */}
        <div 
          style={{ width: rightWidth }}
          className="overflow-auto border-l border-gray-200"
        >
          <ChatPanel />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
```

---

## 优化技巧

### 1. 防止文本选中

拖拽时可能会误选中文本，添加 CSS：

```css
.dragging {
  user-select: none;
}
```

在拖拽开始时添加到 body：

```typescript
const handleMouseDown = (e: React.MouseEvent) => {
  e.preventDefault();
  document.body.classList.add('dragging');
  
  // ... 拖拽逻辑
  
  const handleMouseUp = () => {
    document.body.classList.remove('dragging');
    // ...
  };
};
```

---

### 2. 添加视觉反馈

拖拽时高亮分隔条：

```typescript
const [isDragging, setIsDragging] = useState(false);

const handleMouseDown = (e: React.MouseEvent) => {
  setIsDragging(true);
  
  const handleMouseUp = () => {
    setIsDragging(false);
    // ...
  };
};

return (
  <div 
    className={`w-1 cursor-col-resize transition-colors ${
      isDragging ? 'bg-blue-500' : 'bg-gray-200 hover:bg-gray-300'
    }`}
    onMouseDown={handleMouseDown}
  />
);
```

---

### 3. 持久化宽度（保存用户偏好）

使用 localStorage：

```typescript
// 初始化时读取
const [leftWidth, setLeftWidth] = useState(() => {
  const saved = localStorage.getItem('layout-left-width');
  return saved ? parseInt(saved) : 256;
});

// 更新时保存
const handleLeftResize = (deltaX: number) => {
  setLeftWidth(prev => {
    const newWidth = Math.max(200, Math.min(600, prev + deltaX));
    localStorage.setItem('layout-left-width', newWidth.toString());
    return newWidth;
  });
};
```

---

### 4. 防抖优化（减少重绘）

频繁更新 DOM 可能影响性能：

```typescript
import { debounce } from 'lodash';

const handleMouseMove = debounce((moveEvent: MouseEvent) => {
  const deltaX = moveEvent.clientX - startX;
  onResize(deltaX);
}, 16);  // 约 60fps
```

---

## 进阶功能

### 双击重置宽度

```typescript
const handleDoubleClick = () => {
  setLeftWidth(256);  // 重置为默认宽度
};

<ResizeDivider 
  onResize={handleLeftResize}
  onDoubleClick={handleDoubleClick}
/>
```

---

### 键盘快捷键调整

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === '[') {
      setLeftWidth(prev => Math.max(200, prev - 50));
    }
    if (e.ctrlKey && e.key === ']') {
      setLeftWidth(prev => Math.min(600, prev + 50));
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## 完整工作流程图

```
用户按下鼠标（onMouseDown）
    ↓
记录起始 X 坐标（startX）
    ↓
监听 document 的 mousemove
    ↓
计算位移（deltaX = currentX - startX）
    ↓
调用 onResize(deltaX)
    ↓
父组件更新宽度状态
    ↓
触发重新渲染，调整栏宽
    ↓
用户松开鼠标（onMouseUp）
    ↓
移除事件监听，结束拖拽
```

---

## 对比第三方库

| 功能 | 自定义实现 | react-resizable-panels |
|------|-----------|----------------------|
| **代码量** | ~100 行 | ~10 行 |
| **可控性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **边界处理** | 需手动实现 | 自动处理 |
| **持久化** | 需手动实现 | 内置支持 |
| **学习价值** | ⭐⭐⭐⭐⭐ | ⭐⭐ |

---

## 总结

自定义实现可拖拽布局的核心要点：

1. **鼠标事件监听** - mousedown/mousemove/mouseup
2. **位移计算** - deltaX = currentX - startX
3. **状态管理** - useState 保存宽度
4. **边界限制** - Math.max/min 限制宽度范围
5. **事件清理** - removeEventListener 避免内存泄漏

**适合场景：**
- 深入学习拖拽交互原理
- 需要高度自定义样式和行为
- 项目对第三方依赖有限制

**不适合场景：**
- 快速开发，追求效率
- 需要复杂功能（如折叠/嵌套面板）
- 团队不熟悉 DOM 事件处理
