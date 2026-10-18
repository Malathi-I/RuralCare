import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyAppointments } from '../../services/appointmentService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage, LANGUAGES } from '../../context/LanguageContext.jsx';
import DashboardShell from '../../components/DashboardShell.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import SkeletonList from '../../components/SkeletonList.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { formatDate, formatTime, todayString } from '../../utils/format.js';

/** Quick action tiles reused by the dashboard header area. */
function ActionTile({ to, icon, title, text }) {
  return (
    <Link to={to} className="value-card">
      <span className="value-card__icon" aria-hidden="true">
        {icon}
      </span>
      <h3 className="value-card__title">{title}</h3>
      <p className="value-card__text">{text}</p>
    </Link>
  );
}

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

  const upcoming = appointments
    .filter((item) => item.status === 'scheduled' && item.appointmentDate >= today)
    .sort(
      (a, b) =>
        a.appointmentDate.localeCompare(b.appointmentDate) ||
        a.appointmentTime.localeCompare(b.appointmentTime)
    );

  const past = appointments.filter((item) => item.status !== 'scheduled');

  const stats = [
    { label: t('dashboard.totalAppointments'), value: appointments.length, tone: 'accent' },
    { label: t('dashboard.upcomingCount'), value: upcoming.length, tone: 'info' },
    {
      label: t('dashboard.completed'),
      value: past.filter((i) => i.status === 'completed').length,
      tone: 'ok',
    },
    {
      label: t('dashboard.cancelled'),
      value: past.filter((i) => i.status === 'cancelled').length,
      tone: 'danger',
    },
  ];

  return (
    <DashboardShell
      greeting={`${t('dashboard.welcome')}, ${user?.name}`}
      meta={t('dashboard.patientMeta')}
    >
      <ErrorMessage message={error} onRetry={load} />

      <section className="grid grid--4">
        {stats.map((stat) => (
          <div className={`stat stat--${stat.tone}`} key={stat.label}>
            <span className="stat__label">{stat.label}</span>
            <span className="stat__value">{stat.value}</span>
          </div>
        ))}
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">{t('dashboard.quickActions')}</h2>
        </div>

        <div className="grid grid--4">
          <ActionTile
            to="/patient/book-appointment"
            icon="📅"
            title={t('appointment.book')}
            text={t('home.actionBooking')}
          />
          <ActionTile
            to="/patient/find-doctor"
            icon="🩺"
            title={t('doctor.findTitle')}
            text={t('home.actionDoctors')}
          />
          <ActionTile
            to="/patient/find-center"
            icon="🏥"
            title={t('center.findTitle')}
            text={t('home.actionCenters')}
          />
          <ActionTile
            to="/patient/health-information"
            icon="📖"
            title={t('info.title')}
            text={t('home.actionInfo')}
          />
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">{t('appointment.upcoming')}</h2>
          <p className="section__subtitle">{t('dashboard.upcomingHint')}</p>
        </div>

        {loading ? (
          <SkeletonList count={2} />
        ) : upcoming.length === 0 ? (
          <EmptyState
            icon="📅"
            title={t('appointment.noUpcomingTitle')}
            message={t('appointment.noUpcomingText')}
            actionTo="/patient/book-appointment"
            actionLabel={t('appointment.book')}
          />
        ) : (
          <div className="stack">
            {upcoming.map((appointment) => (
              <article className="card card--row" key={appointment._id}>
                <div>
                  <h3 className="card__title">
                    {appointment.doctor?.name || t('appointment.doctor')}
                  </h3>

                  <p className="card__text">
                    {appointment.doctor?.specialization}
                    {appointment.doctor?.location
                      ? ` · ${appointment.doctor.location}`
                      : ''}
                  </p>

                  <p className="card__text">
                    {formatDate(appointment.appointmentDate)} ·{' '}
                    {formatTime(appointment.appointmentTime)}
                  </p>
                </div>

                <StatusBadge status={appointment.status} />
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">{t('appointment.history')}</h2>
          <p className="section__subtitle">{t('dashboard.historyHint')}</p>
        </div>

        {loading ? (
          <SkeletonList count={2} />
        ) : past.length === 0 ? (
          <EmptyState
            icon="🗂️"
            title={t('appointment.noHistoryTitle')}
            message={t('appointment.noHistoryText')}
          />
        ) : (
          <div className="stack">
            {past.slice(0, 5).map((appointment) => (
              <article className="card card--row" key={appointment._id}>
                <div>
                  <h3 className="card__title">
                    {appointment.doctor?.name || t('appointment.doctor')}
                  </h3>

                  <p className="card__text">
                    {formatDate(appointment.appointmentDate)} ·{' '}
                    {formatTime(appointment.appointmentTime)}
                  </p>
                </div>

                <StatusBadge status={appointment.status} />
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section section--tinted">
        <div className="section__head">
          <h2 className="section__title">{t('nav.profile')}</h2>
        </div>

        <dl className="card__list">
          <div>
            <dt>{t('auth.name')}</dt>
            <dd>{user?.name}</dd>
          </div>
          <div>
            <dt>{t('common.email')}</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>{t('auth.language')}</dt>
            <dd>
              {LANGUAGES.find((item) => item.code === user?.preferredLanguage)?.label ||
                user?.preferredLanguage}
            </dd>
          </div>
        </dl>

        <Link
          to="/patient/profile"
          className="btn btn--small"
          style={{ alignSelf: 'flex-start' }}
        >
          {t('common.editProfile')}
        </Link>
      </section>
    </DashboardShell>
  );
}