export const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const APPOINTMENT_STATUSES = ['scheduled', 'completed', 'cancelled'];

export const ROLES = ['patient', 'doctor', 'admin'];

/** Maps an appointment status to a CSS modifier class. */
export const statusClass = (status) => `badge badge--${status}`;