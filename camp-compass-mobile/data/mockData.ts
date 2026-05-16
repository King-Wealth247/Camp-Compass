export interface Campus {
  id: string;
  name: string;
  city: string;
  region: string;
  coordinates: { lat: number; lng: number };
}

export interface Building {
  id: string;
  name: string;
  code: string;
  campusId: string;
  floors: number;
  coordinates: { lat: number; lng: number };
}

export interface Hall {
  id: string;
  code: string;
  name: string;
  buildingId: string;
  floor: number;
  capacity: number;
  type: 'lecture' | 'laboratory' | 'seminar' | 'theatre';
  available: boolean;
}

export interface TimetableEntry {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  lecturerName: string;
  hallId: string;
  hallCode: string;
  buildingId: string;
  floor: number;
  day: string;
  startTime: string;
  endTime: string;
  department: string;
  level: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  timestamp: string;
  read: boolean;
}

export const campuses: Campus[] = [
  {
    id: '1',
    name: 'Main Campus',
    city: 'Capital City',
    region: 'Central',
    coordinates: { lat: 40.7128, lng: -74.006 },
  },
  {
    id: '2',
    name: 'North Campus',
    city: 'Northern City',
    region: 'North',
    coordinates: { lat: 40.7589, lng: -73.9851 },
  },
];

export const buildings: Building[] = [
  { id: '1', name: 'Engineering Block', code: 'ENG', campusId: '1', floors: 5, coordinates: { lat: 40.7128, lng: -74.006 } },
  { id: '2', name: 'Science Building', code: 'SCI', campusId: '1', floors: 4, coordinates: { lat: 40.7138, lng: -74.007 } },
  { id: '3', name: 'Library Complex', code: 'LIB', campusId: '1', floors: 3, coordinates: { lat: 40.7118, lng: -74.005 } },
];

export const halls: Hall[] = [
  { id: '1', code: 'ENG-101', name: 'Main Lecture Hall', buildingId: '1', floor: 1, capacity: 200, type: 'lecture', available: true },
  { id: '2', code: 'ENG-201', name: 'Computer Lab A', buildingId: '1', floor: 2, capacity: 50, type: 'laboratory', available: true },
  { id: '3', code: 'SCI-102', name: 'Chemistry Lab', buildingId: '2', floor: 1, capacity: 40, type: 'laboratory', available: true },
  { id: '4', code: 'ENG-301', name: 'Seminar Room 1', buildingId: '1', floor: 3, capacity: 30, type: 'seminar', available: true },
  { id: '5', code: 'LIB-201', name: 'Auditorium', buildingId: '3', floor: 2, capacity: 500, type: 'theatre', available: true },
  { id: '6', code: 'SCI-201', name: 'Physics Lab', buildingId: '2', floor: 2, capacity: 45, type: 'laboratory', available: true },
];

