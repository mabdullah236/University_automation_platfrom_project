
const Joi = require('joi');

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
    token: Joi.string().required(),
});

module.exports = {
    loginSchema,
    refreshTokenSchema,
};
