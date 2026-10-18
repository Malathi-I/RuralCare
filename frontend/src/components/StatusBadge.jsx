import { useLanguage } from '../context/LanguageContext.jsx';

/**
 * Appointment status -> existing translation key.
 *
 * The labels already exist under the "dashboard" group in all eight language
 * files, so they are reused here instead of being duplicated into a second
 * namespace. A status outside this list falls back to its raw value, so an
 * unexpected status can never render as a raw translation key.
 */
const STATUS_LABEL_KEYS = {
  scheduled: 'dashboard.scheduled',
  completed: 'dashboard.completed',
  cancelled: 'dashboard.cancelled',
};

/** Coloured pill showing an appointment status. */
export default function StatusBadge({ status }) {
  const { t } = useLanguage();

  const labelKey = STATUS_LABEL_KEYS[status];
  const label = labelKey ? t(labelKey) : status;

  return <span className={`badge badge--${status}`}>{label}</span>;
}