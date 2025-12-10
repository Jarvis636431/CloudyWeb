import { type FC } from 'react';
import { useFileStore } from '@/stores';

const FileActions: FC = () => {
  const { triggerRefresh } = useFileStore();

  const handleCreateFolder = () => {
    // TODO: 实现创建文件夹
    console.log('创建文件夹');
  };

  const handleUpload = () => {
    // TODO: 实现上传文件
    console.log('上传文件');
  };

  const handleRefresh = () => {
    triggerRefresh(); // 触发刷新
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200">
      {/* 左侧标题 */}
      <h2 className="text-sm font-semibold text-gray-700">文件目录</h2>

      {/* 右侧操作按钮 */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCreateFolder}
          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="创建文件夹"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
        </button>

        <button
          onClick={handleUpload}
          className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
          title="上传文件"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </button>

        <button
          onClick={handleRefresh}
          className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          title="刷新"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FileActions;
