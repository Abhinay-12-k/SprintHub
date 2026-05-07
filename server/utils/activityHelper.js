const ActivityLog = require('../models/ActivityLog');

/**
 * Log an activity to the database.
 * Called from controllers after important mutations.
 * Non-blocking — if logging fails, we don't crash the request.
 */
const logActivity = async ({ action, performedBy, project = null, task = null, type = 'system', meta = {} }) => {
  try {
    await ActivityLog.create({ action, performedBy, project, task, type, meta });
  } catch (error) {
    // Log to console but never propagate — activity logging should never break core features
    console.error('Activity log failed:', error.message);
  }
};

module.exports = { logActivity };
