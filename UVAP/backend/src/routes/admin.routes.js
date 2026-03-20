const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getAllStudents, portalOverride, getAllTeachers, createTeacher, updateTeacher, deleteTeacher } = require('../controllers/admin.controller');
const validationMiddleware = require('../middleware/validationMiddleware');
const { portalOverrideSchema, createTeacherSchema, updateTeacherSchema } = require('../validators/admin.validator');

const router = express.Router();

// All routes in this file are protected and for admins only
router.use(protect, authorize('ADMIN'));

router.get('/students', getAllStudents);
router.post('/portal-override', validationMiddleware(portalOverrideSchema), portalOverride);

// --- Teacher Management Routes ---

// NOTE: For this demo, the auth middleware on the following teacher routes is applied.
// However, the frontend's login mechanism is mocked and does not use the real backend login,
// so it does not store a JWT token. To test this feature, you would need to:
// 1. Log in via the mock UI (e.g., as admin@university.com).
// 2. Use a tool like Postman to hit the REAL `POST /api/auth/login` endpoint with the same credentials.
// 3. Copy the `accessToken` from the Postman response.
// 4. Use your browser's developer tools to make requests to these endpoints, adding an
//    `Authorization: Bearer <your_token>` header.

router.get('/teachers', getAllTeachers);
router.post('/teachers', validationMiddleware(createTeacherSchema), createTeacher);
router.put('/teachers/:id', validationMiddleware(updateTeacherSchema), updateTeacher);
router.delete('/teachers/:id', deleteTeacher);


module.exports = router;