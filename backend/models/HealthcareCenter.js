import mongoose from 'mongoose';

const healthcareCenterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name must be at most 100 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    services: {
      type: [String],
      default: [],
    },
    // Optional details that make the centre profile useful to a patient.
    openingHours: {
      type: String,
      trim: true,
      maxlength: [160, 'Opening hours must be at most 160 characters'],
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    type: {
      type: String,
      trim: true,
      default: '',
    },
    open: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

export default mongoose.model('HealthcareCenter', healthcareCenterSchema);
