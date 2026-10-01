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

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorised, token is invalid' });
  }
};

/** Allows only admin users through. Must run after `protect`. */
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({ message: 'Admin access only' });
};

/** Allows only doctor users through. Must run after `protect`. */
export const requireDoctor = (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    return next();
  }

  return res.status(403).json({ message: 'Doctor access only' });
};

/** Allows only patient users through. Must run after `protect`. */
export const requirePatient = (req, res, next) => {
  if (req.user && req.user.role === 'patient') {
    return next();
  }

  return res.status(403).json({ message: 'Patient access only' });
};
