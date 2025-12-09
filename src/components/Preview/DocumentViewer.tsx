import { type FC } from 'react';

const DocumentViewer: FC = () => {
  return (
    <main className="flex-1 bg-gray-50 h-full overflow-y-auto">
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 min-h-[600px]">
          <h1 className="text-2xl font-bold mb-4">文档预览</h1>
          <div className="text-gray-600">
            <p className="mb-4">选择左侧文件查看预览内容</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <p className="text-gray-400">文档内容将显示在这里</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DocumentViewer;
