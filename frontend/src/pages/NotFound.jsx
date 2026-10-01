import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="auth-page">
      <div className="form-card form-card--center">
        <h1 className="form-card__title">{t('message.pageNotFound')}</h1>
        <Link to="/" className="btn btn--full">
          {t('message.goHome')}
        </Link>
      </div>
    </div>
  );
}