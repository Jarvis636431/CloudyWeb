import { type FC } from 'react';
import FileActions from './FileActions';
import FileTree from './FileTree';
import UserCard from './UserCard';

const FileManager: FC = () => {
  return (
    <aside className="h-full bg-gray-50 flex flex-col">
      {/* 顶部操作栏 */}
      <FileActions />

      {/* 文件树区域 */}
      <div className="flex-1 p-4 overflow-y-auto">
        <FileTree />
      </div>

      {/* 底部用户信息卡片 */}
      <UserCard />
    </aside>
  );
};

export default FileManager;
