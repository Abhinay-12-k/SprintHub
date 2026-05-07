const { validationResult } = require('express-validator');
const { sendError } = require('../utils/responseHandler');

/**
 * Runs after express-validator chains.
 * Collects all validation errors and returns them in one response.
 * Usage: add this as the last item in a route's middleware array.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((e) => e.msg);
    return sendError(res, 400, 'Validation failed', errorMessages);
  }
  next();
};

module.exports = { validate };
