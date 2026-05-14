import { apiClient, ApiResponse } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'staff' | 'admin' | 'registrar';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role?: 'student' | 'staff' | 'admin' | 'registrar';
  institutionId: string;
}

export class AuthService {
  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', payload);

    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }

    return response;
  }

  async register(payload: RegisterPayload): Promise<ApiResponse<User>> {
    return apiClient.post<User>('/api/auth/register', payload);
  }

  async getMe(): Promise<ApiResponse<{ user: { sub: string; role: string } }>> {
    return apiClient.get('/api/auth/me');
  }

  async logout(): Promise<void> {
    apiClient.clearToken();
  }

  getToken(): string | null {
    return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
  }
}

export const authService = new AuthService();
