const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');

// Route files
const notificationRoutes = require('./src/routes/notificationRoutes');

dotenv.config();

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
app.use('/api/v1/notify', notificationRoutes);

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});
