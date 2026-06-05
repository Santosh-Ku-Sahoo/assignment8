const Task = require('../models/Task');

// Get all tasks (handles filters, search and sorting)
const getTasks = async (req, res) => {
  try {
    const { completed, priority, search, sortBy } = req.query;
    let query = {};

    // Filter by completion status
    if (completed !== undefined && completed !== '') {
      query.isCompleted = completed === 'true';
    }

    // Filter by priority
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      query.priority = priority;
    }

    // Keyword search in title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Handle sorting
    let sortOptions = { createdAt: -1 }; // newest first by default
    if (sortBy === 'dueDate') {
      sortOptions = { dueDate: 1 };
    } else if (sortBy === 'priority') {
      sortOptions = { priority: 1 };
    }

    const tasks = await Task.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};

// Fetch one task by its ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error fetching task',
      error: error.message
    });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    // Check if title is present and is long enough
    if (!title || title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: {
          title: 'Title is required and must be at least 3 characters long'
        }
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description || '',
      priority: priority || 'medium',
      dueDate: dueDate || null
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = {};
      Object.values(error.errors).forEach(err => {
        messages[err.path] = err.message;
      });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error creating task',
      error: error.message
    });
  }
};

// Update task details
const updateTask = async (req, res) => {
  try {
    const { title, priority } = req.body;

    // Validate title and priority if they are in request body
    if (title !== undefined && title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: { title: 'Title must be at least 3 characters long' }
      });
    }

    if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: { priority: 'Priority must be low, medium, or high' }
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    if (error.name === 'ValidationError') {
      const messages = {};
      Object.values(error.errors).forEach(err => {
        messages[err.path] = err.message;
      });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error updating task',
      error: error.message
    });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      deletedId: req.params.id
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error deleting task',
      error: error.message
    });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
