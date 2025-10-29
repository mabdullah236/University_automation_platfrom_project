
import React from 'react';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { STUDENTS_DATA, FEES_DATA, ATTENDANCE_DATA } from '../lib/constants';
import { BarChart, FileCheck2, CheckCircle, AlertCircle, CalendarDays, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';


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

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    // Find this specific student's data. In a real app, this would be a single API call.
    const studentData = STUDENTS_DATA.find(s => s.name === user?.name);
    const feeRecords = FEES_DATA.filter(f => f.studentName === user?.name);
    const attendanceRecords = ATTENDANCE_DATA.filter(a => a.studentName === user?.name).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());


    if (!studentData || feeRecords.length === 0) {
        return (
             <motion.div 
                className="flex items-center justify-center h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
             >
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                        <CardDescription>Could not find data for the logged-in student.</CardDescription>
                    </CardHeader>
                </Card>
             </motion.div>
        )
    }
    
    const attendanceChartData = [
        { name: 'Present', value: studentData.attendance },
        { name: 'Absent', value: 100 - studentData.attendance },
    ];
    const COLORS = ['#3b82f6', '#475569'];
    
    const overallFeeStatus = feeRecords.some(f => f.status === 'Pending') ? 'Pending' : 'Paid';
    const nextDueDate = feeRecords.find(f => f.status === 'Pending')?.dueDate || 'N/A';

    const hasPortalAccess = studentData.attendance >= 75 && overallFeeStatus === 'Paid';

  return (
    <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
      <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white">Welcome, {user?.name}</motion.h1>
      
      <motion.div variants={itemVariants} >
        <Card className={`border-2 ${hasPortalAccess ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
            <CardHeader className="flex flex-row items-center gap-4">
                {hasPortalAccess ? <CheckCircle className="h-8 w-8 text-green-400" /> : <AlertCircle className="h-8 w-8 text-red-400" />}
                <div>
                    <CardTitle className={hasPortalAccess ? 'text-green-300' : 'text-red-300'}>Portal Access: {hasPortalAccess ? 'Enabled' : 'Disabled'}</CardTitle>
                    <CardDescription>{hasPortalAccess ? 'You meet all requirements for portal access.' : 'Access disabled due to low attendance or pending fees.'}</CardDescription>
                </div>
            </CardHeader>
        </Card>
      </motion.div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div variants={itemVariants}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">My Attendance</CardTitle>
                    <BarChart className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{studentData.attendance}%</div>
                    <p className="text-xs text-slate-400">Overall percentage</p>
                    <div className="h-[200px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={attendanceChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {attendanceChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">My Fees</CardTitle>
                    <FileCheck2 className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${overallFeeStatus === 'Paid' ? 'text-green-400' : 'text-red-400'}`}>{overallFeeStatus}</div>
                    <p className="text-xs text-slate-400">{overallFeeStatus === 'Pending' ? `Next payment due on ${nextDueDate}` : 'All fees cleared'}</p>
                    <div className="mt-8 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Total Fees Paid:</span>
                            <span className="font-medium">${feeRecords.filter(f=>f.status === 'Paid').reduce((acc, f) => acc + f.amount, 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Fees Pending:</span>
                            <span className="font-medium">${feeRecords.filter(f=>f.status === 'Pending').reduce((acc, f) => acc + f.amount, 0).toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <CalendarDays className="h-5 w-5 text-slate-400" />
                        <div>
                            <CardTitle>Attendance History</CardTitle>
                            <CardDescription>Your recent attendance records.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendanceRecords.length > 0 ? attendanceRecords.map((record, index) => (
                                <TableRow key={`${record.studentId}-${record.date}-${index}`}>
                                    <TableCell>{record.date}</TableCell>
                                    <TableCell className="text-right">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${record.status === 'Present' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {record.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-slate-400 py-8">
                                        No attendance records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
            <Card>
                <CardHeader>
                   <div className="flex items-center gap-3">
                        <Wallet className="h-5 w-5 text-slate-400" />
                        <div>
                            <CardTitle>Fee Payment Details</CardTitle>
                            <CardDescription>Your payment history and due dates.</CardDescription>
                        </div>
                   </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Amount</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {feeRecords.length > 0 ? feeRecords.map((record, index) => (
                                <TableRow key={`${record.studentId}-${record.dueDate}-${index}`}>
                                    <TableCell>${record.amount.toFixed(2)}</TableCell>
                                    <TableCell>{record.dueDate}</TableCell>
                                    <TableCell className="text-right">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${record.status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {record.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-slate-400 py-8">
                                        No fee records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </motion.div>
    </div>

    </motion.div>
  );
};

export default StudentDashboard;