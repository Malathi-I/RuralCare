import { useLanguage } from '../../context/LanguageContext.jsx';
import useDoctorAppointments from '../../hooks/useDoctorAppointments.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { formatTime, todayString } from '../../utils/format.js';

/** Shows the scheduled appointments for today. */
export default function TodaysAppointments() {
  const { t } = useLanguage();
  const { appointments, loading, error, reload } = useDoctorAppointments();

  const today = todayString();

  const todays = appointments
    .filter((item) => item.appointmentDate === today && item.status === 'scheduled')
    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));

  return (
    <div className="stack">
      <h1 className="page-title">{t('appointment.todays')}</h1>

      <ErrorMessage message={error} onRetry={reload} />

      {loading ? (
        <LoadingSpinner />
      ) : todays.length === 0 ? (
        <EmptyState message={t('appointment.noAppointments')} />
      ) : (
        <div className="stack">
          {todays.map((appointment) => (
            <article className="card card--row" key={appointment._id}>
              <div>
                <h2 className="card__title">
                  {formatTime(appointment.appointmentTime)} &middot;{' '}
                  {appointment.patient?.name}
                </h2>
                <p className="card__text">{appointment.patient?.email}</p>
              </div>
              <StatusBadge status={appointment.status} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}