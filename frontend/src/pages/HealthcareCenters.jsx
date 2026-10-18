import { useEffect, useMemo, useState } from 'react';
import { getCenters } from '../services/centerService.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import CenterCard from '../components/CenterCard.jsx';
import SkeletonList from '../components/SkeletonList.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';

export default function HealthcareCenters() {
  const { t } = useLanguage();

  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  const loadCenters = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getCenters();
      setCenters(data.centers);
    } catch (requestError) {
      setError(requestError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCenters();
  }, []);

  // Derived from real data, so the filter can never list a location
  // that does not exist in the database.
  const locations = useMemo(
    () => [...new Set(centers.map((center) => center.location))].sort(),
    [centers]
  );

  const hasFilters = search.trim() || location;

  const visible = centers.filter((center) => {
    if (location && center.location !== location) return false;

    const query = search.trim().toLowerCase();
    if (!query) return true;

    return (
      center.name.toLowerCase().includes(query) ||
      center.location.toLowerCase().includes(query) ||
      (center.address || '').toLowerCase().includes(query) ||
      center.services?.some((service) => service.toLowerCase().includes(query))
    );
  });

  return (
    <div className="stack">
      <PageHeader
        title={t('center.findTitle')}
        subtitle={t('center.findSubtitle')}
      />

      <div className="toolbar">
        <label className="field">
          <span className="field__label">{t('common.search')}</span>
          <input
            className="field__input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('center.searchPlaceholder')}
          />
        </label>

        <label className="field">
          <span className="field__label">{t('doctor.location')}</span>
          <select
            className="field__input"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          >
            <option value="">{t('common.all')}</option>
            {locations.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <div className="toolbar__row">
          {hasFilters && (
            <button
              type="button"
              className="btn btn--ghost btn--small"
              onClick={() => {
                setSearch('');
                setLocation('');
              }}
            >
              {t('common.clearFilters')}
            </button>
          )}
        </div>

        {!loading && (
          <span className="toolbar__result">
            {t('center.resultCount', { count: visible.length, total: centers.length })}
          </span>
        )}
      </div>

      <ErrorMessage message={error} onRetry={loadCenters} />

      {loading ? (
        <SkeletonList count={3} />
      ) : centers.length === 0 ? (
        <EmptyState
          icon="🏥"
          title={t('center.noCentersTitle')}
          message={t('center.noCentersText')}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={t('center.noMatchesTitle')}
          message={t('center.noMatchesText')}
          actionTo="/healthcare-centers"
          actionLabel={t('common.clearFilters')}
        />
      ) : (
        <div className="grid grid--3">
          {visible.map((center) => (
            <CenterCard key={center._id} center={center} />
          ))}
        </div>
      )}
    </div>
  );
}