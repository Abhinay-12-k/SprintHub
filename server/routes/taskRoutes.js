const express = require('express');
const router = express.Router();

const { getTasks, getTask, createTask, updateTask, deleteTask, addComment, getTaskStats } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getTaskStats);

router.route('/')
  .get(getTasks)
  .post(authorize('admin'), createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)          // Both admin and member can update (controller enforces field restrictions)
  .delete(authorize('admin'), deleteTask);

router.post('/:id/comments', addComment);

module.exports = router;
