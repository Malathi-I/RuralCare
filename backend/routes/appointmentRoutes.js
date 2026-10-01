import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect, requirePatient, requireDoctor } from '../middleware/auth.js';
import {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  cancelAppointment,
  updateAppointmentStatus,
} from '../controllers/appointmentController.js';

const router = Router();

const createRules = [
  body('doctor').isMongoId().withMessage('A valid doctor id is required'),
  body('appointmentDate')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Appointment date must be in YYYY-MM-DD format'),
  body('appointmentTime')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('Appointment time must be in HH:mm format'),
];

const statusRules = [
  body('status')
    .isIn(['scheduled', 'completed', 'cancelled'])
    .withMessage('Status must be scheduled, completed or cancelled'),
];

// Specific paths first so they are not captured by "/:id"
router.get('/my', protect, getMyAppointments);
router.get('/doctor', protect, requireDoctor, getDoctorAppointments);

router.post('/', protect, requirePatient, createRules, validate, createAppointment);
router.patch('/:id/cancel', protect, cancelAppointment);
router.patch('/:id/status', protect, requireDoctor, statusRules, validate, updateAppointmentStatus);

export default router;
