import { useLanguage } from '../context/LanguageContext.jsx';

export default function LoadingSpinner({ label }) {
  const { t } = useLanguage();

  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label || t('message.loading')}</span>
    </div>
  );
}