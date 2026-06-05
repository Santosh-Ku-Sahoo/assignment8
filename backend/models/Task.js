const mongoose = require('mongoose');

// Define the Schema for Tasks
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [3, 'Task title must be at least 3 characters long']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  isCompleted: {
    type: Boolean,
    default: false,
    index: true // Index for faster filtering as planned in Assignment 7
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Priority must be low, medium, or high'
    },
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Automatically creates and manages createdAt and updatedAt fields
});

module.exports = mongoose.model('Task', taskSchema);
