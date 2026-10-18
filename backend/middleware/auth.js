import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Verifies the "Authorization: Bearer <token>" header and loads the user
 * from the database. The role always comes from the database record,
 * never from the request body or the token contents.
 */
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorised, no token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Not authorised, user no longer exists' });
    }

    // A deactivated account keeps its history but must not be able to act.
    if (user.active === false) {
      return res
        .status(403)
        .json({ message: 'This account has been deactivated. Please contact support.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorised, token is invalid' });
  }
};

/**
 * Allows only admin users through. Must run after `protect`.
 *
 * @deprecated Prefer the generic `authorize('admin')` so new routes all use
 * the same reusable guard. This wrapper is kept so the existing route files
 * keep working unchanged.
 */
export const requireAdmin = (req, res, next) => authorize('admin')(req, res, next);

/**
 * Allows only doctor users through. Must run after `protect`.
 * @see requireAdmin
 */
export const requireDoctor = (req, res, next) => authorize('doctor')(req, res, next);

/**
 * Allows only patient users through. Must run after `protect`.
 * @see requireAdmin
 */
export const requirePatient = (req, res, next) => authorize('patient')(req, res, next);

/**
 * Reusable role guard: authorize('patient'), authorize('doctor'),
 * authorize('admin') or authorize('doctor', 'admin').
 *
 * The role is always read from the database-backed req.user, never from the
 * request body or from the token payload, so a client cannot escalate itself.
 * Must always be chained after `protect`.
 */
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorised, no token provided' });
    }

    if (!roles.includes(req.user.role)) {
      const readable = roles.length === 1 ? roles[0] : roles.join(' or ');
      return res
        .status(403)
        .json({ message: `This action requires the ${readable} role` });
    }

    return next();
  };
