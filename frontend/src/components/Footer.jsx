import { useLanguage } from '../context/LanguageContext.jsx';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__brand">RuralCare</p>
        <p className="footer__text">
          A rural healthcare platform for finding doctors, healthcare centers
          and booking appointments.
        </p>
        <p className="footer__text footer__text--muted">
          Works offline for saved health information. Built for low-bandwidth
          networks.
        </p>
        <p className="footer__text footer__text--muted">
          {t('dashboard.welcome')} &middot; 2026
        </p>
      </div>
    </footer>
  );
}