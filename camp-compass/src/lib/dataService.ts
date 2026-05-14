import { apiClient, ApiResponse } from './api';

export interface Hall {
  id: string;
  name: string;
  capacity: number;
  isAvailable: boolean;
  building: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  department: string;
  level: string;
  instructor: string;
  createdAt: string;
}

export interface Timetable {
  id: string;
  course: Course;
  hall: Hall;
  startTime: string;
  endTime: string;
  day: string;
  createdAt: string;
}

export class DataService {
  // Hall endpoints
  async getHalls(): Promise<ApiResponse<Hall[]>> {
    return apiClient.get<Hall[]>('/api/halls');
  }

  async getHall(id: string): Promise<ApiResponse<Hall>> {
    return apiClient.get<Hall>(`/api/halls/${id}`);
  }

  async createHall(data: Omit<Hall, 'id' | 'createdAt'>): Promise<ApiResponse<Hall>> {
    return apiClient.post<Hall>('/api/halls', data);
  }

  async updateHall(id: string, data: Partial<Hall>): Promise<ApiResponse<Hall>> {
    return apiClient.put<Hall>(`/api/halls/${id}`, data);
  }

  async deleteHall(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/api/halls/${id}`);
  }

  // Course endpoints
  async getCourses(): Promise<ApiResponse<Course[]>> {
    return apiClient.get<Course[]>('/api/courses');
  }

  async getCourse(id: string): Promise<ApiResponse<Course>> {
    return apiClient.get<Course>(`/api/courses/${id}`);
  }

  async createCourse(data: Omit<Course, 'id' | 'createdAt'>): Promise<ApiResponse<Course>> {
    return apiClient.post<Course>('/api/courses', data);
  }

  // Timetable endpoints
  async getTimetables(): Promise<ApiResponse<Timetable[]>> {
    return apiClient.get<Timetable[]>('/api/timetable');
  }

  async getTimetable(id: string): Promise<ApiResponse<Timetable>> {
    return apiClient.get<Timetable>(`/api/timetable/${id}`);
  }

  async getTimetablesByDepartmentAndLevel(
    department: string,
    level: string
  ): Promise<ApiResponse<Timetable[]>> {
    return apiClient.get<Timetable[]>(
      `/api/timetable?department=${department}&level=${level}`
    );
  }

  async createTimetable(data: Omit<Timetable, 'id' | 'createdAt'>): Promise<ApiResponse<Timetable>> {
    return apiClient.post<Timetable>('/api/timetable', data);
  }

  async generateTimetable(params: {
    campusId: string;
    startDate: string;
    endDate: string;
  }): Promise<ApiResponse<{ jobId: string; message: string }>> {
    return apiClient.post('/api/timetable/generate', params);
  }
}

export const dataService = new DataService();