export const timetableData: TimetableEntry[] = [
  // Computer Science - Year 3
  { id: '1', courseId: 'CS301', courseName: 'Data Structures', courseCode: 'CS301', lecturerName: 'Dr. John Smith', hallId: '1', hallCode: 'ENG-101', buildingId: '1', floor: 1, day: 'Monday', startTime: '09:00', endTime: '11:00', department: 'Computer Science', level: 'Year 3' },
  { id: '2', courseId: 'CS302', courseName: 'Database Systems', courseCode: 'CS302', lecturerName: 'Dr. Sarah Johnson', hallId: '2', hallCode: 'ENG-201', buildingId: '1', floor: 2, day: 'Monday', startTime: '11:00', endTime: '13:00', department: 'Computer Science', level: 'Year 3' },
  { id: '3', courseId: 'CS303', courseName: 'Software Engineering', courseCode: 'CS303', lecturerName: 'Dr. John Smith', hallId: '1', hallCode: 'ENG-101', buildingId: '1', floor: 1, day: 'Tuesday', startTime: '09:00', endTime: '11:00', department: 'Computer Science', level: 'Year 3' },
  { id: '4', courseId: 'CS304', courseName: 'Web Development', courseCode: 'CS304', lecturerName: 'Dr. Emily Brown', hallId: '2', hallCode: 'ENG-201', buildingId: '1', floor: 2, day: 'Wednesday', startTime: '14:00', endTime: '16:00', department: 'Computer Science', level: 'Year 3' },
  { id: '5', courseId: 'CS305', courseName: 'Operating Systems', courseCode: 'CS305', lecturerName: 'Dr. John Smith', hallId: '1', hallCode: 'ENG-101', buildingId: '1', floor: 1, day: 'Thursday', startTime: '09:00', endTime: '11:00', department: 'Computer Science', level: 'Year 3' },
  { id: '6', courseId: 'CS306', courseName: 'Computer Networks', courseCode: 'CS306', lecturerName: 'Dr. Michael Davis', hallId: '4', hallCode: 'ENG-301', buildingId: '1', floor: 3, day: 'Friday', startTime: '11:00', endTime: '13:00', department: 'Computer Science', level: 'Year 3' },
  // Computer Science - Year 1
  { id: '7', courseId: 'CS101', courseName: 'Intro to Programming', courseCode: 'CS101', lecturerName: 'Dr. Emily Brown', hallId: '5', hallCode: 'LIB-201', buildingId: '3', floor: 2, day: 'Monday', startTime: '08:00', endTime: '10:00', department: 'Computer Science', level: 'Year 1' },
  { id: '8', courseId: 'CS102', courseName: 'Discrete Mathematics', courseCode: 'CS102', lecturerName: 'Dr. Michael Davis', hallId: '1', hallCode: 'ENG-101', buildingId: '1', floor: 1, day: 'Wednesday', startTime: '10:00', endTime: '12:00', department: 'Computer Science', level: 'Year 1' },
  // Engineering - Year 2
  { id: '9', courseId: 'ENG201', courseName: 'Thermodynamics', courseCode: 'ENG201', lecturerName: 'Dr. Sarah Johnson', hallId: '1', hallCode: 'ENG-101', buildingId: '1', floor: 1, day: 'Tuesday', startTime: '13:00', endTime: '15:00', department: 'Engineering', level: 'Year 2' },
  { id: '10', courseId: 'ENG202', courseName: 'Fluid Mechanics', courseCode: 'ENG202', lecturerName: 'Dr. John Smith', hallId: '4', hallCode: 'ENG-301', buildingId: '1', floor: 3, day: 'Thursday', startTime: '13:00', endTime: '15:00', department: 'Engineering', level: 'Year 2' },
  { id: '11', courseId: 'ENG203', courseName: 'Circuit Analysis', courseCode: 'ENG203', lecturerName: 'Dr. Michael Davis', hallId: '2', hallCode: 'ENG-201', buildingId: '1', floor: 2, day: 'Friday', startTime: '09:00', endTime: '11:00', department: 'Engineering', level: 'Year 2' },
  // Science - Year 1
  { id: '12', courseId: 'SCI101', courseName: 'General Chemistry', courseCode: 'SCI101', lecturerName: 'Dr. Emily Brown', hallId: '3', hallCode: 'SCI-102', buildingId: '2', floor: 1, day: 'Monday', startTime: '14:00', endTime: '16:00', department: 'Science', level: 'Year 1' },
  { id: '13', courseId: 'SCI102', courseName: 'Physics I', courseCode: 'SCI102', lecturerName: 'Dr. Sarah Johnson', hallId: '6', hallCode: 'SCI-201', buildingId: '2', floor: 2, day: 'Wednesday', startTime: '08:00', endTime: '10:00', department: 'Science', level: 'Year 1' },
];

export const notifications: Notification[] = [
  { id: '1', title: 'Timetable Update', message: 'CS301 Data Structures has been moved to ENG-201 on Monday', type: 'warning', timestamp: '2026-03-24T09:00:00', read: false },
  { id: '2', title: 'New Course Added', message: 'Advanced Machine Learning has been added to your timetable', type: 'info', timestamp: '2026-03-23T14:30:00', read: false },
  { id: '3', title: 'System Maintenance', message: 'Scheduled maintenance on Saturday from 2:00 AM to 6:00 AM', type: 'info', timestamp: '2026-03-22T10:00:00', read: true },
];
