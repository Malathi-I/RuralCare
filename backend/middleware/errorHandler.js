/** Handles any request that did not match a route. */
export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Central error handler. Converts Mongoose errors into friendly messages
 * and only includes the stack trace outside production.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Server error';

  // Mongoose schema validation failed.
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((fieldError) => fieldError.message)
      .join(', ');
  }

  // Invalid ObjectId in a URL parameter.
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Unique index violation (for example a duplicate email).
  if (err.code === 11000) {
    statusCode = 400;
    message = 'A record with that value already exists';
  }

  const response = { message };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};
