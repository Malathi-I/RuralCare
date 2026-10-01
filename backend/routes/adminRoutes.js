import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import {
  getStats,
  listAppointments,
  getUsers,
  updateUserRole,
  deleteUser,
  listDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  createCenter,
  updateCenter,
  deleteCenter,
  createInformation,
  updateInformation,
  deleteInformation,
} from '../controllers/adminController.js';

const router = Router();

// Every admin route is protected and limited to admin accounts.
router.use(protect, requireAdmin);

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const doctorRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('availability.*.startTime').optional().matches(timePattern).withMessage('Start time must be HH:mm'),
  body('availability.*.endTime').optional().matches(timePattern).withMessage('End time must be HH:mm'),
];

const centerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
];

const informationRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('language')
    .optional()
    .isIn(['en', 'ta', 'hi', 'te', 'kn', 'ml', 'bn', 'mr'])
    .withMessage('Unsupported language'),
];

const roleRule = [
  body('role')
    .isIn(['patient', 'doctor', 'admin'])
    .withMessage('Role must be patient, doctor or admin'),
];

// Dashboard
router.get('/stats', getStats);

// Appointments overview
router.get('/appointments', listAppointments);

// Users
router.get('/users', getUsers);
router.patch('/users/:id/role', roleRule, validate, updateUserRole);
router.delete('/users/:id', deleteUser);

// Doctors
router.get('/doctors', listDoctors);
router.post('/doctors', doctorRules, validate, createDoctor);
router.put('/doctors/:id', validate, updateDoctor);
router.delete('/doctors/:id', deleteDoctor);

// Healthcare centers
router.post('/healthcare-centers', centerRules, validate, createCenter);
router.put('/healthcare-centers/:id', validate, updateCenter);
router.delete('/healthcare-centers/:id', deleteCenter);

// Health information
router.post('/health-information', informationRules, validate, createInformation);
router.put('/health-information/:id', validate, updateInformation);
router.delete('/health-information/:id', deleteInformation);

export default router;
