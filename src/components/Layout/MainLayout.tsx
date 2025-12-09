import { type FC } from 'react';
import Sidebar from './Sidebar';
import DocumentViewer from '../Preview/DocumentViewer';
import ChatPanel from '../Chat/ChatPanel';

const MainLayout: FC = () => {
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
          <div className="w-8 h-8 rounded-full bg-gray-300"></div>
        </div>
      </header>

      {/* 三栏主体布局 */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <DocumentViewer />
        <ChatPanel />
      </div>
    </div>
  );
};

export default MainLayout;
