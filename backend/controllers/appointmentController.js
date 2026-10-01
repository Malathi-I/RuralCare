import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import { isWithinWorkingHours, isNotInPast } from '../utils/schedule.js';

/**
 * POST /api/appointments
 * A patient books an appointment with a doctor.
 *
 * Rules enforced here:
 *  1. the request is authenticated and the user is a patient
 *  2. the patient can only book for themselves (body "patient" is ignored)
 *  3. the doctor must exist
 *  4. the doctor must be marked available
 *  5. the date must not be in the past and the time a valid HH:mm
 *  6. the time must fall inside the doctor's working hours
 *  7. the doctor's slot must not already be taken by a scheduled appointment
 *  8. the patient must not already have an appointment at that time
 */
export const createAppointment = async (req, res, next) => {
  try {
    const { doctor: doctorId, appointmentDate, appointmentTime } = req.body;

    // Rule 2: the patient is always the logged in user.
    const patientId = req.user._id;

    // Rule 3: doctor must exist.
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Rule 4: doctor must be accepting appointments.
    if (!doctor.available) {
      return res
        .status(400)
        .json({ message: 'This doctor is not accepting appointments right now' });
    }

    // Rule 5: no past dates.
    if (!isNotInPast(appointmentDate)) {
      return res.status(400).json({ message: 'Appointment date cannot be in the past' });
    }

    // Rule 6: time must be inside the published working hours.
    if (!isWithinWorkingHours(doctor, appointmentDate, appointmentTime)) {
      return res
        .status(400)
        .json({ message: 'The selected time is outside the doctor availability' });
    }

    // Rule 7: the doctor must not already be booked at that slot.
    const doctorSlotTaken = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate,
      appointmentTime,
      status: 'scheduled',
    });

    if (doctorSlotTaken) {
      return res.status(409).json({ message: 'This time slot is already booked' });
    }

    // Rule 8: the patient must not double-book themselves.
    const patientSlotTaken = await Appointment.findOne({
      patient: patientId,
      appointmentDate,
      appointmentTime,
      status: 'scheduled',
    });

    if (patientSlotTaken) {
      return res
        .status(409)
        .json({ message: 'You already have an appointment at this time' });
    }

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      appointmentDate,
      appointmentTime,
      status: 'scheduled',
    });

    return res.status(201).json({ appointment });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/appointments/my
 * Returns only the logged in patient's own appointments.
 */
export const getMyAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;

    const filter = { patient: req.user._id };
    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate('doctor', 'name specialization phone location')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    return res.json({ count: appointments.length, appointments });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/appointments/doctor
 * Returns the appointments assigned to the logged in doctor.
 * A doctor can never see another doctor's appointments.
 */
export const getDoctorAppointments = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res
        .status(404)
        .json({ message: 'No doctor profile is linked to this account' });
    }

    const { status, date } = req.query;

    const filter = { doctor: doctor._id };
    if (status) filter.status = status;
    if (date) filter.appointmentDate = date;

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    return res.json({ count: appointments.length, appointments });
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/appointments/:id/cancel
 * The patient who owns the appointment, the assigned doctor, or an admin
 * may cancel it. A completed appointment can no longer be cancelled.
 */
export const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isOwnerPatient = appointment.patient.toString() === req.user._id.toString();

    let isAssignedDoctor = false;
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      isAssignedDoctor =
        Boolean(doctor) && appointment.doctor.toString() === doctor._id.toString();
    }

    const isAdmin = req.user.role === 'admin';

    if (!isOwnerPatient && !isAssignedDoctor && !isAdmin) {
      return res
        .status(403)
        .json({ message: 'You can only cancel your own appointments' });
    }

    if (appointment.status === 'completed') {
      return res
        .status(400)
        .json({ message: 'A completed appointment cannot be cancelled' });
    }

    if (appointment.status === 'cancelled') {
      return res
        .status(400)
        .json({ message: 'This appointment is already cancelled' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    return res.json({ appointment, message: 'Appointment cancelled' });
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/appointments/:id/status
 * Only the assigned doctor (or an admin) can change a status. Patients must
 * use the cancel endpoint, so they can never mark a visit as completed.
 */
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res
        .status(400)
        .json({ message: 'Status must be scheduled, completed or cancelled' });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (req.user.role !== 'admin') {
      const doctor = await Doctor.findOne({ user: req.user._id });

      if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
        return res
          .status(403)
          .json({ message: 'You can only update appointments assigned to you' });
      }
    }

    // Re-opening a cancelled slot must not create two active bookings.
    if (status === 'scheduled' && appointment.status === 'cancelled') {
      const clash = await Appointment.findOne({
        doctor: appointment.doctor,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        status: 'scheduled',
        _id: { $ne: appointment._id },
      });

      if (clash) {
        return res
          .status(409)
          .json({ message: 'Another appointment already occupies this slot' });
      }
    }

    appointment.status = status;
    await appointment.save();

    return res.json({ appointment, message: 'Appointment status updated' });
  } catch (error) {
    return next(error);
  }
};

