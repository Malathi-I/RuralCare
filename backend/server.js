import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import centerRoutes from './routes/centerRoutes.js';
import infoRoutes from './routes/infoRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

const PORT = process.env.PORT || 5000;

// Only the configured frontend origins are allowed.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Lightweight health check, useful for uptime monitoring.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ruralcare-api' });
});

// Public read-only APIs
app.use('/api/doctors', doctorRoutes);
app.use('/api/healthcare-centers', centerRoutes);
app.use('/api/health-information', infoRoutes);

// Authenticated APIs
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// Admin-only APIs
app.use('/api/admin', adminRoutes);

// Unknown route then global error handler
app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`RuralCare API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

start();

export default app;
