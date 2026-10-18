/** Handles any request that did not match a route. */
export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Central error handler. Converts Mongoose errors into friendly messages,
 * keeps the full error in the server log for debugging, and always returns
 * a response that is safe to show to a client: never a stack trace, file
 * path, database detail or any other internal implementation detail.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // If the response has already been sent there is nothing safe left to
  // write; hand the error back to Express instead of touching a finished
  // response.
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  // Generic fallback for anything unexpected. Unknown errors must never be
  // echoed back: their message can contain file paths, MongoDB connection
  // details, credentials or code structure. The known-safe branches below
  // replace this with a friendly message.
  let message = 'Internal server error';

  // True once a known, user-safe message has been chosen.
  let handled = false;

  // Mongoose schema validation failed. These messages are written by the
  // developer to be shown to users, so they are safe to return.
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((fieldError) => fieldError.message)
      .join(', ');
    handled = true;
  }

  // Invalid ObjectId in a URL parameter.
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
    handled = true;
  }

  // Unique index violation (for example a duplicate email).
  if (err.code === 11000) {
    statusCode = 400;
    message = 'A record with that value already exists';
    handled = true;
  }

  // A deliberate 4xx set upstream (the not-found handler above) carries an
  // intentional message such as "Route not found: GET /path" that only
  // echoes what the client already asked for, so it is safe to show.
  if (!handled && statusCode >= 400 && statusCode < 500) {
    message = err.message || message;
  }

  // The full error, stack trace included, is only ever written to the
  // server-side log so it can be debugged without reaching the client.
  // The response below contains nothing but the safe message.
  console.error(`[${statusCode}] ${req.method} ${req.originalUrl}`, err);

  return res.status(statusCode).json({ message });
};
