const Joi = require('joi');

const portalOverrideSchema = Joi.object({
    studentId: Joi.string().required(),
    isEnabled: Joi.boolean().required(),
});

const createTeacherSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    assignedClasses: Joi.array().items(Joi.string()).optional().default([]),
});

const updateTeacherSchema = Joi.object({
    name: Joi.string().min(3).optional(),
    email: Joi.string().email().optional(),
    assignedClasses: Joi.array().items(Joi.string()).optional(),
}).min(1); // Require at least one field to be updated

module.exports = {
    portalOverrideSchema,
    createTeacherSchema,
    updateTeacherSchema,
};