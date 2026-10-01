import mongoose from 'mongoose';

const healthInformationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title must be at most 150 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      enum: {
        values: ['en', 'ta', 'hi', 'te', 'kn', 'ml', 'bn', 'mr'],
        message: 'Unsupported language',
      },
      default: 'en',
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

// Helps the public list endpoint stay fast when filtering by language.
healthInformationSchema.index({ language: 1, category: 1 });

export default mongoose.model('HealthInformation', healthInformationSchema);
