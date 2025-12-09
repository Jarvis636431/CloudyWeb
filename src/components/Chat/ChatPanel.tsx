import { type FC, useState } from 'react';

const ChatPanel: FC = () => {
  const [message, setMessage] = useState('');

  return (
    <aside className="w-96 border-l border-gray-200 bg-white h-full flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">AI 对话</h2>
        <p className="text-sm text-gray-500">基于文档智能问答</p>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
            AI
          </div>
          <div className="flex-1 bg-blue-50 rounded-lg p-3">
            <p className="text-sm">你好！我可以帮你理解和分析文档内容。</p>
          </div>
        </div>
      </div>

      {/* 输入框 */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="输入你的问题..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            发送
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ChatPanel;
