const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only — for assigning tasks/adding members)
 * @access  Private/Admin
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true }).select('-password').sort({ name: 1 });
    return sendSuccess(res, 200, 'Users fetched', { users });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/:id
 * @desc    Get single user profile
 * @access  Private/Admin
 */
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return sendError(res, 404, 'User not found');
    return sendSuccess(res, 200, 'User fetched', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/:id/deactivate
 * @desc    Deactivate a user account
 * @access  Private/Admin
 */
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) return sendError(res, 404, 'User not found');
    return sendSuccess(res, 200, 'User deactivated', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/users
 * @desc    Create a new user (admin only)
 * @access  Private/Admin
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, 'Email already registered');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'member',
    });

    return sendSuccess(res, 201, 'User created successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    await user.save();

    return sendSuccess(res, 200, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUser, deactivateUser, createUser, updateProfile };
