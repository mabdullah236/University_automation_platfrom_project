
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    const adminPassword = 'adminpassword';
    const teacherPassword = 'teacherpassword';
    const studentPassword = 'studentpassword';

    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
    const hashedTeacherPassword = await bcrypt.hash(teacherPassword, 10);
    const hashedStudentPassword = await bcrypt.hash(studentPassword, 10);

    // Create Admin
    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@university.com',
            role: 'ADMIN',
            passwordHash: hashedAdminPassword,
        },
    });

    // Create Teacher
    const teacher = await prisma.user.create({
        data: {
            name: 'Teacher Smith',
            email: 'teacher@university.com',
            role: 'TEACHER',
            passwordHash: hashedTeacherPassword,
        },
    });

    // Create Students
    const student1User = await prisma.user.create({
        data: {
            name: 'Student John',
            email: 'student@university.com',
            role: 'STUDENT',
            passwordHash: hashedStudentPassword,
            student: {
                create: {
                    rollNo: 'S001',
                    portalEnabled: false,
                },
            },
        },
        include: { student: true },
    });

    const student2User = await prisma.user.create({
        data: {
            name: 'Jane Doe',
            email: 'jane.doe@university.com',
            role: 'STUDENT',
            passwordHash: await bcrypt.hash('password123', 10),
            student: {
                create: {
                    rollNo: 'S002',
                    portalEnabled: true,
                },
            },
        },
        include: { student: true },
    });

    // Add Fee records
    await prisma.fee.create({
        data: {
            studentId: student1User.student.id,
            amount: 1200.0,
            status: 'PAID',
            dueDate: new Date('2024-09-01'),
        },
    });

    await prisma.fee.create({
        data: {
            studentId: student2User.student.id,
            amount: 1200.0,
            status: 'PENDING',
            dueDate: new Date('2024-09-01'),
        },
    });
    
    // Add Attendance records for student 1 (to test automation)
    // Add 7 present days in the last 14 days
    for (let i = 1; i < 15; i++) {
        if (i % 2 === 0) { // Add 7 present records
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayOfWeek = date.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude weekends
                await prisma.attendance.create({
                    data: {
                        studentId: student1User.student.id,
                        date: date,
                        present: true,
                    },
                });
            }
        }
    }


    console.log('Seeding finished.');
    console.log('--- Created Users ---');
    console.log(`Admin: admin@university.com / ${adminPassword}`);
    console.log(`Teacher: teacher@university.com / ${teacherPassword}`);
    console.log(`Student: student@university.com / ${studentPassword}`);
    console.log(`Student: jane.doe@university.com / password123`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
