const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

// Routes for /api/tasks
router.route('/')
  .get(getTasks)       // Get all tasks (supports filter, search, sort)
  .post(createTask);    // Create a task

// Routes for /api/tasks/:id
router.route('/:id')
  .get(getTaskById)     // Get a single task by ID
  .patch(updateTask)    // Update specific fields of a task
  .delete(deleteTask);  // Delete a task

module.exports = router;
