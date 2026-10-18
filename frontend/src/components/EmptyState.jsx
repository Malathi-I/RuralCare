import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

/**
 * Reusable professional empty state.
 *
 * Every list in the app uses this so "no data" always looks intentional:
 * an icon, a short title, an explanation and an optional next action.
 */
export default function EmptyState({
  icon = 'ℹ',
  title,
  message,
  actionTo,
  actionLabel,
}) {
  const { t } = useLanguage();

  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        {icon}
      </span>

      <h3 className="empty-state__title">{title || t('message.noResults')}</h3>

      {message && <p className="empty-state__text">{message}</p>}

      {actionTo && actionLabel && (
        <Link to={actionTo} className="btn btn--small">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}