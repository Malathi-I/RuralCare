import { useEffect, useState } from 'react';
import { getCenters } from '../services/centerService.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import CenterCard from '../components/CenterCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function HealthcareCenters() {
  const { t } = useLanguage();

  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

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

  const visible = centers.filter((center) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      center.name.toLowerCase().includes(query) ||
      center.location.toLowerCase().includes(query) ||
      center.services?.some((service) => service.toLowerCase().includes(query))
    );
  });

  return (
    <div className="stack">
      <h1 className="page-title">{t('center.findTitle')}</h1>

      <label className="field">
        <span className="field__label">{t('common.search')}</span>
        <input
          className="field__input"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('doctor.location')}
        />
      </label>

      <ErrorMessage message={error} onRetry={loadCenters} />

      {loading ? (
        <LoadingSpinner />
      ) : visible.length === 0 ? (
        <EmptyState message={t('center.noCenters')} />
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