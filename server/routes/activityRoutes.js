const express = require('express');
const router = express.Router();

const { getActivityLogs, getDashboardStats } = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getActivityLogs);
router.get('/dashboard', authorize('admin'), getDashboardStats);

module.exports = router;
