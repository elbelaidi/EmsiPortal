export type UserRole = 'student' | 'supervisor';

export interface User {
  user_id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  year?: string;
  class?: string;
  phoneNumber?: string;
  address?: string;
  profileImage?: string;
  absences?: number;
  justifiedAbsences?: number;
}

export interface LoginResponse {
  user_id: string;
  username: string;
  role: UserRole;
  token?: string;
}

export interface Course {
  id: string;
  name: string;
  room: string;
  day: string;
  startTime: string;
  endTime: string;
  professor: string;
  department: string;
  year: string;
}
