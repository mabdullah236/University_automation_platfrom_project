const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const admissionRoutes = require('./routes/admissionRoutes');
const examRoutes = require('./routes/examRoutes');
const financeRoutes = require('./routes/financeRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const advancedRoutes = require('./routes/advancedRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/admissions', admissionRoutes);
app.use('/api/v1/exams', examRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/faculty', facultyRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/library', libraryRoutes);
app.use('/api/v1/facilities', facilityRoutes);
app.use('/api/v1/advanced', advancedRoutes);

app.get('/', (req, res) => {
  res.send('UVAP API is running...');
});

// Error Handler
app.use(errorHandler);

module.exports = app;
