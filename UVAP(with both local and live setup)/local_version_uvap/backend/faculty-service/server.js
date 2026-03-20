const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Route files
const authRoutes = require('./src/routes/authRoutes');
const facultyRoutes = require('./src/routes/facultyRoutes');
const lmsRoutes = require('./src/routes/lmsRoutes');
const resultRoutes = require('./src/routes/resultRoutes');
const timetableRoutes = require('./src/routes/timetableRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');

const User = require('./src/models/User');

dotenv.config();

// Connect to DB
connectDB();

const app = express();

// Security Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(helmet({ contentSecurityPolicy: false }));
} else {
  app.use(helmet());
}

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Serve Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/faculty', facultyRoutes);
app.use('/api/v1/lms', lmsRoutes);
app.use('/api/v1/results', resultRoutes);
app.use('/api/v1/timetable', timetableRoutes);
app.use('/api/v1/attendance', attendanceRoutes);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Faculty Service running on port ${PORT}`);
});
