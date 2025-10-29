
const Joi = require('joi');

const markAttendanceSchema = Joi.object({
    studentId: Joi.string().required(),
    date: Joi.date().iso().required(),
    present: Joi.boolean().required(),
});

module.exports = {
    markAttendanceSchema,
};
