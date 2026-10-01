import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect, requireDoctor } from '../middleware/auth.js';
import {
  listDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateMyAvailability,
  getMySchedule,
} from '../controllers/doctorController.js';

const router = Router();

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const availabilityRules = [
  body('availability')
    .optional()
    .isArray()
    .withMessage('Availability must be a list of slots'),
  body('availability.*.day')
    .optional()
    .isIn(DAYS)
    .withMessage('Availability day must be a valid weekday'),
  body('availability.*.startTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('Start time must be in HH:mm format'),
  body('availability.*.endTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('End time must be in HH:mm format'),
];

// Doctor-only routes are registered first so that "/me" is never
// mistaken for a doctor id by the "/:id" route below.
router.get('/me', protect, requireDoctor, getMyDoctorProfile);
router.get('/me/schedule', protect, requireDoctor, getMySchedule);
router.put(
  '/me/availability',
  protect,
  requireDoctor,
  availabilityRules,
  validate,
  updateMyAvailability
);

// Public read-only
router.get('/', listDoctors);
router.get('/:id', getDoctorById);

export default router;
