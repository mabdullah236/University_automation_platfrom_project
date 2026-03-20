
const prisma = require('../utils/prismaClient');
const { createLog } = require('../services/logService');

const getMyStudents = async (req, res) => {
    // In a real app, you would have a relation between teachers and students/classes.
    // For now, we return all students as dummy data.
    try {
        const students = await prisma.student.findMany({
            select: {
                id: true,
                rollNo: true,
                user: { select: { name: true, email: true } },
            },
        });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch students' });
    }
};

const markAttendance = async (req, res) => {
    const { studentId, date, present } = req.body;
    
    try {
        const attendanceDate = new Date(date);

        // Upsert: update if exists, create if not
        const attendanceRecord = await prisma.attendance.upsert({
            where: {
                studentId_date: {
                    studentId: studentId,
                    date: attendanceDate,
                }
            },
            update: {
                present: present
            },
            create: {
                studentId: studentId,
                date: attendanceDate,
                present: present
            },
            include: { student: { include: { user: true } } }
        });

        await createLog(req.user.id, 'ATTENDANCE_MARKED', `Attendance for ${attendanceRecord.student.user.name} on ${date} marked as ${present ? 'Present' : 'Absent'}.`);
        
        res.status(201).json({ message: 'Attendance marked successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to mark attendance' });
    }
};

module.exports = {
    getMyStudents,
    markAttendance,
};
