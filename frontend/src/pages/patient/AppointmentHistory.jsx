import { useEffect, useState } from 'react';
import { getMyAppointments } from '../../services/appointmentService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { formatDate, formatTime } from '../../utils/format.js';

export default function AppointmentHistory() {
  const { t } = useLanguage();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getMyAppointments();
        // History only shows visits that are finished or cancelled.
        setAppointments(
          data.appointments.filter((item) => item.status !== 'scheduled')
        );
      } catch (requestError) {
        setError(requestError.userMessage);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="stack">
      <h1 className="page-title">{t('appointment.history')}</h1>

      <ErrorMessage message={error} />

      {loading ? (
        <LoadingSpinner />
      ) : appointments.length === 0 ? (
        <EmptyState message={t('appointment.noAppointments')} />
      ) : (
        <div className="stack">
          {appointments.map((appointment) => (
            <article className="card card--row" key={appointment._id}>
              <div>
                <h2 className="card__title">
                  {appointment.doctor?.name || t('appointment.doctor')}
                </h2>
                <p className="card__text">
                  {appointment.doctor?.specialization} &middot;{' '}
                  {appointment.doctor?.location}
                </p>
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