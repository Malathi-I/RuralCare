import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import useDoctorAppointments from '../../hooks/useDoctorAppointments.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { formatDate, formatTime } from '../../utils/format.js';

/**
 * Lets a doctor complete or cancel the appointments assigned to them.
 * A doctor can never touch another doctor's appointments because the
 * backend checks the ownership of every appointment id.
 */
export default function AppointmentManagement() {
  const { t } = useLanguage();
  const { appointments, loading, error, reload, changeStatus } = useDoctorAppointments();
  const [filter, setFilter] = useState('all');

  const visible = appointments
    .filter((item) => (filter === 'all' ? true : item.status === filter))
    .sort((a, b) =>
      b.appointmentDate.localeCompare(a.appointmentDate) ||
      b.appointmentTime.localeCompare(a.appointmentTime)
    );

  const handleAction = async (appointment, status) => {
    if (status === 'cancelled') {
      const confirmed = window.confirm(t('appointment.cancelConfirm'));
      if (!confirmed) return;
    }

    await changeStatus(appointment._id, status);
  };

  return (
    <div className="stack">
      <h1 className="page-title">{t('appointment.manage')}</h1>

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
              {option === 'all' ? t('common.all') : t(`appointment.${option}`)}
            </button>
          ))}
        </div>
      </div>

      <ErrorMessage message={error} onRetry={reload} />

      {loading ? (
        <LoadingSpinner />
      ) : visible.length === 0 ? (
        <EmptyState message={t('appointment.noAppointments')} />
      ) : (
        <div className="stack">
          {visible.map((appointment) => (
            <article className="card card--row" key={appointment._id}>
              <div>
                <h2 className="card__title">{appointment.patient?.name}</h2>
                <p className="card__text">{appointment.patient?.email}</p>
                <p className="card__text">
                  {formatDate(appointment.appointmentDate)} &middot;{' '}
                  {formatTime(appointment.appointmentTime)}
                </p>
              </div>

              <div className="card__actions">
                <StatusBadge status={appointment.status} />

                {appointment.status === 'scheduled' && (
                  <>
                    <button
                      type="button"
                      className="btn btn--small"
                      onClick={() => handleAction(appointment, 'completed')}
                    >
                      {t('appointment.markCompleted')}
                    </button>
                    <button
                      type="button"
                      className="btn btn--small btn--danger"
                      onClick={() => handleAction(appointment, 'cancelled')}
                    >
                      {t('appointment.cancel')}
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}