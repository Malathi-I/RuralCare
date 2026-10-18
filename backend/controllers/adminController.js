import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import HealthcareCenter from '../models/HealthcareCenter.js';
import Appointment from '../models/Appointment.js';
import HealthInformation from '../models/HealthInformation.js';
import { safeContainsRegExp } from '../utils/schedule.js';

/**
 * GET /api/admin/stats
 * Aggregate counts used by the admin dashboard.
 */
export const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDoctors,
      totalCenters,
      totalAppointments,
      scheduled,
      completed,
      cancelled,
      totalInformation,
    ] = await Promise.all([
      User.countDocuments(),
      Doctor.countDocuments(),
      HealthcareCenter.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'scheduled' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      HealthInformation.countDocuments(),
    ]);

    return res.json({
      stats: {
        totalUsers,
        totalDoctors,
        totalCenters,
        totalAppointments,
        scheduledAppointments: scheduled,
        completedAppointments: completed,
        cancelledAppointments: cancelled,
        totalHealthInformation: totalInformation,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/admin/users
 * Admin-only user list. Passwords are excluded by the schema (select:false).
 */
export const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: safeContainsRegExp(search) },
        { email: safeContainsRegExp(search) },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    return res.json({ count: users.length, users });
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/admin/users/:id/role
 * The only way a role can change. An admin cannot change their own role,
 * which prevents the platform from ending up with no admin.
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['patient', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be patient, doctor or admin' });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    return res.json({ user, message: 'Role updated' });
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/admin/users/:id/active
 * Activates or deactivates a user account (the safe alternative to a hard
 * delete: the account keeps its data but can no longer sign in). An admin
 * cannot target their own account, so nobody can lock themselves out.
 * Only the `active` flag is ever written - role, email and everything else
 * are untouched, so there is no mass assignment.
 */
export const setUserActive = async (req, res, next) => {
  try {
    const { active } = req.body;

    // The route validator already enforces a real boolean; this controller
    // guard is a second net so a string like "false" can never coerce to true.
    if (typeof active !== 'boolean') {
      return res.status(400).json({ message: 'Active must be a boolean' });
    }

    if (req.params.id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: 'You cannot change your own account status' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.active = active;
    await user.save();

    return res.json({
      user,
      message: active ? 'Account activated' : 'Account deactivated',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/admin/users/:id
 * Removes the user, the linked doctor profile (when present) and the user's
 * own appointments, so no document is left pointing at a deleted account.
 */
export const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const doctor = await Doctor.findOne({ user: user._id });

    if (doctor) {
      await Appointment.deleteMany({ doctor: doctor._id });
      await Doctor.deleteOne({ _id: doctor._id });
    }

    // Remove this user's own appointments so none is left pointing at a
    // deleted account - the same cascade the doctor branch above applies.
    await Appointment.deleteMany({ patient: user._id });

    await User.deleteOne({ _id: user._id });

    return res.json({ message: 'User deleted' });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/admin/doctors
 */
export const listDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'name email')
      .sort({ name: 1 });

    return res.json({ count: doctors.length, doctors });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/admin/doctors
 * Creates the login account and the doctor profile together.
 */
export const createDoctor = async (req, res, next) => {
  try {
    const { name, email, password, specialization, phone, location, availability } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'An account with that email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'doctor',
    });

    const doctor = await Doctor.create({
      user: user._id,
      name,
      specialization,
      phone,
      location,
      availability: availability || [],
      available: true,
    });

    return res.status(201).json({ doctor, message: 'Doctor created' });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/admin/doctors/:id
 */
export const updateDoctor = async (req, res, next) => {
  try {
    const { name, specialization, phone, location, available, availability } = req.body;

    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (name !== undefined) doctor.name = name;
    if (specialization !== undefined) doctor.specialization = specialization;
    if (phone !== undefined) doctor.phone = phone;
    if (location !== undefined) doctor.location = location;
    if (available !== undefined) doctor.available = Boolean(available);
    if (availability !== undefined) doctor.availability = availability;

    await doctor.save();

    return res.json({ doctor, message: 'Doctor updated' });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/admin/doctors/:id
 * Also removes the linked login account and that doctor's appointments.
 */
export const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    await Appointment.deleteMany({ doctor: doctor._id });
    await Doctor.deleteOne({ _id: doctor._id });
    await User.deleteOne({ _id: doctor.user });

    return res.json({ message: 'Doctor deleted' });
  } catch (error) {
    return next(error);
  }
};


/**
 * GET /api/admin/appointments
 * Admin-only overview of every appointment, used by the admin dashboard.
 * Patient names and doctor names are populated for the table.
 */
export const listAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization')
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .limit(200);

    return res.json({ count: appointments.length, appointments });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/admin/healthcare-centers
 */
export const createCenter = async (req, res, next) => {
  try {
    const { name, location, address, phone, services } = req.body;

    const center = await HealthcareCenter.create({
      name,
      location,
      address,
      phone,
      services: services || [],
    });

    return res.status(201).json({ center, message: 'Healthcare center created' });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/admin/healthcare-centers/:id
 */
export const updateCenter = async (req, res, next) => {
  try {
    const { name, location, address, phone, services } = req.body;

    const center = await HealthcareCenter.findById(req.params.id);

    if (!center) {
      return res.status(404).json({ message: 'Healthcare center not found' });
    }

    if (name !== undefined) center.name = name;
    if (location !== undefined) center.location = location;
    if (address !== undefined) center.address = address;
    if (phone !== undefined) center.phone = phone;
    if (services !== undefined) center.services = services;

    await center.save();

    return res.json({ center, message: 'Healthcare center updated' });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/admin/healthcare-centers/:id
 */
export const deleteCenter = async (req, res, next) => {
  try {
    const center = await HealthcareCenter.findById(req.params.id);

    if (!center) {
      return res.status(404).json({ message: 'Healthcare center not found' });
    }

    await HealthcareCenter.deleteOne({ _id: center._id });

    return res.json({ message: 'Healthcare center deleted' });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/admin/health-information
 */
export const createInformation = async (req, res, next) => {
  try {
    const { title, content, category, language } = req.body;

    const item = await HealthInformation.create({
      title,
      content,
      category,
      language: language || 'en',
    });

    return res.status(201).json({ item, message: 'Health information created' });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/admin/health-information/:id
 */
export const updateInformation = async (req, res, next) => {
  try {
    const { title, content, category, language } = req.body;

    const item = await HealthInformation.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Health information not found' });
    }

    if (title !== undefined) item.title = title;
    if (content !== undefined) item.content = content;
    if (category !== undefined) item.category = category;
    if (language !== undefined) item.language = language;

    await item.save();

    return res.json({ item, message: 'Health information updated' });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/admin/health-information/:id
 */
export const deleteInformation = async (req, res, next) => {
  try {
    const item = await HealthInformation.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Health information not found' });
    }

    await HealthInformation.deleteOne({ _id: item._id });

    return res.json({ message: 'Health information deleted' });
  } catch (error) {
    return next(error);
  }
};

