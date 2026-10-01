import { validationResult } from 'express-validator';

/**
 * Runs after the express-validator chains and turns any failures
 * into a single 400 response the frontend can display.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const message = errors
    .array()
    .map((error) => error.msg)
    .join(', ');

  return res.status(400).json({ message });
};

export default validate;
