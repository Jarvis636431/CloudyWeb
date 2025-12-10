import request from './request';
import type { CreateDirRequest, DocInfo, ChunkInfo } from '../types';

/**
 * 文件与目录服务
 */
export const fileService = {
  /**
   * 创建目录
   * POST /files/dirs
   */
  createDir: async (params: CreateDirRequest): Promise<void> => {
    return request.post('/files/dirs', params);
  },

  /**
   * 列出子目录
   * GET /files/dirs
   */
  listDirs: async (path?: string): Promise<{ path: string; directories: string[] }> => {
    return request.get('/files/dirs', { params: { path } });
  },

  /**
   * 上传文件
   * POST /files/upload
   * 需要认证
   */
  uploadFile: async (
    file: File,
    directoryPath: string,
    tags?: string,
    index?: boolean,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('directory_path', directoryPath);
    if (tags) formData.append('tags', tags);
    if (index !== undefined) formData.append('index', String(index));

    return request.upload('/files/upload', formData, onProgress);
  },

  /**
   * 列出文档（聚合视图）
   * GET /files/docs
   */
  listDocs: async (directoryPath?: string): Promise<DocInfo[]> => {
    return request.get('/files/docs', { params: { directory_path: directoryPath } });
  },

  /**
   * 查看文档分片
   * GET /files/docs/{doc_id}/chunks
   */
  getDocChunks: async (docId: string): Promise<ChunkInfo[]> => {
    return request.get(`/files/docs/${docId}/chunks`);
  },

  /**
   * 删除文档
   * DELETE /files/docs/{doc_id}
   */
  deleteDoc: async (docId: string): Promise<void> => {
    return request.delete(`/files/docs/${docId}`);
  },
};
