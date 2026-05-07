const mongoose = require('mongoose');

// Activity logs give the app an "enterprise feel" — every important action is recorded
const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
      // Examples: "created project", "assigned task", "moved task to Completed"
    },
    // The user who performed the action
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Optional reference to a project
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    // Optional reference to a task
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    // Additional metadata (flexible object for context)
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    type: {
      type: String,
      enum: ['project', 'task', 'user', 'system'],
      default: 'system',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fetching logs by project efficiently
activityLogSchema.index({ project: 1, createdAt: -1 });
activityLogSchema.index({ performedBy: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
