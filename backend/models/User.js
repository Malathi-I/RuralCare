import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name must be at most 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      // select:false keeps the password out of every query result by default.
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['patient', 'doctor', 'admin'],
        message: 'Role must be patient, doctor or admin',
      },
      default: 'patient',
    },
    // Soft-delete / deactivation switch used by the admin user management.
    // A deactivated account keeps its data and appointments but can no
    // longer sign in, which is safer than a hard delete.
    active: {
      type: Boolean,
      default: true,
    },
    preferredLanguage: {
      type: String,
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

/**
 * Hash the password with bcrypt whenever it is set or changed.
 * This keeps plain-text passwords out of the database.
 *
 * Note: this hook is a promise-based (async) hook and must NOT declare a
 * "next" parameter. Mongoose 9 no longer supplies "next" to async hooks,
 * so mixing the two styles throws "next is not a function" on every save.
 * Throwing is enough to abort the save and surface a real error.
 */
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/** Compare a plain-text password with the stored bcrypt hash. */
userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/** Extra safety net: never leak the hash or mongoose internals as JSON. */
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
