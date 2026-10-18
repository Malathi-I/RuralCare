import { useEffect, useState } from 'react';
import { getAdminAppointments } from '../../services/adminService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { formatDate, formatTime } from '../../utils/format.js';

/** Admin-only read-only view of every appointment on the platform. */
export default function AppointmentOverview() {
  const { t } = useLanguage();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAdminAppointments();
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

  const visible = appointments.filter((item) =>
    filter === 'all' ? true : item.status === filter
  );

  const counts = {
    scheduled: appointments.filter((item) => item.status === 'scheduled').length,
    completed: appointments.filter((item) => item.status === 'completed').length,
    cancelled: appointments.filter((item) => item.status === 'cancelled').length,
  };

  return (
    <div className="stack">
      <h1 className="page-title">{t('appointment.title')}</h1>

      <section className="grid grid--3">
        <div className="stat">
          <span className="stat__label">{t('dashboard.scheduled')}</span>
          <span className="stat__value">{counts.scheduled}</span>
        </div>
        <div className="stat">
          <span className="stat__label">{t('dashboard.completed')}</span>
          <span className="stat__value">{counts.completed}</span>
        </div>
        <div className="stat">
          <span className="stat__label">{t('dashboard.cancelled')}</span>
          <span className="stat__value">{counts.cancelled}</span>
        </div>
      </section>

      <div className="field">
        <span className="field__label">{t('common.status')}</span>
        <div className="filter-row">
          {['all', 'scheduled', 'completed', 'cancelled'].map((option) => (
            <button
              key={option}
              type="button"
              className={`chip chip--button${filter === option ? ' chip--active' : ''}`}
              onClick={() => setFilter(option)}
            >
              {option === 'all' ? t('common.all') : t(`dashboard.${option}`)}
            </button>
          ))}
        </div>
      </div>

      <ErrorMessage message={error} onRetry={load} />

      {loading ? (
        <LoadingSpinner />
      ) : visible.length === 0 ? (
        <EmptyState message={t('appointment.noAppointments')} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t('appointment.date')}</th>
                <th>{t('appointment.time')}</th>
                <th>{t('appointment.doctor')}</th>
                <th>{t('common.name')}</th>
                <th>{t('common.status')}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((appointment) => (
                <tr key={appointment._id}>
                  <td>{formatDate(appointment.appointmentDate)}</td>
                  <td>{formatTime(appointment.appointmentTime)}</td>
                  <td>{appointment.doctor?.name}</td>
                  <td>{appointment.patient?.name}</td>
                  <td>
                    <StatusBadge status={appointment.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}