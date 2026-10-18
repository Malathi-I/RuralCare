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

/**
 * The single key used to persist the JWT in localStorage.
 *
 * It is defined once here and imported by both the auth context and the axios
 * interceptor, so the reader and the writer can never drift apart and leave an
 * orphaned token behind (which would be silently reused on the next visit).
 */
export const AUTH_TOKEN_KEY = 'rc_token';