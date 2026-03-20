const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./src/config/db');

// Route files
const paymentRoutes = require('./src/routes/paymentRoutes');

dotenv.config();

// Connect to Database
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

// Mount Routes
app.use('/api/v1/payments', paymentRoutes);

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});
