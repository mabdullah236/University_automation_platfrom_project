
const prisma = require('../utils/prismaClient');

const createLog = async (actorId, action, details = '') => {
    try {
        await prisma.log.create({
            data: {
                actorId,
                action,
                details,
            },
        });
    } catch (error) {
        console.error('Failed to create log:', error);
    }
};

module.exports = { createLog };
