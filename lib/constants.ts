import { User, Role, Student, AttendanceRecord, FeeRecord, Teacher } from './types';
import { LayoutDashboard, Users, UserCheck, BarChart, BookUser, FileCheck2, DollarSign } from 'lucide-react';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@university.com', role: Role.ADMIN, avatar: 'https://picsum.photos/seed/admin/100' },
  { id: '2', name: 'Teacher Smith', email: 'teacher@university.com', role: Role.TEACHER, avatar: 'https://picsum.photos/seed/teacher/100' },
  { id: '3', name: 'Student John', email: 'student@university.com', role: Role.STUDENT, avatar: 'https://picsum.photos/seed/student/100' },
];

export const TEACHERS_DATA: Teacher[] = [
    { id: '2', name: 'Teacher Smith', email: 'teacher@university.com', avatar: 'https://picsum.photos/seed/teacher/100', assignedClasses: ['CS101', 'CS102'] },
    { id: '4', name: 'Eleanor Vance', email: 'eleanor.vance@university.com', avatar: 'https://picsum.photos/seed/teacher2/100', assignedClasses: ['CS103', 'PHY201'] },
    { id: '5', name: 'Marcus Holloway', email: 'marcus.holloway@university.com', avatar: 'https://picsum.photos/seed/teacher3/100', assignedClasses: ['MATH101', 'STAT210'] },
    { id: '6', name: 'Clara Oswald', email: 'clara.oswald@university.com', avatar: 'https://picsum.photos/seed/teacher4/100', assignedClasses: ['ENG101', 'LIT305'] },
];

export const STUDENTS_DATA: Student[] = [
  { id: '101', name: 'Alice Johnson', class: 'CS101', attendance: 95, feesPaid: true },
  { id: '102', name: 'Bob Williams', class: 'CS101', attendance: 82, feesPaid: true },
  { id: '103', name: 'Charlie Brown', class: 'CS102', attendance: 74, feesPaid: false },
  { id: '104', name: 'Diana Miller', class: 'CS102', attendance: 88, feesPaid: true },
  { id: '105', name: 'Ethan Davis', class: 'CS103', attendance: 91, feesPaid: false },
  { id: '106', name: 'Fiona Garcia', class: 'CS103', attendance: 65, feesPaid: true },
];

export const ATTENDANCE_DATA: AttendanceRecord[] = [
    { studentId: '101', studentName: 'Alice Johnson', date: '2024-07-28', status: 'Present' },
    { studentId: '102', studentName: 'Bob Williams', date: '2024-07-28', status: 'Present' },
    { studentId: '103', studentName: 'Charlie Brown', date: '2024-07-28', status: 'Absent' },
    { studentId: '104', studentName: 'Diana Miller', date: '2024-07-28', status: 'Present' },
    { studentId: '105', studentName: 'Ethan Davis', date: '2024-07-28', status: 'Present' },
];

export const FEES_DATA: FeeRecord[] = [
    { studentId: '101', studentName: 'Alice Johnson', amount: 1200, status: 'Paid', dueDate: '2024-07-20' },
    { studentId: '102', studentName: 'Bob Williams', amount: 1200, status: 'Paid', dueDate: '2024-07-20' },
    { studentId: '103', studentName: 'Charlie Brown', amount: 1200, status: 'Pending', dueDate: '2024-07-20' },
    { studentId: '104', studentName: 'Diana Miller', amount: 1200, status: 'Paid', dueDate: '2024-07-20' },
    { studentId: '105', studentName: 'Ethan Davis', amount: 1200, status: 'Pending', dueDate: '2024-07-20' },
];


export const NAV_LINKS = {
  [Role.ADMIN]: [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Teachers', href: '/admin/teachers', icon: BookUser },
    { name: 'Attendance', href: '/admin/attendance', icon: UserCheck },
    { name: 'Fees', href: '/admin/fees', icon: DollarSign },
  ],
  [Role.TEACHER]: [
    { name: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
    { name: 'My Students', href: '/teacher/students', icon: Users },
    { name: 'Mark Attendance', href: '/teacher/attendance', icon: UserCheck },
  ],
  [Role.STUDENT]: [
    { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { name: 'My Attendance', href: '/student/attendance', icon: BarChart },
    { name: 'My Fees', href: '/student/fees', icon: FileCheck2 },
  ],
};
