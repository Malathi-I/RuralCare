import { useEffect, useState } from 'react';
import { getInformation } from '../services/infoService.js';
import { LANGUAGES, useLanguage } from '../context/LanguageContext.jsx';
import InfoCard from '../components/InfoCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function HealthInformation() {
  const { t, language } = useLanguage();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const loadInformation = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getInformation();
      setItems(data.items);
    } catch (requestError) {
      setError(requestError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInformation();
  }, []);

  // Articles written in the interface language appear first.
  const ordered = [...items].sort((a, b) => {
    if (a.language === language && b.language !== language) return -1;
    if (a.language !== language && b.language === language) return 1;
    return 0;
  });

  return (
    <div className="stack">
      <h1 className="page-title">{t('info.title')}</h1>

      <ErrorMessage message={error} onRetry={loadInformation} />

      {loading ? (
        <LoadingSpinner />
      ) : ordered.length === 0 ? (
        <EmptyState message={t('info.noInfo')} />
      ) : (
        <div className="grid grid--3">
          {ordered.map((item) => (
            <InfoCard key={item._id} item={item} onRead={setSelected} />
          ))}
        </div>
      )}

      {selected && (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <div className="modal__panel" onClick={(event) => event.stopPropagation()}>
            <span className="chip chip--soft">{selected.category}</span>
            <h2 className="modal__title">{selected.title}</h2>
            <p className="modal__body">{selected.content}</p>
            <div className="modal__footer">
              <span className="chip chip--soft">
                {LANGUAGES.find((item) => item.code === selected.language)?.label ||
                  selected.language}
              </span>
              <button type="button" className="btn" onClick={() => setSelected(null)}>
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}