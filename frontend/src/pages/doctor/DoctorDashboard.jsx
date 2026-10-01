import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyDoctorProfile } from '../../services/doctorService.js';
import useDoctorAppointments from '../../hooks/useDoctorAppointments.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { formatDate, formatTime, todayString } from '../../utils/format.js';

export default function DoctorDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [profileError, setProfileError] = useState('');
  const { appointments, loading, error, reload } = useDoctorAppointments();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMyDoctorProfile();
        setDoctor(data.doctor);
      } catch (requestError) {
        setProfileError(requestError.userMessage);
      }
    };

    loadProfile();
  }, []);

  const today = todayString();
  const todaysAppointments = appointments.filter(
    (item) => item.appointmentDate === today && item.status === 'scheduled'
  );

  return (
    <div className="stack">
      <h1 className="page-title">
        {t('dashboard.welcome')}, {user?.name}
      </h1>

      <ErrorMessage message={profileError || error} onRetry={reload} />

      {doctor && (
        <section className="card">
          <h2 className="card__title">{doctor.name}</h2>
          <p className="card__text">{doctor.specialization}</p>
          <p className="card__text">
            {t('doctor.location')}: {doctor.location} &middot; {t('common.phone')}:{' '}
            {doctor.phone}
          </p>
          <span className={`chip ${doctor.available ? 'chip--ok' : 'chip--off'}`}>
            {doctor.available ? t('doctor.available') : t('doctor.unavailable')}
          </span>
        </section>
      )}

      <section className="grid grid--3">
        <div className="stat">
          <span className="stat__label">{t('appointment.todays')}</span>
          <span className="stat__value">{todaysAppointments.length}</span>
        </div>
        <div className="stat">
          <span className="stat__label">{t('dashboard.scheduled')}</span>
          <span className="stat__value">
            {appointments.filter((item) => item.status === 'scheduled').length}
          </span>
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
          <Link to="/doctor/today" className="btn">
            {t('appointment.todays')}
          </Link>
          <Link to="/doctor/upcoming" className="btn btn--ghost">
            {t('appointment.upcoming')}
          </Link>
          <Link to="/doctor/appointments" className="btn btn--ghost">
            {t('appointment.manage')}
          </Link>
          <Link to="/doctor/availability" className="btn btn--ghost">
            {t('doctor.availability')}
          </Link>
          <Link to="/doctor/profile" className="btn btn--ghost">
            {t('nav.profile')}
          </Link>
        </div>
      </section>

      <section className="stack">
        <h2 className="section-title">{t('appointment.todays')}</h2>

        {loading ? (
          <LoadingSpinner />
        ) : todaysAppointments.length === 0 ? (
          <EmptyState message={t('appointment.noAppointments')} />
        ) : (
          <div className="stack">
            {todaysAppointments.map((appointment) => (
              <article className="card card--row" key={appointment._id}>
                <div>
                  <h3 className="card__title">{appointment.patient?.name}</h3>
                  <p className="card__text">
                    {formatDate(appointment.appointmentDate)} &middot;{' '}
                    {formatTime(appointment.appointmentTime)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}