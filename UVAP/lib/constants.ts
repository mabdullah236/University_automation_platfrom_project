import { User, Role, Student, AttendanceRecord, FeeRecord, Teacher } from './types';
import { LayoutDashboard, Users, UserCheck, BarChart, BookUser, FileCheck2, DollarSign } from 'lucide-react';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@university.com', role: Role.ADMIN, avatar: 'https://picsum.photos/seed/admin/100' },
  { id: '2', name: 'Teacher Smith', email: 'teacher@university.com', role: Role.TEACHER, avatar: 'https://picsum.photos/seed/teacher/100' },
  { id: '3', name: 'Student John', email: 'student@university.com', role: Role.STUDENT, avatar: 'https://picsum.photos/seed/student/100' },
];

// --- START: New Randomized Student Data ---

const studentNames = [
  "Olivia Chen", "Benjamin Carter", "Sophia Rodriguez", "Liam Goldberg", "Ava Nguyen", 
  "Noah Patel", "Isabella Martinez", "Mason Kim", "Harper Garcia", "Ethan Thompson", 
  "Amelia Lee", "Alexander Wright", "Mia Scott", "James Green", "Charlotte Adams", 
  "William Baker", "Evelyn King", "Michael Hill", "Abigail Nelson", "Daniel Campbell"
];

export const classes = ['CS101', 'CS102', 'PHY201', 'MATH101', 'ENG101', 'STAT210', 'LIT305', 'CS103'];

const generatedStudents: Student[] = [
  // Ensure the mock login student exists so the student dashboard works
  { id: '200', name: 'Student John', class: 'CS101', attendance: 88, feesPaid: true },
];
const generatedFees: FeeRecord[] = [
  { studentId: '200', studentName: 'Student John', amount: 1250, status: 'Paid', dueDate: '2024-08-20' },
];
const generatedAttendance: AttendanceRecord[] = [
  { studentId: '200', studentName: 'Student John', date: '2024-07-29', status: 'Present' },
];

studentNames.forEach((name, index) => {
  const studentId = (201 + index).toString();
  const studentClass = classes[Math.floor(Math.random() * classes.length)];
  const attendance = Math.floor(Math.random() * 41) + 60; // 60-100%
  const feesPaid = Math.random() > 0.3; // 70% chance of fees being paid

  generatedStudents.push({
    id: studentId,
    name: name,
    class: studentClass,
    attendance: attendance,
    feesPaid: feesPaid,
  });

  generatedFees.push({
    studentId: studentId,
    studentName: name,
    amount: 1250,
    status: feesPaid ? 'Paid' : 'Pending',
    dueDate: '2024-08-20',
  });

  // Add attendance for today for all students
  generatedAttendance.push({
    studentId: studentId,
    studentName: name,
    date: '2024-07-29',
    status: Math.random() > 0.2 ? 'Present' : 'Absent', // 80% chance of being present
  });
});


export const STUDENTS_DATA: Student[] = generatedStudents;
export const ATTENDANCE_DATA: AttendanceRecord[] = generatedAttendance;
export const FEES_DATA: FeeRecord[] = generatedFees;

// --- END: New Randomized Student Data ---


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