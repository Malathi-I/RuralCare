import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../../services/adminService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';

export default function AdminDashboard() {
  const { t } = useLanguage();

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

  if (loading) return <LoadingSpinner />;

  const cards = [
    { label: t('dashboard.totalUsers'), value: stats?.totalUsers },
    { label: t('dashboard.totalDoctors'), value: stats?.totalDoctors },
    { label: t('dashboard.totalCenters'), value: stats?.totalCenters },
    { label: t('dashboard.totalAppointments'), value: stats?.totalAppointments },
    { label: t('dashboard.scheduled'), value: stats?.scheduledAppointments },
    { label: t('dashboard.completed'), value: stats?.completedAppointments },
    { label: t('dashboard.cancelled'), value: stats?.cancelledAppointments },
    { label: t('dashboard.totalInformation'), value: stats?.totalHealthInformation },
  ];

  return (
    <div className="stack">
      <h1 className="page-title">{t('nav.dashboard')}</h1>

      <ErrorMessage message={error} onRetry={load} />

      <section className="grid grid--4">
        {cards.map((card) => (
          <div className="stat" key={card.label}>
            <span className="stat__label">{card.label}</span>
            <span className="stat__value">{card.value ?? 0}</span>
          </div>
        ))}
      </section>

      <section className="stack">
        <h2 className="section-title">{t('dashboard.quickActions')}</h2>
        <div className="tag-row">
          <Link to="/admin/users" className="btn">
            {t('nav.users')}
          </Link>
          <Link to="/admin/doctors" className="btn btn--ghost">
            {t('nav.doctors')}
          </Link>
          <Link to="/admin/centers" className="btn btn--ghost">
            {t('nav.centers')}
          </Link>
          <Link to="/admin/health-information" className="btn btn--ghost">
            {t('nav.info')}
          </Link>
          <Link to="/admin/appointments" className="btn btn--ghost">
            {t('nav.myAppointments')}
          </Link>
        </div>
      </section>
    </div>
  );
}