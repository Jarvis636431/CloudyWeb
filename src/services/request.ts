import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { authService } from './authService';

// 防止刷新 Token 循环
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// 创建 axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 access_token
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 直接返回响应，不做业务 code 判断（后端直接返回数据）
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 处理 401 错误 - Token 过期
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 已经在刷新中，将请求加入队列
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // 没有 refresh_token，直接清空并跳转登录
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      try {
        // 刷新 Token
        const response = await authService.refresh({ refresh_token: refreshToken });
        
        // 保存新 Token
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);

        // 更新原请求的 Token
        originalRequest.headers.Authorization = `Bearer ${response.access_token}`;

        // 处理队列中的请求
        processQueue(null, response.access_token);

        // 重新发起原请求
        return instance(originalRequest);
      } catch (refreshError) {
        // 刷新失败，清空认证信息并跳转登录
        processQueue(refreshError, null);
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 处理其他 HTTP 错误
    if (error.response) {
      switch (error.response.status) {
        case 403:
          console.error('拒绝访问');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器错误');
          break;
        default:
          console.error('请求失败:', error.message);
      }
    } else {
      console.error('网络错误:', error.message);
    }
    return Promise.reject(error);
  }
);

// 处理队列中的请求
function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

// 清空认证信息并跳转登录
function clearAuthAndRedirect() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('auth-storage'); // zustand persist 的存储
  
  // 跳转到登录页
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

// 封装请求方法
class Request {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.get<T>(url, config).then((res) => res.data);
  }

  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return instance.post<T>(url, data, config).then((res) => res.data);
  }

  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return instance.put<T>(url, data, config).then((res) => res.data);
  }

  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete<T>(url, config).then((res) => res.data);
  }

  // 上传文件
  upload<T = unknown>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> {
    return instance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    }).then((res) => res.data);
  }
}

export default new Request();
