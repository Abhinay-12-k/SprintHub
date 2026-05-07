const express = require('express');
const router = express.Router();

const { getUsers, getUser, deactivateUser, createUser, updateProfile } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.put('/profile', updateProfile);
router.get('/', authorize('admin'), getUsers);
router.post('/', authorize('admin'), createUser);
router.get('/:id', authorize('admin'), getUser);
router.put('/:id/deactivate', authorize('admin'), deactivateUser);

module.exports = router;
