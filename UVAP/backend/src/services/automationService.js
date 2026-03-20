
const prisma = require('../utils/prismaClient');
const { sendPortalActivationEmail } = require('./emailService');
const { createLog } = require('./logService');

// Function to get the last N business days
const getLastNBusinessDays = (n) => {
    const dates = [];
    let currentDate = new Date();
    while (dates.length < n) {
        currentDate.setDate(currentDate.getDate() - 1);
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
            dates.push(new Date(currentDate));
        }
    }
    return dates;
};

const checkAndActivatePortals = async () => {
    console.log('Running nightly portal activation check...');

    try {
        // Find admin user to attribute the log to
        const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (!adminUser) {
            console.error('Automation failed: No admin user found to attribute logs.');
            return;
        }

        const studentsToProcess = await prisma.student.findMany({
            where: { portalEnabled: false },
            include: { user: true, fees: true },
        });

        if (studentsToProcess.length === 0) {
            console.log('No students with disabled portals to process.');
            return;
        }

        const businessDays = getLastNBusinessDays(14);
        const startDate = businessDays[businessDays.length - 1];
        const endDate = businessDays[0];

        for (const student of studentsToProcess) {
            // 1. Check attendance
            const attendanceCount = await prisma.attendance.count({
                where: {
                    studentId: student.id,
                    present: true,
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            });

            // 2. Check fee status
            const hasPaidFees = student.fees.some(fee => fee.status === 'PAID');

            console.log(`Checking student ${student.user.name}: Attendance=${attendanceCount}, Fees Paid=${hasPaidFees}`);

            // 3. Activation Logic
            if (attendanceCount >= 6 && hasPaidFees) {
                await prisma.student.update({
                    where: { id: student.id },
                    data: { portalEnabled: true },
                });

                console.log(`Portal activated for ${student.user.name}`);

                // 4. Log the action
                await createLog(adminUser.id, 'PORTAL_AUTO_ACTIVATED', `Portal for ${student.user.name} activated due to meeting attendance and fee requirements.`);
                
                // 5. Send notification email
                await sendPortalActivationEmail(student.user.email, student.user.name);
            }
        }

        console.log('Nightly check completed.');
    } catch (error) {
        console.error('Error during portal activation check:', error);
    }
};

module.exports = { checkAndActivatePortals };
