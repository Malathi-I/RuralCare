import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../../services/adminService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import DashboardShell from '../../components/DashboardShell.jsx';
import SkeletonList from '../../components/SkeletonList.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { ROLE_NAV } from '../../components/DashboardShell.jsx';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getStats();
      setStats(data.stats);
    } catch (requestError) {
      setError(requestError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cards = [
    { label: t('dashboard.totalUsers'), value: stats?.totalUsers, tone: 'accent' },
    { label: t('dashboard.totalDoctors'), value: stats?.totalDoctors, tone: 'info' },
    { label: t('dashboard.totalCenters'), value: stats?.totalCenters, tone: 'ok' },
    {
      label: t('dashboard.totalAppointments'),
      value: stats?.totalAppointments,
      tone: 'accent',
    },
    {
      label: t('dashboard.scheduled'),
      value: stats?.scheduledAppointments,
      tone: 'info',
    },
    {
      label: t('dashboard.completed'),
      value: stats?.completedAppointments,
      tone: 'ok',
    },
    {
      label: t('dashboard.cancelled'),
      value: stats?.cancelledAppointments,
      tone: 'danger',
    },
    {
      label: t('dashboard.totalInformation'),
      value: stats?.totalHealthInformation,
      tone: 'warn',
    },
  ];

  // Management sections reuse the exact same nav definition as the tabs,
  // so the dashboard shortcuts can never drift from the navigation.
  const managementLinks = (ROLE_NAV.admin || []).filter((item) => item.to !== '/admin');

  return (
    <DashboardShell
      greeting={`${t('dashboard.welcome')}, ${user?.name}`}
      meta={t('dashboard.adminMeta')}
    >
      <ErrorMessage message={error} onRetry={load} />

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">{t('dashboard.platformStats')}</h2>
          <p className="section__subtitle">{t('dashboard.platformStatsText')}</p>
        </div>

        {loading ? (
          <SkeletonList count={3} />
        ) : (
          <div className="grid grid--4">
            {cards.map((card) => (
              <div className={`stat stat--${card.tone}`} key={card.label}>
                <span className="stat__label">{card.label}</span>
                <span className="stat__value">{card.value ?? 0}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">{t('dashboard.quickActions')}</h2>
          <p className="section__subtitle">{t('dashboard.adminActionsText')}</p>
        </div>

        <div className="grid grid--3">
          {managementLinks.map((link) => (
            <Link key={link.to} to={link.to} className="value-card">
              <h3 className="value-card__title">{t(link.key)}</h3>
              <p className="value-card__text">{t(`admin.hint.${link.to}`)}</p>
            </Link>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}