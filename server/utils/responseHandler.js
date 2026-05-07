/**
 * Standardized API response format.
 * Every endpoint returns: { success, message, data, pagination? }
 * This consistency makes frontend integration and error handling clean.
 */

const sendSuccess = (res, statusCode, message, data = null, extra = {}) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  // Merge any extra fields (e.g., pagination metadata)
  Object.assign(response, extra);
  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode, message, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
