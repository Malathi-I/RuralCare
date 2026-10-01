import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyAppointments } from '../../services/appointmentService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { formatDate, formatTime, todayString } from '../../utils/format.js';

export default function PatientDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

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

  const today = todayString();
  const upcoming = appointments.filter(
    (item) => item.status === 'scheduled' && item.appointmentDate >= today
  );

  return (
    <div className="stack">
      <h1 className="page-title">
        {t('dashboard.welcome')}, {user?.name}
      </h1>

      <section className="grid grid--3">
        <div className="stat">
          <span className="stat__label">{t('dashboard.totalAppointments')}</span>
          <span className="stat__value">{appointments.length}</span>
        </div>
        <div className="stat">
          <span className="stat__label">{t('dashboard.scheduled')}</span>
          <span className="stat__value">{upcoming.length}</span>
        </div>
        <div className="stat">
          <span className="stat__label">{t('dashboard.completed')}</span>
          <span className="stat__value">
            {appointments.filter((item) => item.status === 'completed').length}
          </span>
        </div>
      </section>

      <section className="stack">
        <h2 className="section-title">{t('dashboard.quickActions')}</h2>
        <div className="tag-row">
          <Link to="/patient/book-appointment" className="btn">
            {t('appointment.book')}
          </Link>
          <Link to="/patient/appointments" className="btn btn--ghost">
            {t('appointment.myAppointments')}
          </Link>
          <Link to="/patient/find-doctor" className="btn btn--ghost">
            {t('doctor.findTitle')}
          </Link>
          <Link to="/patient/find-center" className="btn btn--ghost">
            {t('center.findTitle')}
          </Link>
          <Link to="/patient/profile" className="btn btn--ghost">
            {t('nav.profile')}
          </Link>
        </div>
      </section>

      <section className="stack">
        <h2 className="section-title">{t('appointment.upcoming')}</h2>
        <ErrorMessage message={error} onRetry={load} />

        {loading ? (
          <LoadingSpinner />
        ) : upcoming.length === 0 ? (
          <EmptyState message={t('appointment.noAppointments')} />
        ) : (
          <div className="stack">
            {upcoming.slice(0, 5).map((appointment) => (
              <article className="card card--row" key={appointment._id}>
                <div>
                  <h3 className="card__title">
                    {appointment.doctor?.name || t('appointment.doctor')}
                  </h3>
                  <p className="card__text">
                    {appointment.doctor?.specialization} &middot;{' '}
                    {formatDate(appointment.appointmentDate)} at{' '}
                    {formatTime(appointment.appointmentTime)}
                  </p>
                </div>
                <StatusBadge status={appointment.status} />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}