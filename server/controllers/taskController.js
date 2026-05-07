const Task = require('../models/Task');
const Project = require('../models/Project');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { logActivity } = require('../utils/activityHelper');
const { updateProjectProgress } = require('./projectController');

/**
 * @route   GET /api/tasks
 * @desc    Get tasks with filters: projectId, status, priority, assignedTo, search
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const { projectId, status, priority, assignedTo, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    let query = {};

    if (req.user.role === 'member') {
      // Members only see tasks assigned to them
      query.assignedTo = req.user._id;
    }

    if (projectId) query.project = projectId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo && req.user.role === 'admin') query.assignedTo = assignedTo;

    // Full-text search on title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const validSortFields = ['createdAt', 'dueDate', 'priority', 'title', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'title')
      .sort({ [sortField]: sortOrder });

    return sendSuccess(res, 200, 'Tasks fetched successfully', { tasks, count: tasks.length });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task with comments
 * @access  Private
 */
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'title admin members')
      .populate('comments.user', 'name email avatar');

    if (!task) return sendError(res, 404, 'Task not found');

    // Members can only view tasks assigned to them
    if (
      req.user.role === 'member' &&
      task.assignedTo?._id.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, 'Not authorized to view this task');
    }

    return sendSuccess(res, 200, 'Task fetched successfully', { task });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private/Admin
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, projectId, assignedTo, dueDate, tags } = req.body;

    // Verify the project exists and the admin owns it
    const project = await Project.findById(projectId);
    if (!project) return sendError(res, 404, 'Project not found');

    if (project.admin.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Only the project admin can create tasks');
    }

    const task = await Task.create({
      title,
      description,
      priority,
      status: status || 'todo',
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      dueDate,
      tags,
    });

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email');

    // Update project progress after task creation
    await updateProjectProgress(projectId);

    const assigneeName = task.assignedTo?.name || 'Unassigned';
    await logActivity({
      action: `Created task "${task.title}" and assigned to ${assigneeName}`,
      performedBy: req.user._id,
      project: projectId,
      task: task._id,
      type: 'task',
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`project-${projectId}`).emit('task-created', task);

    return sendSuccess(res, 201, 'Task created successfully', { task });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task (admin: all fields, member: status only)
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'admin');

    if (!task) return sendError(res, 404, 'Task not found');

    const isProjectAdmin = task.project.admin.toString() === req.user._id.toString();
    const isAssignee = task.assignedTo?.toString() === req.user._id.toString();

    if (!isProjectAdmin && !isAssignee) {
      return sendError(res, 403, 'Not authorized to update this task');
    }

    const oldStatus = task.status;

    if (req.user.role === 'admin' && isProjectAdmin) {
      // Admin can update any field
      const adminFields = ['title', 'description', 'priority', 'status', 'assignedTo', 'dueDate', 'tags'];
      adminFields.forEach((field) => {
        if (req.body[field] !== undefined) task[field] = req.body[field];
      });
    } else {
      // Member can only update status
      if (req.body.status) {
        task.status = req.body.status;
      } else {
        return sendError(res, 403, 'Members can only update task status');
      }
    }

    await task.save();
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email');

    // Recalculate project progress on status change
    if (req.body.status && req.body.status !== oldStatus) {
      await updateProjectProgress(task.project._id);

      await logActivity({
        action: `Moved task "${task.title}" to ${req.body.status.replace('-', ' ')}`,
        performedBy: req.user._id,
        project: task.project._id,
        task: task._id,
        type: 'task',
      });

      // Emit real-time update
      const io = req.app.get('io');
      io.to(`project-${task.project._id}`).emit('task-updated', {
        taskId: task._id,
        status: req.body.status
      });
    }

    return sendSuccess(res, 200, 'Task updated successfully', { task });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private/Admin
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'admin title');

    if (!task) return sendError(res, 404, 'Task not found');

    if (task.project.admin.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Only the project admin can delete tasks');
    }

    const projectId = task.project._id;
    const taskTitle = task.title;

    await task.deleteOne();
    await updateProjectProgress(projectId);

    await logActivity({
      action: `Deleted task "${taskTitle}"`,
      performedBy: req.user._id,
      project: projectId,
      type: 'task',
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`project-${projectId}`).emit('task-deleted', { taskId: req.params.id });

    return sendSuccess(res, 200, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tasks/:id/comments
 * @desc    Add a comment to a task
 * @access  Private
 */
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return sendError(res, 400, 'Comment text is required');

    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 404, 'Task not found');

    task.comments.push({ user: req.user._id, text: text.trim() });
    await task.save();
    await task.populate('comments.user', 'name email avatar');

    return sendSuccess(res, 201, 'Comment added', { comments: task.comments });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks/stats
 * @desc    Get task statistics for the current user's scope
 * @access  Private
 */
const getTaskStats = async (req, res, next) => {
  try {
    let matchQuery = {};
    if (req.user.role === 'member') {
      matchQuery.assignedTo = req.user._id;
    }

    const [total, todo, inProgress, completed, overdue] = await Promise.all([
      Task.countDocuments(matchQuery),
      Task.countDocuments({ ...matchQuery, status: 'todo' }),
      Task.countDocuments({ ...matchQuery, status: 'in-progress' }),
      Task.countDocuments({ ...matchQuery, status: 'completed' }),
      Task.countDocuments({
        ...matchQuery,
        dueDate: { $lt: new Date() },
        status: { $ne: 'completed' },
      }),
    ]);

    return sendSuccess(res, 200, 'Stats fetched', {
      stats: { total, todo, inProgress, completed, overdue },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, addComment, getTaskStats };
