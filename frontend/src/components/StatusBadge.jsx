import { useLanguage } from '../context/LanguageContext.jsx';

/** Coloured pill showing an appointment status. */
export default function StatusBadge({ status }) {
  const { t } = useLanguage();

  const label = t(`appointment.${status}`) || status;

  return <span className={`badge badge--${status}`}>{label}</span>;
}