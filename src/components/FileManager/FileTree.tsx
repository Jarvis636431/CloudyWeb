import { type FC, useEffect } from 'react';
import { useFileStore } from '@/stores';
import { fileService } from '@/services';

const FileTree: FC = () => {
  const { 
    currentDirectory, 
    directories, 
    documents, 
    selectedDocId,
    setDirectories, 
    setDocuments, 
    selectDocument,
    setLoading,
    isLoading
  } = useFileStore();

  // 初始加载
  useEffect(() => {
    loadData();
  }, [currentDirectory]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 并行加载目录和文档
      const [dirs, docs] = await Promise.all([
        fileService.listDirs(currentDirectory),
        fileService.listDocs(currentDirectory)
      ]);
      
      setDirectories(dirs);
      setDocuments(docs);
    } catch (error) {
      console.error('加载文件列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocClick = (doc: typeof documents[0]) => {
    selectDocument(doc.doc_id, doc);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* 目录列表 */}
      {directories.map((dir) => (
        <div
          key={dir}
          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          <span className="text-sm text-gray-700">{dir}</span>
        </div>
      ))}

      {/* 文档列表 */}
      {documents.map((doc) => (
        <div
          key={doc.doc_id}
          onClick={() => handleDocClick(doc)}
          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
            selectedDocId === doc.doc_id
              ? 'bg-blue-50 text-blue-700'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{doc.filename}</div>
            {doc.tags && doc.tags.length > 0 && (
              <div className="flex gap-1 mt-1">
                {doc.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* 空状态 */}
      {directories.length === 0 && documents.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-400">
          暂无文件
        </div>
      )}
    </div>
  );
};

export default FileTree;
