const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { logActivity } = require('../utils/activityHelper');

/**
 * Helper: Recalculate and update project progress based on task completion ratio
 */
const updateProjectProgress = async (projectId) => {
  const tasks = await Task.find({ project: projectId });
  if (tasks.length === 0) {
    await Project.findByIdAndUpdate(projectId, { progress: 0 });
    return;
  }
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const progress = Math.round((completed / tasks.length) * 100);
  await Project.findByIdAndUpdate(projectId, { progress });
};

/**
 * @route   GET /api/projects
 * @desc    Get all projects (admin: all, member: only their projects)
 * @access  Private
 */
const getProjects = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'admin') {
      // Admins see all projects they created
      query = { admin: req.user._id };
    } else {
      // Members see projects they are part of
      query = { members: req.user._id };
    }

    const projects = await Project.find(query)
      .populate('admin', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 });

    // Attach task counts to each project for dashboard display
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ project: project._id });
        const completedCount = await Task.countDocuments({
          project: project._id,
          status: 'completed',
        });
        return {
          ...project.toObject(),
          taskCount,
          completedCount,
        };
      })
    );

    return sendSuccess(res, 200, 'Projects fetched successfully', { projects: projectsWithCounts });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID
 * @access  Private
 */
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    // Authorization check: only admin or project members can view
    const isMember = project.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    const isAdmin = project.admin._id.toString() === req.user._id.toString();

    if (!isMember && !isAdmin) {
      return sendError(res, 403, 'Not authorized to access this project');
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Project fetched successfully', { project, tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private/Admin
 */
const createProject = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, color, members } = req.body;

    const project = await Project.create({
      title,
      description,
      dueDate,
      priority,
      color,
      admin: req.user._id,
      members: members || [],
    });

    await project.populate('admin', 'name email avatar');
    await project.populate('members', 'name email avatar');

    await logActivity({
      action: `Created project "${project.title}"`,
      performedBy: req.user._id,
      project: project._id,
      type: 'project',
    });

    // Emit real-time update to all (for dashboard)
    const io = req.app.get('io');
    io.emit('project-created', project);

    return sendSuccess(res, 201, 'Project created successfully', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private/Admin
 */
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    // Only the project's admin can edit it
    if (project.admin.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Only the project admin can update this project');
    }

    const allowedUpdates = ['title', 'description', 'dueDate', 'priority', 'status', 'color', 'members'];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) project[field] = req.body[field];
    });

    await project.save();
    await project.populate('admin', 'name email avatar');
    await project.populate('members', 'name email avatar');

    await logActivity({
      action: `Updated project "${project.title}"`,
      performedBy: req.user._id,
      project: project._id,
      type: 'project',
    });

    return sendSuccess(res, 200, 'Project updated successfully', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project and all its tasks
 * @access  Private/Admin
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    if (project.admin.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Only the project admin can delete this project');
    }

    // Cascade delete all tasks in this project
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    await logActivity({
      action: `Deleted project "${project.title}"`,
      performedBy: req.user._id,
      type: 'project',
    });

    return sendSuccess(res, 200, 'Project and all related tasks deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/projects/:id/members
 * @desc    Add a member to project
 * @access  Private/Admin
 */
const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return sendError(res, 404, 'Project not found');
    if (project.admin.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Only the project admin can add members');
    }

    const userToAdd = await User.findById(userId);
    if (!userToAdd) return sendError(res, 404, 'User not found');

    if (project.members.includes(userId)) {
      return sendError(res, 400, 'User is already a member');
    }

    project.members.push(userId);
    await project.save();
    await project.populate('members', 'name email avatar');

    await logActivity({
      action: `Added ${userToAdd.name} to project "${project.title}"`,
      performedBy: req.user._id,
      project: project._id,
      type: 'project',
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`project-${project._id}`).emit('member-added', { project });

    return sendSuccess(res, 200, 'Member added successfully', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/projects/:id/members/:userId
 * @desc    Remove a member from project
 * @access  Private/Admin
 */
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) return sendError(res, 404, 'Project not found');
    if (project.admin.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Only the project admin can remove members');
    }

    const userToRemove = await User.findById(req.params.userId);
    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await project.save();

    await logActivity({
      action: `Removed ${userToRemove?.name || 'a member'} from project "${project.title}"`,
      performedBy: req.user._id,
      project: project._id,
      type: 'project',
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`project-${project._id}`).emit('member-removed', { userId: req.params.userId });

    return sendSuccess(res, 200, 'Member removed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/projects/stats
 * @desc    Get aggregated stats for dashboard
 * @access  Private
 */
const getProjectStats = async (req, res, next) => {
  try {
    let matchQuery = {};
    if (req.user.role === 'admin') {
      matchQuery.admin = req.user._id;
    } else {
      matchQuery.members = req.user._id;
    }

    const projects = await Project.find(matchQuery);
    const projectIds = projects.map(p => p._id);

    const [totalTasks, todo, inProgress, completed, overdue] = await Promise.all([
      Task.countDocuments({ project: { $in: projectIds } }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'todo' }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'in-progress' }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'completed' }),
      Task.countDocuments({
        project: { $in: projectIds },
        dueDate: { $lt: new Date() },
        status: { $ne: 'completed' },
      }),
    ]);

    // Priority Distribution
    const priorities = ['Low', 'Medium', 'High'];
    const priorityDistribution = {};
    for (const p of priorities) {
      priorityDistribution[p] = await Task.countDocuments({ project: { $in: projectIds }, priority: p });
    }

    return sendSuccess(res, 200, 'Stats fetched', {
      stats: {
        totalTasks,
        todo,
        inProgress,
        completed,
        overdue,
        priorityDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getProjectStats,
  updateProjectProgress,
};
