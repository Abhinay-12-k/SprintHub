const { verifyToken } = require('../utils/jwtHelper');
const User = require('../models/User');
const { sendError } = require('../utils/responseHandler');

/**
 * PROTECT MIDDLEWARE
 * Validates JWT token on every protected route.
 * Flow: Extract token → Verify → Fetch user from DB → Attach to req.user
 *
 * Why fetch from DB? To catch deactivated accounts and always have fresh user data.
 */
const protect = async (req, res, next) => {
  let token;

  // Token expected in Authorization header: "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized — no token provided');
  }

  try {
    const decoded = verifyToken(token);

    // Fetch fresh user data — if user was deactivated after token was issued, they're blocked here
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return sendError(res, 401, 'Not authorized — user not found or deactivated');
    }

    req.user = user; // Attach user object to request for downstream use
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Session expired — please login again');
    }
    return sendError(res, 401, 'Not authorized — invalid token');
  }
};

/**
 * AUTHORIZE MIDDLEWARE (Role-Based Access Control)
 * Usage: authorize('admin') — only admins can proceed
 *        authorize('admin', 'member') — both roles allowed
 *
 * Must be used AFTER protect() since it depends on req.user
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied — requires role: ${roles.join(' or ')}`
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
