import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { register, login, getMe, updateProfile } from '../controllers/authController.js';

const router = Router();

const registerRules = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('preferredLanguage')
    .optional()
    .isIn(['en', 'ta', 'hi', 'te', 'kn', 'ml', 'bn', 'mr'])
    .withMessage('Unsupported language'),
];

const loginRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

const profileRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),
  body('preferredLanguage')
    .optional()
    .isIn(['en', 'ta', 'hi', 'te', 'kn', 'ml', 'bn', 'mr'])
    .withMessage('Unsupported language'),
];

// Public
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);

// Private
router.get('/me', protect, getMe);
router.put('/profile', protect, profileRules, validate, updateProfile);

export default router;
