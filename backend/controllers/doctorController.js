import Doctor from '../models/Doctor.js';
import { isNotInPast, getToday, getDayName } from '../utils/schedule.js';

/**
 * GET /api/doctors
 * Public, read-only list. Supports simple optional filters to keep the
 * request small on low-bandwidth connections.
 */
export const listDoctors = async (req, res, next) => {
  try {
    const { specialization, location, available } = req.query;

    const filter = {};

    if (specialization) filter.specialization = new RegExp(specialization, 'i');
    if (location) filter.location = new RegExp(location, 'i');
    if (available === 'true') filter.available = true;

    const doctors = await Doctor.find(filter).sort({ name: 1 });

    return res.json({ count: doctors.length, doctors });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/doctors/:id
 * Public, read-only single doctor.
 */
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    return res.json({ doctor });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/doctors/me
 * Returns the doctor profile linked to the logged in doctor account.
 */
export const getMyDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({ message: 'No doctor profile is linked to this account' });
    }

    return res.json({ doctor });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/doctors/me/availability
 * Lets a doctor update their own working hours and availability flag.
 * Only fields listed here are accepted, and the profile is always located by
 * the logged in user id, so one doctor can never edit another doctor.
 */
export const updateMyAvailability = async (req, res, next) => {
  try {
    const { availability, available, name, specialization, phone, location } = req.body;

    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({ message: 'No doctor profile is linked to this account' });
    }

    if (availability !== undefined) {
      // Make sure each window ends after it starts.
      const invalid = (availability || []).some(
        (slot) => slot.startTime >= slot.endTime
      );

      if (invalid) {
        return res
          .status(400)
          .json({ message: 'Each availability slot must end after it starts' });
      }

      doctor.availability = availability;
    }

    if (available !== undefined) doctor.available = Boolean(available);
    if (name !== undefined) doctor.name = name;
    if (specialization !== undefined) doctor.specialization = specialization;
    if (phone !== undefined) doctor.phone = phone;
    if (location !== undefined) doctor.location = location;

    await doctor.save();

    return res.json({ doctor, message: 'Availability updated' });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/doctors/me/schedule?date=YYYY-MM-DD
 * Small helper used by the doctor dashboard to show a working day at a glance.
 */
export const getMySchedule = async (req, res, next) => {
  try {
    const date = req.query.date || getToday();

    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({ message: 'No doctor profile is linked to this account' });
    }

    const dayName = getDayName(date);
    const slots = (doctor.availability || []).filter((slot) => slot.day === dayName);

    return res.json({
      date,
      day: dayName,
      working: doctor.available && slots.length > 0 && isNotInPast(date),
      slots,
    });
  } catch (error) {
    return next(error);
  }
};
