/** Formats a YYYY-MM-DD string as a readable date. */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/** Turns "14:30" into a 12-hour label such as "02:30 PM". */
export const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return timeString;

  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;

  return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

/** Returns today's date as YYYY-MM-DD in the browser's timezone. */
export const todayString = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

/** Returns the weekday name for a YYYY-MM-DD string, for example "Monday". */
export const dayNameFromDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  // getDay() is 0 for Sunday, so this array must start with Sunday.
  const names = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return names[date.getDay()];
};

/**
 * Collapses exact duplicate working windows in a doctor's availability list.
 *
 * Availability is modelled as one working window per weekday, and existing
 * records can contain the identical window twice. Every view renders the list
 * as given, so the same hours would otherwise be shown on repeat. Only exact
 * duplicates (same day, start and end) are removed - two genuinely different
 * windows on the same day, such as a morning and an afternoon shift, are both
 * kept. The stored record is never modified.
 */
export const uniqueAvailabilitySlots = (availability) => {
  if (!Array.isArray(availability)) return [];

  const seen = new Set();

  return availability.filter((slot) => {
    if (!slot) return false;

    const key = `${slot.day}|${slot.startTime}|${slot.endTime}`;
    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

/**
 * Builds the bookable time slots for a doctor on a given date,
 * in 30 minute steps, from the doctor's published working hours.
 */
export const buildTimeSlots = (availability, dateString) => {
  if (!availability || !dateString) return [];

  const dayName = dayNameFromDate(dateString);
  const slots = availability.filter((slot) => slot.day === dayName);
  if (slots.length === 0) return [];

  const toMinutes = (value) => {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const times = [];

  slots.forEach((slot) => {
    const start = toMinutes(slot.startTime);
    const end = toMinutes(slot.endTime);

    // Last booking starts 30 minutes before closing time.
    for (let minute = start; minute + 30 <= end; minute += 30) {
      const hours = String(Math.floor(minute / 60)).padStart(2, '0');
      const minutes = String(minute % 60).padStart(2, '0');
      times.push(`${hours}:${minutes}`);
    }
  });

  // Remove duplicates when a doctor has overlapping windows on one day.
  return [...new Set(times)].sort();
};