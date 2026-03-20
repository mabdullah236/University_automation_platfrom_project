
const express = require('express');
const { login, refreshToken } = require('../controllers/auth.controller');
const validationMiddleware = require('../middleware/validationMiddleware');
const { loginSchema, refreshTokenSchema } = require('../validators/auth.validator');

const router = express.Router();

router.post('/login', validationMiddleware(loginSchema), login);
router.post('/refresh', validationMiddleware(refreshTokenSchema), refreshToken);

module.exports = router;
