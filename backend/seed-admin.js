/**
 * Creates the first admin account for RuralCare.
 *
 * Why this exists:
 * The public register route deliberately only creates patients, so that a
 * visitor can never promote themselves to admin. That means the very first
 * admin has to be created out of band - this script is that tool.
 *
 * Usage:
 *   1. Fill in MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD
 *      in backend/.env
 *   2. Run:  cd backend && node seed-admin.js
 *
 * Safety notes:
 *  - The admin password is read from the environment, never hard-coded here.
 *  - The script refuses to run while ADMIN_PASSWORD is still the placeholder.
 *  - Password hashing is handled by the existing User model pre-save hook
 *    (bcrypt, 10 salt rounds), so the plain text is never written to MongoDB.
 *  - If the email already exists, nothing is changed and the script exits 0.
 *  - This script does not touch the authentication flow in any way.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';

// Values that mean "the developer has not chosen a real password yet".
const PLACEHOLDER_PASSWORDS = [
  'change_this_secure_password',
  'your_secure_password',
  'password',
  'admin',
  'change-me',
];

const ADMIN_NAME = (process.env.ADMIN_NAME || '').trim();
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

const fail = (message) => {
  console.error(`\n[seed-admin] FAILED: ${message}\n`);
  process.exitCode = 1;
};

const validateInput = () => {
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    fail(
      'ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must all be set in backend/.env'
    );
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ADMIN_EMAIL)) {
    fail('ADMIN_EMAIL is not a valid email address');
    return false;
  }

  if (ADMIN_PASSWORD.length < 8) {
    fail('ADMIN_PASSWORD must be at least 8 characters long');
    return false;
  }

  if (PLACEHOLDER_PASSWORDS.includes(ADMIN_PASSWORD.toLowerCase())) {
    fail(
      'ADMIN_PASSWORD is still the example placeholder. ' +
        'Set a real password in backend/.env and run the script again.'
    );
    return false;
  }

  return true;
};

const seedAdmin = async () => {
  if (!validateInput()) return;

  // Uses the same connection helper as the server (MONGODB_URI).
  await connectDB();

  const existing = await User.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    console.log(
      `[seed-admin] An account already exists for ${ADMIN_EMAIL} (role: ${existing.role}). Nothing changed.`
    );
    return;
  }

  // The User model hashes "password" with bcrypt before saving it,
  // so the plain-text value never reaches the database.
  const admin = await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
  });

  console.log(`[seed-admin] Admin created successfully: ${admin.email}`);
  console.log(
    '[seed-admin] Log in with these credentials, then use Admin Dashboard to create doctor accounts.'
  );
};

seedAdmin()
  .catch((error) => {
    fail(error.message);
  })
  .finally(async () => {
    // Always close the connection so the process can exit cleanly.
    await mongoose.connection.close();
  });