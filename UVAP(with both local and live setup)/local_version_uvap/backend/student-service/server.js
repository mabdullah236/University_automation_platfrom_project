const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Route files
const authRoutes = require('./src/routes/authRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const resultRoutes = require('./src/routes/resultRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');
const courseRoutes = require('./src/routes/courseRoutes');

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
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/results', resultRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/courses', courseRoutes);

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`Student Service running on port ${PORT}`);
});
