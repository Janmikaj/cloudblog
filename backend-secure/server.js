require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes/index');

const app = express();

app.use(cors({
  origin: '*', // In production, replace with ALB DNS
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add security headers using helmet
app.use(helmet());
app.disable('x-powered-by'); // Remove X-Powered-By header for security

// Limit payload size to mitigate DoS attacks, increased to 50mb for blog posts
app.use(express.json({ limit: '50mb' }));

// Load routes
app.use('/api', routes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vulnerable_blog';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
