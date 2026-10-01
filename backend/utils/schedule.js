/**
 * Small helpers for checking a doctor's weekly schedule.
 * Keeping this logic in one place makes the appointment rules easy to explain.
 */

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/** Returns the weekday name (for example "Monday") for a YYYY-MM-DD string. */
export const getDayName = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);
  return DAYS[date.getDay()];
};

/** Returns today's date as YYYY-MM-DD in the server's local timezone. */
export const getToday = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

/**
 * True when the given HH:mm time sits inside one of the doctor's
 * working windows for that weekday.
 */
export const isWithinWorkingHours = (doctor, dateString, timeString) => {
  const dayName = getDayName(dateString);
  const slots = (doctor.availability || []).filter((slot) => slot.day === dayName);

  if (slots.length === 0) return false;

  return slots.some(
    (slot) => timeString >= slot.startTime && timeString <= slot.endTime
  );
};

/** True when the requested date is today or a future date. */
export const isNotInPast = (dateString) => {
  return dateString >= getToday();
};
