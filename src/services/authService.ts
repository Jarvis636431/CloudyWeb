import request from './request';
import type {
  RegisterRequest,
  LoginRequest,
  RefreshRequest,
  AuthResponse,
} from '../types';

/**
 * 认证服务
 */
export const authService = {
  /**
   * 注册新用户
   * POST /auth/register
   */
  register: async (params: RegisterRequest): Promise<AuthResponse> => {
    return request.post('/auth/register', params);
  },

  /**
   * 用户登录
   * POST /auth/login
   */
  login: async (params: LoginRequest): Promise<AuthResponse> => {
    return request.post('/auth/login', params);
  },

  /**
   * 刷新 Token
   * POST /auth/refresh
   */
  refresh: async (params: RefreshRequest): Promise<AuthResponse> => {
    return request.post('/auth/refresh', params);
  },
};
