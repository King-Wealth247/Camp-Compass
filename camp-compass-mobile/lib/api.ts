import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ApiError {
  error: string;
  status: number;
  timestamp?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.initToken();
  }

  private async initToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      this.token = token;
    } catch (error) {
      console.warn('Failed to load token from AsyncStorage');
    }
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.warn('Failed to save token to AsyncStorage');
    }
  }

  async clearToken(): Promise<void> {
    this.token = null;
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.warn('Failed to clear token from AsyncStorage');
    }
  }

  private getHeaders(config?: ApiRequestConfig): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config?.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    let data: unknown;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      return {
        error: {
          error: typeof data === 'object' && data !== null && 'error' in data
            ? (data as { error: string }).error
            : 'An error occurred',
          status: response.status,
          timestamp: new Date().toISOString(),
        },
        status: response.status,
      };
    }

    return {
      data: data as T,
      status: response.status,
    };
  }

  async request<T>(
    endpoint: string,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    // Ensure token is loaded
    if (!this.token) {
      await this.initToken();
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(config);

    const fetchConfig: RequestInit = {
      method: config?.method || 'GET',
      headers,
    };

    if (config?.body) {
      fetchConfig.body = JSON.stringify(config.body);
    }

    try {
      const controller = new AbortController();
      const timeout = config?.timeout || 30000;
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchConfig,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          error: { error: 'Request timeout', status: 408 },
          status: 408,
        };
      }

      return {
        error: {
          error: error instanceof Error ? error.message : 'Network error',
          status: 0,
          timestamp: new Date().toISOString(),
        },
        status: 0,
      };
    }
  }

  async get<T>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  async delete<T>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }
}

// Singleton instance
export const apiClient = new ApiClient();
