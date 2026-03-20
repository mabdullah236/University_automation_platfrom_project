const express = require('express'); // Restart trigger 2
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Route files
const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const admissionRoutes = require('./src/routes/admissionRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const facultyRoutes = require('./src/routes/facultyRoutes');
const hostelRoutes = require('./src/routes/hostelRoutes');
const transportRoutes = require('./src/routes/transportRoutes');
const libraryRoutes = require('./src/routes/libraryRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const financeRoutes = require('./src/routes/financeRoutes');
const hrRoutes = require('./src/routes/hrRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const examRoutes = require('./src/routes/examRoutes');
const resultRoutes = require('./src/routes/resultRoutes');
const lmsRoutes = require('./src/routes/lmsRoutes');
const timetableRoutes = require('./src/routes/timetableRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');

const departmentRoutes = require('./src/routes/departmentRoutes');
const planningRoutes = require('./src/routes/planningRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

const User = require('./src/models/User');

dotenv.config();

// Connect to DB
connectDB().then(async () => {
  try {
    console.log('Syncing User indexes...');
    await User.syncIndexes();
    console.log('User indexes synced successfully.');
  } catch (err) {
    console.error('Startup Error:', err);
  }
});

const app = express();

// Enable CORS - Place this FIRST
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Handle Preflight
app.options('*', cors());

// Security Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(helmet({ contentSecurityPolicy: false }));
} else {
  app.use(helmet());
}

// Body parser
app.use(express.json());

// Serve Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/admissions', admissionRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/faculty', facultyRoutes);
app.use('/api/v1/hostels', hostelRoutes);
app.use('/api/v1/transport', transportRoutes);
app.use('/api/v1/library', libraryRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/hr', hrRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/exams', examRoutes);
app.use('/api/v1/results', resultRoutes);
app.use('/api/v1/lms', lmsRoutes);
app.use('/api/v1/timetable', timetableRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/rooms', require('./src/routes/roomRoutes'));
app.use('/api/v1/planning', planningRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/debug', require('./src/routes/debugRoutes'));

// Trigger restart 4
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Admin Service running on port ${PORT}`);
});
