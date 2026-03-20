import React, { useState } from 'react';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import Select from '../components/ui/Select';
import { STUDENTS_DATA, ATTENDANCE_DATA, FEES_DATA } from '../lib/constants';
import { Users, UserCheck, DollarSign, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
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


const AdminDashboard: React.FC = () => {
    const [classFilter, setClassFilter] = useState('All');
    const [feeStatusFilter, setFeeStatusFilter] = useState('All');

    const totalStudents = STUDENTS_DATA.length;
    const attendancePercentage = (ATTENDANCE_DATA.filter(a => a.status === 'Present').length / ATTENDANCE_DATA.length * 100).toFixed(0);
    const feesPaidCount = FEES_DATA.filter(f => f.status === 'Paid').length;

    const chartData = [
        { name: 'Jan', students: 120 },
        { name: 'Feb', students: 135 },
        { name: 'Mar', students: 140 },
        { name: 'Apr', students: 155 },
        { name: 'May', students: 160 },
        { name: 'Jun', students: 180 },
    ];
    
    const uniqueClasses = ['All', ...Array.from(new Set(STUDENTS_DATA.map(s => s.class)))];

    const filteredStudents = STUDENTS_DATA.filter(student => {
        const classMatch = classFilter === 'All' || student.class === classFilter;
        const feeMatch = feeStatusFilter === 'All' || (feeStatusFilter === 'Paid' ? student.feesPaid : !student.feesPaid);
        return classMatch && feeMatch;
    });


  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white">Admin Dashboard</motion.h1>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-slate-400">+5 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <UserCheck className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendancePercentage}%</div>
            <p className="text-xs text-slate-400">Based on today's records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fees Cleared</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feesPaidCount} / {FEES_DATA.length}</div>
            <p className="text-xs text-slate-400">Total fees paid this semester</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
            <CardHeader>
                <CardTitle>Student Enrollment Growth</CardTitle>
                <CardDescription>Growth over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }}/>
                            <Legend wrapperStyle={{fontSize: "14px"}}/>
                            <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>Students Overview</CardTitle>
                    <CardDescription>Filter and view student records.</CardDescription>
                </div>
                <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <Select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                        {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                    <Select value={feeStatusFilter} onChange={(e) => setFeeStatusFilter(e.target.value)}>
                        <option value="All">All Fees</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                    </Select>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Fee Status</TableHead>
                        <TableHead>Attendance</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.class}</TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${student.feesPaid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {student.feesPaid ? 'Paid' : 'Pending'}
                                </span>
                            </TableCell>
                            <TableCell className={student.attendance < 80 ? 'text-red-400' : ''}>{student.attendance}%</TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-slate-400 py-8">
                                No students match the current filters.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;