export enum Role {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

export interface Student {
  id: string;
  name: string;
  class: string;
  attendance: number;
  feesPaid: boolean;
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  date: string;
  status: 'Present' | 'Absent';
}

export interface FeeRecord {
  studentId: string;
  studentName: string;
  amount: number;
  status: 'Paid' | 'Pending';
  dueDate: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  avatar: string;
  assignedClasses: string[];
}
