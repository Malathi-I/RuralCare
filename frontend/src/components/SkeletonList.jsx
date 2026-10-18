import { useLanguage } from '../context/LanguageContext.jsx';

/**
 * Skeleton placeholder shown while a list loads.
 *
 * Skeletons are used instead of a big spinner so the layout does not jump
 * once data arrives, which matters on slow rural connections.
 */
export default function SkeletonList({ count = 3, height }) {
  const { t } = useLanguage();

  return (
    <div className="stack" role="status" aria-live="polite">
      <span className="visually-hidden">{t('common.loading')}</span>

      {Array.from({ length: count }).map((_, index) => (
        <div className="skeleton-card" key={index} aria-hidden="true">
          <div className="skeleton" style={{ width: '45%', height: '1.1rem' }} />
          <div
            className="skeleton"
            style={{ width: '75%', ...(height ? { height } : null) }}
          />
          <div className="skeleton" style={{ width: '35%' }} />
        </div>
      ))}
    </div>
  );
}