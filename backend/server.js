require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB database
connectDB();

// Middleware setup
app.use(cors());
app.use(express.json());

// Log incoming requests to terminal
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Setup api routes
app.use('/api/tasks', taskRoutes);

// Simple base route
app.get('/', (req, res) => {
  res.send('To-Do List API Server is running');
});

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at: http://localhost:${PORT}`);
});

module.exports = app;
