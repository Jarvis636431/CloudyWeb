import { type FC } from 'react';

const Sidebar: FC = () => {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">文件目录</h2>
        {/* 文件树将在这里渲染 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
            <span>📁</span>
            <span>根目录</span>
          </div>
          <div className="pl-6 space-y-1">
            <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
              <span>📄</span>
              <span>示例文档.pdf</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
