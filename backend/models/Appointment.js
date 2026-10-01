import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient is required'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required'],
    },
    appointmentDate: {
      type: String,
      required: [true, 'Appointment date is required'],
      // Store as YYYY-MM-DD so comparisons are simple and timezone safe.
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Appointment date must be in YYYY-MM-DD format'],
    },
    appointmentTime: {
      type: String,
      required: [true, 'Appointment time is required'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Appointment time must be in HH:mm format'],
    },
    status: {
      type: String,
      enum: {
        values: ['scheduled', 'completed', 'cancelled'],
        message: 'Status must be scheduled, completed or cancelled',
      },
      default: 'scheduled',
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

/**
 * Prevents two active bookings for the same doctor at the same date and time.
 * The partial filter means a cancelled appointment frees the slot again.
 */
appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, appointmentTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'scheduled' },
  }
);

export default mongoose.model('Appointment', appointmentSchema);
