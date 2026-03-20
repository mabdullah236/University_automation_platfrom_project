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
            avatar: 'https://picsum.photos/seed/admin/100',
        },
    });

    // Create Teachers
    await prisma.user.create({
        data: {
            name: 'Teacher Smith',
            email: 'teacher@university.com',
            role: 'TEACHER',
            passwordHash: hashedTeacherPassword,
            avatar: 'https://picsum.photos/seed/teacher/100',
            assignedClasses: ['CS101', 'CS102'],
        },
    });

    const otherTeachers = [
        { name: 'Eleanor Vance', email: 'eleanor.vance@university.com', avatar: 'https://picsum.photos/seed/teacher2/100', assignedClasses: ['PHY201', 'CS103'] },
        { name: 'Marcus Holloway', email: 'marcus.holloway@university.com', avatar: 'https://picsum.photos/seed/teacher3/100', assignedClasses: ['MATH101', 'STAT210'] },
        { name: 'Clara Oswald', email: 'clara.oswald@university.com', avatar: 'https://picsum.photos/seed/teacher4/100', assignedClasses: ['ENG101', 'LIT305'] },
    ];

    for (const t of otherTeachers) {
        await prisma.user.create({
            data: {
                ...t,
                role: 'TEACHER',
                passwordHash: await bcrypt.hash(teacherPassword, 10),
            }
        });
    }

    // Create Students
    const student1User = await prisma.user.create({
        data: {
            name: 'Student John',
            email: 'student@university.com',
            role: 'STUDENT',
            passwordHash: hashedStudentPassword,
            avatar: 'https://picsum.photos/seed/student/100',
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
            avatar: 'https://picsum.photos/seed/student2/100',
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