const express = require('express');
const router = express.Router();

const {
  getProjects, getProject, createProject, updateProject,
  deleteProject, addMember, removeMember, getProjectStats
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All project routes require authentication
router.use(protect);

router.route('/')
  .get(getProjects)
  .post(authorize('admin'), createProject);

router.get('/stats', getProjectStats);

router.route('/:id')
  .get(getProject)
  .put(authorize('admin'), updateProject)
  .delete(authorize('admin'), deleteProject);

router.post('/:id/members', authorize('admin'), addMember);
router.delete('/:id/members/:userId', authorize('admin'), removeMember);

module.exports = router;
