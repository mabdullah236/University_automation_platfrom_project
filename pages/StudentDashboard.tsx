
import React from 'react';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { STUDENTS_DATA, FEES_DATA } from '../lib/constants';
import { BarChart, FileCheck2, CheckCircle, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    // Find this specific student's data. In a real app, this would be a single API call.
    const studentData = STUDENTS_DATA.find(s => s.name === user?.name);
    const feeData = FEES_DATA.find(f => f.studentName === user?.name);

    if (!studentData || !feeData) {
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

    const hasPortalAccess = studentData.attendance >= 75 && feeData.status === 'Paid';

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
                    <div className={`text-2xl font-bold ${feeData.status === 'Paid' ? 'text-green-400' : 'text-red-400'}`}>{feeData.status}</div>
                    <p className="text-xs text-slate-400">Due on {feeData.dueDate}</p>
                    <div className="mt-8 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Tuition Fee:</span>
                            <span className="font-medium">${feeData.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Status:</span>
                            <span className={`font-medium ${feeData.status === 'Paid' ? 'text-green-400' : 'text-red-400'}`}>{feeData.status}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default StudentDashboard;
