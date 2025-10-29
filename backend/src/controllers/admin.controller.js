
const prisma = require('../utils/prismaClient');
const { createLog } = require('../services/logService');

const getAllStudents = async (req, res) => {
    try {
        const students = await prisma.student.findMany({
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch students' });
    }
};

const portalOverride = async (req, res) => {
    const { studentId, isEnabled } = req.body;

    try {
        const updatedStudent = await prisma.student.update({
            where: { id: studentId },
            data: { portalEnabled: isEnabled },
            include: { user: { select: { name: true } } }
        });

        // Log the manual override
        const action = isEnabled ? 'PORTAL_MANUAL_ENABLE' : 'PORTAL_MANUAL_DISABLE';
        await createLog(req.user.id, action, `Portal for ${updatedStudent.user.name} manually set to ${isEnabled ? 'enabled' : 'disabled'}.`);

        res.json({ message: 'Portal status updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update portal status' });
    }
};

module.exports = {
    getAllStudents,
    portalOverride,
};
