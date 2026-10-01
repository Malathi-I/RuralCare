import mongoose from 'mongoose';

/**
 * Connects to the MongoDB Atlas cluster using MONGODB_URI from .env
 * and keeps the process running if a transient DB error happens.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined. Check backend/.env');
  }

  const conn = await mongoose.connect(uri);

  console.log(`MongoDB Atlas connected: ${conn.connection.host}`);

  // A database that goes down should not crash the whole node process.
  conn.connection.on('error', (err) => {
    console.error('MongoDB error:', err.message);
  });

  return conn;
};

export default connectDB;
