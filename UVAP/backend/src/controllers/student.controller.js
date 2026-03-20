
const prisma = require('../utils/prismaClient');

const getDashboard = async (req, res) => {
    try {
        const student = await prisma.student.findUnique({
            where: { userId: req.user.id },
            include: {
                fees: true,
                attendances: true,
            },
        });

        if (!student) {
            return res.status(404).json({ message: 'Student data not found.' });
        }
        
        if (!student.portalEnabled) {
            return res.status(403).json({ message: 'Portal access is currently disabled.' });
        }

        // Calculate attendance percentage
        const totalAttendance = student.attendances.length;
        const presentCount = student.attendances.filter(a => a.present).length;
        const attendancePercentage = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;
        
        // Determine fee status (simplified: assumes one pending fee is enough)
        const feeStatus = student.fees.some(f => f.status === 'PENDING') ? 'PENDING' : 'PAID';

        const dashboardData = {
            name: req.user.name,
            email: req.user.email,
            rollNo: student.rollNo,
            portalEnabled: student.portalEnabled,
            attendancePercentage: parseFloat(attendancePercentage.toFixed(2)),
            feeStatus: feeStatus,
            fees: student.fees, // Send detailed fee records
        };

        res.json(dashboardData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch dashboard data.' });
    }
};

module.exports = {
    getDashboard,
};
