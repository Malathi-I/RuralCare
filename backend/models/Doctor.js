import mongoose from 'mongoose';

// One working-time entry, for example Monday 09:00 - 17:00.
const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: [true, 'Day is required'],
      enum: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be in HH:mm format'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be in HH:mm format'],
    },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    // A doctor profile always belongs to exactly one login account.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Linked user is required'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [60, 'Name must be at most 60 characters'],
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    // Global on/off switch set by the admin or the doctor.
    available: {
      type: Boolean,
      default: true,
    },
    // Weekly working hours used to validate appointment requests.
    availability: {
      type: [availabilitySchema],
      default: [],
    },
    // Optional professional profile details. All are optional so profiles
    // created before this field existed keep working untouched.
    experience: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      max: [80, 'Please enter a realistic number of years'],
      default: 0,
    },
    qualifications: {
      type: String,
      trim: true,
      maxlength: [200, 'Qualifications must be at most 200 characters'],
      default: '',
    },
    about: {
      type: String,
      trim: true,
      maxlength: [600, 'About must be at most 600 characters'],
      default: '',
    },
    languages: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

export default mongoose.model('Doctor', doctorSchema);
