import { useLanguage } from '../context/LanguageContext.jsx';

export default function ErrorMessage({ message, onRetry }) {
  const { t } = useLanguage();

  if (!message) return null;

  return (
    <div className="alert alert--error" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="btn btn--small" onClick={onRetry}>
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}