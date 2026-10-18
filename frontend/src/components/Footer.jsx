import { Link } from 'react-router-dom';
import { useLanguage, LANGUAGES } from '../context/LanguageContext.jsx';
import Icon from './Icon.jsx';

/** Professional multi-column footer with real navigation links only. */
export default function Footer() {
  const { t } = useLanguage();

  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          <div className="footer__col">
            {/* Decorative mark; the wordmark beside it carries the name. */}
            <p className="footer__mark">
              <span className="footer__badge" aria-hidden="true">
                <Icon name="stethoscope" size={18} />
              </span>
              RuralCare
            </p>
            <p className="footer__text">{t('footer.tagline')}</p>
          </div>

          <div className="footer__col">
            <h2 className="footer__title">{t('footer.navigate')}</h2>
            <ul className="footer__links">
              <li><Link to="/">{t('nav.home')}</Link></li>
              <li><Link to="/doctors">{t('nav.doctors')}</Link></li>
              <li><Link to="/healthcare-centers">{t('nav.centers')}</Link></li>
              <li><Link to="/health-information">{t('nav.info')}</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h2 className="footer__title">{t('footer.account')}</h2>
            <ul className="footer__links">
              <li><Link to="/login">{t('nav.login')}</Link></li>
              <li><Link to="/register">{t('nav.register')}</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h2 className="footer__title">{t('footer.languages')}</h2>
            <ul className="footer__links">
              {LANGUAGES.map((item) => (
                <li key={item.code}>{item.label}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__text footer__text--muted">{t('footer.offline')}</p>
          <p className="footer__text footer__text--muted">
            &copy; {year} RuralCare. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}