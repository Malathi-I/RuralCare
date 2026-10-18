import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * Builds the safe user object returned to the client.
 * The password hash is never included.
 */
const toPublicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  preferredLanguage: user.preferredLanguage,
  createdAt: user.createdAt,
});

/**
 * POST /api/auth/register
 * Creates a patient account.
 * The role is hard-coded to "patient" - a client can never choose its own
 * role, which prevents privilege escalation. Doctor and admin accounts are
 * created by an admin through /api/admin routes.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, preferredLanguage } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ message: 'An account with that email already exists' });
    }

    // Only these fields are copied from the request body. Anything else the
    // client sends (for example "role") is ignored.
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      preferredLanguage: preferredLanguage || 'en',
      role: 'patient',
    });

    return res.status(201).json({
      user: toPublicUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/auth/login
 * Returns the JWT and the safe user object on success.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // password has select:false in the schema, so ask for it explicitly.
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // Same message for both cases so emails cannot be enumerated.
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // A deactivated account may still know the right password, but it must
    // never receive a usable session. The check sits after the password
    // comparison so the message cannot be used to probe which emails exist,
    // and it reuses the exact status and wording the `protect` middleware
    // returns, so every gate reports deactivation identically.
    if (user.active === false) {
      return res
        .status(403)
        .json({ message: 'This account has been deactivated. Please contact support.' });
    }

    return res.json({
      user: toPublicUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/auth/me
 * Returns the currently logged in user, read fresh from the database.
 */
export const getMe = async (req, res, next) => {
  try {
    return res.json({ user: toPublicUser(req.user) });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/auth/profile
 * Lets a user update their own name and preferred language.
 * Email, role and id are never taken from the request body.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, preferredLanguage } = req.body;

    // Explicitly pick allowed fields so nothing else can be mass-assigned.
    if (name !== undefined) req.user.name = name;
    if (preferredLanguage !== undefined) req.user.preferredLanguage = preferredLanguage;

    const updated = await req.user.save();

    return res.json({ user: toPublicUser(updated), message: 'Profile updated' });
  } catch (error) {
    return next(error);
  }
};
