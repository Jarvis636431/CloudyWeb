import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';

const UserCard: FC = () => {
  const navigate = useNavigate();
  const { username, clearAuth } = useAuthStore();

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      clearAuth();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex items-center gap-3">
        {/* 用户头像 */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold text-sm">
            {username?.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* 用户信息 */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {username}
          </div>
          <div className="text-xs text-gray-500">在线</div>
        </div>

        {/* 退出按钮 */}
        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="退出登录"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default UserCard;
