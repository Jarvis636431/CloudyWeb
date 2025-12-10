import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useAuthStore } from '@/stores';
import Sidebar from './Sidebar';
import DocumentViewer from '@/components/Preview/DocumentViewer';
import ChatPanel from '@/components/Chat/ChatPanel';

const MainLayout: FC = () => {
  const navigate = useNavigate();
  const { username, clearAuth } = useAuthStore();

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      clearAuth();
      navigate('/login', { replace: true });
    }
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

      {/* 三栏主体布局 - 可拖拽调整宽度 */}
      <PanelGroup direction="horizontal" className="flex-1">
        {/* 左侧文件树 */}
        <Panel defaultSize={20} minSize={15} maxSize={40}>
          <Sidebar />
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
