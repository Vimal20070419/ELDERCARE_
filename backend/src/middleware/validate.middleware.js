// middleware/validate.middleware.js
const { validationResult } = require('express-validator');
const { error } = require('../utils/apiResponse');

/**
 * Middleware to check for validation errors from express-validator.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(err => err.msg).join(', ');
    return error(res, messages, 400);
  }
  next();
};

module.exports = { validate };
