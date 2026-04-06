const cors = require('cors');
const rateLimit = require('express-rate-limit');
const express = require('express');
const connectDB = require('./src/config/db');
const errorHandling = require('./src/middlewares/errorHandling');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Connect to MongoDB 
connectDB();

// Routes
app.use('/api/admin', require('./src/Modules/Admin/routes'));
app.use('/api/users', require('./src/Modules/Users/routes'));
app.use('/api/records', require('./src/Modules/Financial Records/routes'));
app.use('/api/dashboard', require('./src/Modules/Dashboard Summary/routes'));

// Health check
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Error handling middleware
app.use(errorHandling);

module.exports = app;