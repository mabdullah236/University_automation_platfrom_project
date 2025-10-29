
const Joi = require('joi');

const portalOverrideSchema = Joi.object({
    studentId: Joi.string().required(),
    isEnabled: Joi.boolean().required(),
});

module.exports = {
    portalOverrideSchema,
};
