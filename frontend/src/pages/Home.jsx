import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Home() {
  const { t } = useLanguage();

  const features = [
    { to: '/doctors', key: 'nav.doctors', text: 'Browse doctors by location and specialization.' },
    { to: '/healthcare-centers', key: 'nav.centers', text: 'Locate nearby healthcare centers and services.' },
    { to: '/health-information', key: 'nav.info', text: 'Read health guidance in your own language.' },
  ];

  return (
    <div className="stack">
      <section className="hero">
        <h1 className="hero__title">{t('dashboard.welcome')}</h1>
        <p className="hero__text">
          RuralCare helps rural communities find doctors, locate healthcare
          centers, book appointments and read health information - even on a slow
          or intermittent connection.
        </p>
        <div className="hero__actions">
          <Link to="/doctors" className="btn">
            {t('doctor.findTitle')}
          </Link>
          <Link to="/register" className="btn btn--ghost">
            {t('nav.register')}
          </Link>
        </div>
      </section>

      <section className="grid grid--3">
        {features.map((feature) => (
          <Link to={feature.to} className="card card--link" key={feature.to}>
            <h2 className="card__title">{t(feature.key)}</h2>
            <p className="card__text">{feature.text}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}