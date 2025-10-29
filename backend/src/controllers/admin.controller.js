const bcrypt = require('bcrypt');
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


const getAllTeachers = async (req, res) => {
    try {
        const teachers = await prisma.user.findMany({
            where: { role: 'TEACHER' },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                assignedClasses: true,
            }
        });
        res.json(teachers);
    } catch (error) {
        console.error("Error fetching teachers:", error);
        res.status(500).json({ message: 'Failed to fetch teachers' });
    }
};

const createTeacher = async (req, res) => {
    const { name, email, password, assignedClasses } = req.body;
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const avatar = `https://i.pravatar.cc/150?u=${email}`;

        const newTeacher = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                role: 'TEACHER',
                avatar,
                assignedClasses: assignedClasses || [],
            }
        });

        const { passwordHash, ...teacherData } = newTeacher;
        res.status(201).json(teacherData);
    } catch (error) {
        console.error("Error creating teacher:", error);
        res.status(500).json({ message: 'Failed to create teacher' });
    }
};

const updateTeacher = async (req, res) => {
    const { id } = req.params;
    const { name, email, assignedClasses } = req.body;

    try {
        const teacher = await prisma.user.findFirst({ where: { id: id, role: 'TEACHER' } });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const updatedTeacher = await prisma.user.update({
            where: { id },
            data: {
                name,
                email,
                assignedClasses,
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                assignedClasses: true,
            }
        });
        res.json(updatedTeacher);
    } catch (error) {
        console.error(`Error updating teacher ${id}:`, error);
        res.status(500).json({ message: 'Failed to update teacher' });
    }
};

const deleteTeacher = async (req, res) => {
    const { id } = req.params;
    try {
        const teacher = await prisma.user.findFirst({ where: { id: id, role: 'TEACHER' } });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        await prisma.user.delete({
            where: { id }
        });
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting teacher ${id}:`, error);
        res.status(500).json({ message: 'Failed to delete teacher' });
    }
};


module.exports = {
    getAllStudents,
    portalOverride,
    getAllTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
};