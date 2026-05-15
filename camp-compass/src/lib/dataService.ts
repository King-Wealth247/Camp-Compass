import { apiClient, ApiResponse } from './api';

export interface Hall {
  id: string;
  name: string;
  capacity: number;
  available: boolean;
  floor: number;
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

export interface Building {
  id: string;
  name: string;
  code?: string;
  campusId: string;
  campus?: {
    id: string;
    name: string;
  };
  floors: number;
  latitude?: number;
  longitude?: number;
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

export interface Campus {
  id: string;
  name: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  institutionId: string;
  institution?: {
    id: string;
    name: string;
  };
  buildings?: Building[];
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: string;
  department?: string;
  level?: string;
  courseTaught?: string | null;
  tuitionPaid: boolean;
  institutionId: string;
  createdAt: string;
}

export interface Institution {
  id: string;
  name: string;
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
  monday: boolean;
  mondayTime: string | null;
  tuesday: boolean;
  tuesdayTime: string | null;
  wednesday: boolean;
  wednesdayTime: string | null;
  thursday: boolean;
  thursdayTime: string | null;
  friday: boolean;
  fridayTime: string | null;
  saturday: boolean;
  saturdayTime: string | null;
  resubmission: 'unseen' | 'validated' | 'rejected' | null;
  description: string | null;
  submissionDate: string;
  lecturer: {
    id: string;
    name: string;
    email: string;
  };
}

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

  async searchHalls(query: string): Promise<ApiResponse<Hall[]>> {
    const response = await apiClient.get<any[]>(`/api/halls/search?q=${encodeURIComponent(query)}`);
    if (response.data) {
      response.data = response.data.map(normalizeHall);
    }
    return response as ApiResponse<Hall[]>;
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

  async updateCourse(id: string, data: Partial<Course>): Promise<ApiResponse<Course>> {
    return apiClient.put<Course>(`/api/courses/${id}`, data);
  }

  async deleteCourse(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/api/courses/${id}`);
  }

  // Campus endpoints
  async getCampuses(): Promise<ApiResponse<Campus[]>> {
    return apiClient.get<Campus[]>('/api/campuses');
  }

  async getCampus(id: string): Promise<ApiResponse<Campus>> {
    return apiClient.get<Campus>(`/api/campuses/${id}`);
  }

  async createCampus(data: Omit<Campus, 'id' | 'createdAt' | 'buildings' | 'institution'>): Promise<ApiResponse<Campus>> {
    return apiClient.post<Campus>('/api/campuses', data);
  }

  async updateCampus(id: string, data: Partial<Campus>): Promise<ApiResponse<Campus>> {
    return apiClient.put<Campus>(`/api/campuses/${id}`, data);
  }

  async deleteCampus(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/api/campuses/${id}`);
  }

  // Building endpoints
  async getBuildings(): Promise<ApiResponse<Building[]>> {
    return apiClient.get<Building[]>('/api/buildings');
  }

  async getBuilding(id: string): Promise<ApiResponse<Building>> {
    return apiClient.get<Building>(`/api/buildings/${id}`);
  }

  async createBuilding(data: Omit<Building, 'id' | 'createdAt' | 'campus'>): Promise<ApiResponse<Building>> {
    return apiClient.post<Building>('/api/buildings', data);
  }

  async updateBuilding(id: string, data: Partial<Building>): Promise<ApiResponse<Building>> {
    return apiClient.put<Building>(`/api/buildings/${id}`, data);
  }

  async deleteBuilding(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/api/buildings/${id}`);
  }

  // User endpoints
  async getInstitutions(): Promise<ApiResponse<Institution[]>> {
    return apiClient.get<Institution[]>('/api/institutions');
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    return apiClient.get<User[]>('/api/users');
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/api/users/${id}`);
  }

  async getCurrentUserProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/api/auth/me');
  }

  async createUser(data: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<ApiResponse<User>> {
    return apiClient.post<User>('/api/users', data);
  }

  async updateUser(id: string, data: Partial<User> & { password?: string }): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`/api/users/${id}`, data);
  }

  async deleteUser(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/api/users/${id}`);
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

  async generateTimetable(params: {
    campusId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{ jobId: string; message: string; generated?: Timetable[] }>> {
    return apiClient.post('/api/timetable/generate', params);
  }

  // Availability endpoints
  async getAvailabilities(lecturerId?: string): Promise<ApiResponse<Availability[]>> {
    const url = lecturerId ? `/api/availability?lecturerId=${lecturerId}` : '/api/availability';
    return apiClient.get<Availability[]>(url);
  }

  async submitAvailability(data: {
    lecturerId: string;
    monday: boolean;
    mondayTime?: string;
    tuesday: boolean;
    tuesdayTime?: string;
    wednesday: boolean;
    wednesdayTime?: string;
    thursday: boolean;
    thursdayTime?: string;
    friday: boolean;
    fridayTime?: string;
    saturday: boolean;
    saturdayTime?: string;
    description?: string;
  }): Promise<ApiResponse<Availability>> {
    return apiClient.post<Availability>('/api/availability', data);
  }

  async reviewAvailability(id: string, action: 'validate' | 'reject'): Promise<ApiResponse<Availability>> {
    return apiClient.patch<Availability>(`/api/availability/${id}`, { action });
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

  async sendBroadcastNotification(data: { title: string; message: string; type?: string; targetRole?: string }): Promise<ApiResponse<any>> {
    return apiClient.post<any>('/api/notifications', data);
  }

  async saveFcmToken(token: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>('/api/users/fcm-token', { token });
  }
}

export const dataService = new DataService();
