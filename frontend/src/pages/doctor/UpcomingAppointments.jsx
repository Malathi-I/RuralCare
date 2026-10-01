import { useLanguage } from '../../context/LanguageContext.jsx';
import useDoctorAppointments from '../../hooks/useDoctorAppointments.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { formatDate, formatTime, todayString } from '../../utils/format.js';

/** Shows every scheduled appointment that has not happened yet. */
export default function UpcomingAppointments() {
  const { t } = useLanguage();
  const { appointments, loading, error, reload } = useDoctorAppointments();

  const today = todayString();

  const upcoming = appointments
    .filter((item) => item.status === 'scheduled' && item.appointmentDate >= today)
    .sort(
      (a, b) =>
        a.appointmentDate.localeCompare(b.appointmentDate) ||
        a.appointmentTime.localeCompare(b.appointmentTime)
    );

  return (
    <div className="stack">
      <h1 className="page-title">{t('appointment.upcoming')}</h1>

      <ErrorMessage message={error} onRetry={reload} />

      {loading ? (
        <LoadingSpinner />
      ) : upcoming.length === 0 ? (
        <EmptyState message={t('appointment.noAppointments')} />
      ) : (
        <div className="stack">
          {upcoming.map((appointment) => (
            <article className="card card--row" key={appointment._id}>
              <div>
                <h2 className="card__title">{appointment.patient?.name}</h2>
                <p className="card__text">
                  {formatDate(appointment.appointmentDate)} &middot;{' '}
                  {formatTime(appointment.appointmentTime)}
                </p>
              </div>
              <StatusBadge status={appointment.status} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}