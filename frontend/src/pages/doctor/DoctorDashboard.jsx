import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyDoctorProfile } from '../../services/doctorService.js';
import useDoctorAppointments from '../../hooks/useDoctorAppointments.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import DashboardShell from '../../components/DashboardShell.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import SkeletonList from '../../components/SkeletonList.jsx';
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

  const todaysAppointments = appointments
    .filter((item) => item.appointmentDate === today && item.status === 'scheduled')
    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));

  const upcoming = appointments
    .filter((item) => item.status === 'scheduled' && item.appointmentDate > today)
    .sort(
      (a, b) =>
        a.appointmentDate.localeCompare(b.appointmentDate) ||
        a.appointmentTime.localeCompare(b.appointmentTime)
    );

  const stats = [
    { label: t('appointment.todays'), value: todaysAppointments.length, tone: 'accent' },
    { label: t('dashboard.upcomingCount'), value: upcoming.length, tone: 'info' },
    {
      label: t('dashboard.completed'),
      value: appointments.filter((i) => i.status === 'completed').length,
      tone: 'ok',
    },
    { label: t('dashboard.totalAppointments'), value: appointments.length, tone: 'accent' },
  ];

  const experience =
    doctor?.experience > 0 ? `${doctor.experience} ${t('doctor.years')}` : null;

  return (
    <DashboardShell
      greeting={`${t('dashboard.welcome')}, ${user?.name}`}
      meta={t('dashboard.doctorMeta')}
    >
      <ErrorMessage message={profileError || error} onRetry={reload} />

      <section className="grid grid--4">
        {stats.map((stat) => (
          <div className={`stat stat--${stat.tone}`} key={stat.label}>
            <span className="stat__label">{stat.label}</span>
            <span className="stat__value">{stat.value}</span>
          </div>
        ))}
      </section>

      <section className="section section--tinted">
        <div className="section__head">
          <h2 className="section__title">{t('doctor.profileTitle')}</h2>
        </div>

        {doctor ? (
          <>
            <dl className="card__list">
              <div>
                <dt>{t('common.name')}</dt>
                <dd>{doctor.name}</dd>
              </div>
              <div>
                <dt>{t('doctor.specialization')}</dt>
                <dd>{doctor.specialization}</dd>
              </div>
              <div>
                <dt>{t('doctor.location')}</dt>
                <dd>{doctor.location}</dd>
              </div>
              <div>
                <dt>{t('common.phone')}</dt>
                <dd>{doctor.phone}</dd>
              </div>
              {experience && (
                <div>
                  <dt>{t('doctor.experience')}</dt>
                  <dd>{experience}</dd>
                </div>
              )}
              <div>
                <dt>{t('common.status')}</dt>
                <dd>
                  <span className={`chip ${doctor.available ? 'chip--ok' : 'chip--off'}`}>
                    {doctor.available ? t('doctor.available') : t('doctor.unavailable')}
                  </span>
                </dd>
              </div>
            </dl>

            <div className="tag-row">
              <Link to="/doctor/availability" className="btn btn--small">
                {t('doctor.setAvailability')}
              </Link>
              <Link to="/doctor/profile" className="btn btn--small btn--ghost">
                {t('common.editProfile')}
              </Link>
            </div>
          </>
        ) : (
          <EmptyState
            icon="🩺"
            title={t('doctor.noProfileTitle')}
            message={t('doctor.noProfileText')}
          />
        )}
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">{t('appointment.todays')}</h2>
          <p className="section__subtitle">{t('dashboard.todayHint')}</p>
        </div>

        {loading ? (
          <SkeletonList count={2} />
        ) : todaysAppointments.length === 0 ? (
          <EmptyState
            icon="📅"
            title={t('appointment.noTodayTitle')}
            message={t('appointment.noTodayText')}
            actionTo="/doctor/availability"
            actionLabel={t('doctor.setAvailability')}
          />
        ) : (
          <div className="stack">
            {todaysAppointments.map((appointment) => (
              <article className="card card--row" key={appointment._id}>
                <div>
                  <h3 className="card__title">
                    {formatTime(appointment.appointmentTime)} ·{' '}
                    {appointment.patient?.name}
                  </h3>

                  <p className="card__text">{appointment.patient?.email}</p>
                </div>

                <StatusBadge status={appointment.status} />
              </article>
            ))}
          </div>
        )}
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
            icon="🗓️"
            title={t('appointment.noUpcomingTitle')}
            message={t('appointment.noUpcomingText')}
          />
        ) : (
          <div className="stack">
            {upcoming.slice(0, 5).map((appointment) => (
              <article className="card card--row" key={appointment._id}>
                <div>
                  <h3 className="card__title">{appointment.patient?.name}</h3>

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
    </DashboardShell>
  );
}
