import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, Project, GenerationTask } from '../types';

const API_BASE_URL = 'http://localhost:8080';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        // 添加认证 token 等
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API] Response:`, response.data);
        return response;
      },
      (error) => {
        console.error(`[API] Error:`, error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.request(config);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || '请求失败',
      };
    }
  }

  // 项目相关 API
  async createProject(): Promise<ApiResponse<Project>> {
    return this.request<Project>({
      method: 'POST',
      url: '/api/projects',
    });
  }

  async getProjects(): Promise<ApiResponse<Project[]>> {
    return this.request<Project[]>({
      method: 'GET',
      url: '/api/projects',
    });
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    return this.request<Project>({
      method: 'GET',
      url: `/api/projects/${id}`,
    });
  }

  async updateProject(id: string, data: Partial<Project>): Promise<ApiResponse<Project>> {
    return this.request<Project>({
      method: 'PUT',
      url: `/api/projects/${id}`,
      data,
    });
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'DELETE',
      url: `/api/projects/${id}`,
    });
  }

  // 生成相关 API
  async generateScript(projectId: string, prompt: string, model: string): Promise<ApiResponse<GenerationTask>> {
    return this.request<GenerationTask>({
      method: 'POST',
      url: '/api/generate/script',
      data: { projectId, prompt, model },
    });
  }

  async generateStoryboard(projectId: string, script: string): Promise<ApiResponse<GenerationTask>> {
    return this.request<GenerationTask>({
      method: 'POST',
      url: '/api/generate/storyboard',
      data: { projectId, script },
    });
  }

  async generateImage(projectId: string, panelId: string, prompt: string, model: string): Promise<ApiResponse<GenerationTask>> {
    return this.request<GenerationTask>({
      method: 'POST',
      url: '/api/generate/image',
      data: { projectId, panelId, prompt, model },
    });
  }

  async generateVideo(projectId: string, imageId: string, model: string, duration: number): Promise<ApiResponse<GenerationTask>> {
    return this.request<GenerationTask>({
      method: 'POST',
      url: '/api/generate/video',
      data: { projectId, imageId, model, duration },
    });
  }

  async getTaskStatus(taskId: string): Promise<ApiResponse<GenerationTask>> {
    return this.request<GenerationTask>({
      method: 'GET',
      url: `/api/tasks/${taskId}`,
    });
  }

  // 视频拼接
  async concatVideos(projectId: string, videoIds: string[]): Promise<ApiResponse<GenerationTask>> {
    return this.request<GenerationTask>({
      method: 'POST',
      url: '/api/video/concat',
      data: { projectId, videoIds },
    });
  }

  // 文件上传下载
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<string>({
      method: 'POST',
      url: '/api/upload',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  async downloadFile(url: string, filename: string): Promise<void> {
    try {
      const response = await this.client.get(url, {
        responseType: 'blob',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(response.data);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('下载文件失败:', error);
      throw error;
    }
  }
}

export const api = new ApiClient();
