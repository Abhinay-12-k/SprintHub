const ActivityLog = require('../models/ActivityLog');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @route   GET /api/activity
 * @desc    Get activity logs (admin: all recent, member: their own)
 * @access  Private
 */
const getActivityLogs = async (req, res, next) => {
  try {
    const { projectId, limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (projectId) query.project = projectId;
    if (req.user.role === 'member') query.performedBy = req.user._id;

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .populate('performedBy', 'name email avatar')
        .populate('project', 'title')
        .populate('task', 'title')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(skip),
      ActivityLog.countDocuments(query),
    ]);

    return sendSuccess(res, 200, 'Activity logs fetched', {
      logs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/activity/dashboard
 * @desc    Get dashboard analytics stats
 * @access  Private/Admin
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const Task = require('../models/Task');
    const User = require('../models/User');

    const adminId = req.user._id;

    // Fetch all stats concurrently for performance
    const [
      totalProjects,
      totalUsers,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      recentLogs,
      tasksByPriority,
      tasksByStatus,
      projectsData,
    ] = await Promise.all([
      Project.countDocuments({ admin: adminId }),
      User.countDocuments({ isActive: true }),
      Task.countDocuments(),
      Task.countDocuments({ status: 'completed' }),
      Task.countDocuments({ status: { $in: ['todo', 'in-progress'] } }),
      Task.countDocuments({ dueDate: { $lt: new Date() }, status: { $ne: 'completed' } }),
      ActivityLog.find()
        .populate('performedBy', 'name email avatar')
        .sort({ createdAt: -1 })
        .limit(10),
      // Aggregation for pie chart
      Task.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Project.find({ admin: adminId })
        .select('title progress status dueDate')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return sendSuccess(res, 200, 'Dashboard stats fetched', {
      overview: {
        totalProjects,
        totalUsers,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate,
      },
      tasksByPriority,
      tasksByStatus,
      recentActivity: recentLogs,
      recentProjects: projectsData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivityLogs, getDashboardStats };
