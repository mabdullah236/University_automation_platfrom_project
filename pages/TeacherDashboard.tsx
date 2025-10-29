
import React from 'react';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { STUDENTS_DATA, ATTENDANCE_DATA } from '../lib/constants';
import { Users, UserCheck, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const TeacherDashboard: React.FC = () => {
    // Assuming the teacher teaches all these students for this demo
    const myStudents = STUDENTS_DATA;
    const totalStudents = myStudents.length;
    const attendanceMarkedToday = ATTENDANCE_DATA.length > 0;
    const lowAttendanceStudents = myStudents.filter(s => s.attendance < 80).length;

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white">Teacher Dashboard</motion.h1>
      
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-slate-400">In your classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Today</CardTitle>
            <UserCheck className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${attendanceMarkedToday ? 'text-green-400' : 'text-yellow-400'}`}>
              {attendanceMarkedToday ? 'Marked' : 'Pending'}
            </div>
            <p className="text-xs text-slate-400">For your assigned classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Attendance Alert</CardTitle>
            <XCircle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowAttendanceStudents}</div>
            <p className="text-xs text-slate-400">Students below 80%</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>My Students</CardTitle>
            <CardDescription>List of students in your classes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Fees Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {myStudents.map((student) => (
                        <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.class}</TableCell>
                            <TableCell className={student.attendance < 80 ? 'text-red-400' : 'text-green-400'}>{student.attendance}%</TableCell>
                            <TableCell>
                               <span className={`px-2 py-1 text-xs font-semibold rounded-full ${student.feesPaid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {student.feesPaid ? 'Paid' : 'Pending'}
                               </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default TeacherDashboard;
