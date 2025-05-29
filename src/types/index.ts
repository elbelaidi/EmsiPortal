
export type UserRole = 'student' | 'supervisor';

export interface User {
  id: string;
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

export interface Absence {
  id: string;
  studentId: string;
  subject: string;
  date: string;
  time: string;
  status: 'pending' | 'justified' | 'unjustified';
  reason?: string;
  description?: string;
  documentUrl?: string;
  submittedOn?: string;
}

export interface Class {
  id: string;
  name: string;
  department: string;
  year: string;
  students: string[]; // student IDs
}

export interface Course {
  id: string;
  name: string;
  room: string;
  day: string;
  startTime: string;
  endTime: string;
  professor: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}
