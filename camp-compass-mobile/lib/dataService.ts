import { apiClient, ApiResponse } from './api';

export interface Hall {
  id: string;
  name: string;
  capacity: number;
  available: boolean;
  building: {
    id: string;
    name: string;
    campusId: string;
    campus?: {
      id: string;
      name: string;
    };
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

export interface Availability {
  id: string;
  lecturerId: string;
  lecturer?: { id: string; name: string; email: string };
  monday: boolean; mondayTime: string | null;
  tuesday: boolean; tuesdayTime: string | null;
  wednesday: boolean; wednesdayTime: string | null;
  thursday: boolean; thursdayTime: string | null;
  friday: boolean; fridayTime: string | null;
  saturday: boolean; saturdayTime: string | null;
  resubmission: 'unseen' | 'validated' | 'rejected' | null;
  description: string | null;
  submissionDate: string;
}

export type AvailabilityPayload = Omit<Availability, 'id' | 'submissionDate' | 'lecturer' | 'resubmission'>;

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  broadcast: boolean;
  read: boolean;
  createdAt: string;
}

function normalizeHall(raw: any): Hall {
  return {
    ...raw,
    available: raw.available ?? raw.isAvailable ?? false,
    building: {
      ...raw.building,
      campus: raw.building?.campus,
    },
  };
}

export class DataService {
  // Hall endpoints
  async getHalls(): Promise<ApiResponse<Hall[]>> {
    const response = await apiClient.get<any[]>('/api/halls');
    if (response.data) {
      response.data = response.data.map(normalizeHall);
    }
    return response as ApiResponse<Hall[]>;
  }

  async getHall(id: string): Promise<ApiResponse<Hall>> {
    const response = await apiClient.get<any>(`/api/halls/${id}`);
    if (response.data) {
      response.data = normalizeHall(response.data);
    }
    return response as ApiResponse<Hall>;
  }

  async createHall(data: Omit<Hall, 'id' | 'createdAt'>): Promise<ApiResponse<Hall>> {
    const payload = {
      ...data,
      isAvailable: data.available,
    };
    const response = await apiClient.post<any>('/api/halls', payload);
    if (response.data) {
      response.data = normalizeHall(response.data);
    }
    return response as ApiResponse<Hall>;
  }

  async updateHall(id: string, data: Partial<Hall>): Promise<ApiResponse<Hall>> {
    const payload = {
      ...data,
      isAvailable: data.available,
    };
    const response = await apiClient.put<any>(`/api/halls/${id}`, payload);
    if (response.data) {
      response.data = normalizeHall(response.data);
    }
    return response as ApiResponse<Hall>;
  }

  async deleteHall(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/api/halls/${id}`);
  }

  // Campus endpoints
  async getCampuses(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/api/campuses');
  }

  async getCampus(id: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/api/campuses/${id}`);
  }

  async createCampus(data: any): Promise<ApiResponse<any>> {
    return apiClient.post<any>('/api/campuses', data);
  }

  async updateCampus(id: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.put<any>(`/api/campuses/${id}`, data);
  }

  async deleteCampus(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/api/campuses/${id}`);
  }

  // Building endpoints
  async getBuildings(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/api/buildings');
  }

  async getBuilding(id: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/api/buildings/${id}`);
  }

  async createBuilding(data: any): Promise<ApiResponse<any>> {
    return apiClient.post<any>('/api/buildings', data);
  }

  async updateBuilding(id: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.put<any>(`/api/buildings/${id}`, data);
  }

  async deleteBuilding(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/api/buildings/${id}`);
  }

  // Institution endpoints
  async getInstitutions(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/api/institutions');
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
      `/api/timetable?department=${encodeURIComponent(department)}&level=${encodeURIComponent(level)}`
    );
  }

  async getTimetablesByInstructor(instructor: string): Promise<ApiResponse<Timetable[]>> {
    return apiClient.get<Timetable[]>(
      `/api/timetable?instructor=${encodeURIComponent(instructor)}`
    );
  }

  async createTimetable(data: Omit<Timetable, 'id' | 'createdAt'>): Promise<ApiResponse<Timetable>> {
    return apiClient.post<Timetable>('/api/timetable', data);
  }

  // Availability endpoints
  async getAvailabilities(lecturerId?: string): Promise<ApiResponse<Availability[]>> {
    const query = lecturerId ? `?lecturerId=${encodeURIComponent(lecturerId)}` : '';
    return apiClient.get<Availability[]>(`/api/availability${query}`);
  }

  async submitAvailability(data: AvailabilityPayload): Promise<ApiResponse<Availability>> {
    return apiClient.post<Availability>('/api/availability', data);
  }

  async reviewResubmission(id: string, action: 'validate' | 'reject'): Promise<ApiResponse<{ availability: Availability; message: string; regenerated?: number }>> {
    return apiClient.patch(`/api/availability/${id}`, { action });
  }

  async generateTimetable(params: {
    campusId: string;
    startDate: string;
    endDate: string;
  }): Promise<ApiResponse<{ jobId: string; message: string }>> {
    return apiClient.post('/api/timetable/generate', params);
  }

  // Notification endpoints
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return apiClient.get<Notification[]>('/api/notifications');
  }

  async markNotificationRead(id: string): Promise<ApiResponse<any>> {
    return apiClient.patch<any>(`/api/notifications/${id}`, {});
  }

  async deleteNotification(id: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/api/notifications/${id}`);
  }

  async saveFcmToken(token: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>('/api/users/fcm-token', { token });
  }

  // Profile endpoints
  async getCurrentUserProfile(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/api/users/me');
  }

  async updateUser(id: string, data: { name?: string; phone?: string; email?: string }): Promise<ApiResponse<any>> {
    return apiClient.put<any>(`/api/users/${id}`, data);
  }
}

export const dataService = new DataService();
