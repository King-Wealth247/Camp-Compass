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

export interface RegistrarRegisterStudentPayload {
  role: 'student';
  name: string;
  phone: string;
  institutionId: string;
  department: string;
  level: string;
  tuitionFullyPaid: boolean;
}

export interface RegistrarRegisterStaffPayload {
  role: 'staff';
  name: string;
  phone: string;
  institutionId: string;
  department: string;
  courseTaught: string;
}

export type RegistrarRegisterPayload = RegistrarRegisterStudentPayload | RegistrarRegisterStaffPayload;

export interface RegistrarRegisterResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  department: string | null;
  level: string | null;
  courseTaught: string | null;
  tuitionPaid: boolean;
  institutionId: string;
  createdAt: string;
  generatedPassword: string;
}

export class AuthService {
  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', payload);

    if (response.data?.token) {
      await apiClient.setToken(response.data.token);
    }

    return response;
  }

  async registerByRegistrar(
    payload: RegistrarRegisterPayload
  ): Promise<ApiResponse<RegistrarRegisterResponse>> {
    return apiClient.post<RegistrarRegisterResponse>('/api/auth/register', payload);
  }

  async getMe(): Promise<ApiResponse<{ user: { sub: string; role: string } }>> {
    return apiClient.get('/api/auth/me');
  }

  async logout(): Promise<void> {
    await apiClient.clearToken();
  }
}

export const authService = new AuthService();
