import { type FC } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import FileManager from '@/components/FileManager';
import DocumentViewer from '@/components/Preview/DocumentViewer';
import ChatPanel from '@/components/Chat/ChatPanel';

const MainLayout: FC = () => {
  // 已将用户信息移至 Sidebar 底部

  return (
    <div className="flex flex-col h-screen">
      {/* 顶部导航栏 */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        {/* 左侧 Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CLOUDY
          </h1>
        </div>

        {/* 右侧搜索框 */}
        <div className="relative w-96">
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            placeholder="搜索文档..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </header>

      {/* 三栏主体布局 - 可拖拽调整宽度 */}
      <PanelGroup direction="horizontal" className="flex-1">
        {/* 左侧文件管理器 */}
        <Panel defaultSize={20} minSize={15} maxSize={40}>
          <FileManager />
        </Panel>

        {/* 拖拽分隔条 */}
        <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-500 transition-colors cursor-col-resize" />

        {/* 中间文档预览 */}
        <Panel defaultSize={50} minSize={30}>
          <DocumentViewer />
        </Panel>

        {/* 拖拽分隔条 */}
        <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-500 transition-colors cursor-col-resize" />

        {/* 右侧对话面板 */}
        <Panel defaultSize={30} minSize={20} maxSize={50}>
          <ChatPanel />
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default MainLayout;
