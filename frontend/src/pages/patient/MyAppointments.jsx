import { useEffect, useState } from 'react';
import { getMyAppointments, cancelAppointment } from '../../services/appointmentService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { formatDate, formatTime } from '../../utils/format.js';

export default function MyAppointments() {
  const { t } = useLanguage();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getMyAppointments();
      setAppointments(data.appointments);
    } catch (requestError) {
      setError(requestError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (appointment) => {
    const confirmed = window.confirm(t('appointment.cancelConfirm'));
    if (!confirmed) return;

    setError('');

    try {
      await cancelAppointment(appointment._id);
      await load();
    } catch (requestError) {
      setError(requestError.userMessage);
    }
  };

  return (
    <div className="stack">
      <h1 className="page-title">{t('appointment.myAppointments')}</h1>

      <ErrorMessage message={error} onRetry={load} />

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
                <p className="card__text">{appointment.doctor?.specialization}</p>
                <p className="card__text">
                  {formatDate(appointment.appointmentDate)} &middot;{' '}
                  {formatTime(appointment.appointmentTime)}
                </p>
                {appointment.doctor?.phone && (
                  <p className="card__text">{appointment.doctor.phone}</p>
                )}
              </div>

              <div className="card__actions">
                <StatusBadge status={appointment.status} />
                {appointment.status === 'scheduled' && (
                  <button
                    type="button"
                    className="btn btn--small btn--danger"
                    onClick={() => handleCancel(appointment)}
                  >
                    {t('appointment.cancel')}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}