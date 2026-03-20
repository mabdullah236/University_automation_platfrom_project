const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const cors = require('cors');
const helmet = require('helmet');
const { spawn } = require('child_process');
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
// const alumniRoutes = require('./src/routes/alumniRoutes'); // Removed
const studentRoutes = require('./src/routes/studentRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');
const planningRoutes = require('./src/routes/planningRoutes');

const User = require('./src/models/User'); // Import User model for index sync

const StudentProfile = require('./src/models/StudentProfile'); // Import StudentProfile

dotenv.config();

// Connect to DB and Sync Indexes
const fs = require('fs');
fs.writeFileSync('server_status.txt', `Server started at ${new Date().toISOString()}`);

connectDB().then(async () => {
  try {
    console.log('Syncing User indexes...');
    await User.syncIndexes();
    console.log('User indexes synced successfully.');

    // Migration: Set default studentStatus
    console.log('Migrating Student Status...');
    const result = await StudentProfile.updateMany(
      { studentStatus: { $exists: false } },
      { $set: { studentStatus: 'Active' } }
    );
    console.log(`Migration Complete. Updated ${result.modifiedCount} students.`);

  } catch (err) {
    console.error('Startup Error:', err);
  }
});

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
// app.use('/api/v1/alumni', alumniRoutes); // Removed
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/planning', planningRoutes);

app.post('/api/v1/ml/predict', (req, res) => {
  const { review } = req.body;
  
  if (!review) {
    return res.status(400).json({ success: false, message: 'Review text is required' });
  }

  // Path to python script
  const scriptPath = path.join(__dirname, '../ml_service/sentiment_analysis.py');
  
  // Spawn python process
  const pythonProcess = spawn('python', [scriptPath, review]);

  let dataString = '';

  pythonProcess.stdout.on('data', (data) => {
    dataString += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    try {
      const result = JSON.parse(dataString);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('JSON Parse Error:', error);
      res.status(500).json({ success: false, message: 'Failed to parse ML response' });
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Force Restart Triggered
