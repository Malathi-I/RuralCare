import { useEffect, useMemo, useState } from 'react';
import { getInformation } from '../services/infoService.js';
import { LANGUAGES, useLanguage } from '../context/LanguageContext.jsx';
import InfoCard from '../components/InfoCard.jsx';
import SkeletonList from '../components/SkeletonList.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { ArticleModal } from './Home.jsx';

export default function HealthInformation() {
  const { t, language } = useLanguage();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

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

  // Categories come from the real articles, never hard coded.
  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category).filter(Boolean))].sort(),
    [items]
  );

  const visible = items
    .filter((item) => {
      if (category && item.category !== category) return false;

      const query = search.trim().toLowerCase();
      if (!query) return true;

      return (
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query)
      );
    })
    // Articles written in the interface language appear first.
    .sort((a, b) => {
      if (a.language === language && b.language !== language) return -1;
      if (a.language !== language && b.language === language) return 1;
      return 0;
    });

  const hasFilters = search.trim() || category;

  return (
    <div className="stack">
      <PageHeader title={t('info.title')} subtitle={t('info.subtitle')} />

      <div className="toolbar">
        <label className="field">
          <span className="field__label">{t('common.search')}</span>
          <input
            className="field__input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('info.searchPlaceholder')}
          />
        </label>

        <label className="field">
          <span className="field__label">{t('info.category')}</span>
          <select
            className="field__input"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">{t('info.allCategories')}</option>
            {categories.map((item) => (
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
                setCategory('');
              }}
            >
              {t('common.clearFilters')}
            </button>
          )}
        </div>

        {!loading && (
          <span className="toolbar__result">
            {t('info.resultCount', { count: visible.length })}
          </span>
        )}
      </div>

      <ErrorMessage message={error} onRetry={loadInformation} />

      {loading ? (
        <SkeletonList count={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="📄"
          title={t('info.noInfoTitle')}
          message={t('info.noInfoText')}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={t('info.noMatchesTitle')}
          message={t('info.noMatchesText')}
          actionTo="/health-information"
          actionLabel={t('common.clearFilters')}
        />
      ) : (
        <div className="grid grid--3">
          {visible.map((item) => (
            <InfoCard key={item._id} item={item} onRead={setSelected} />
          ))}
        </div>
      )}

      <ArticleModal article={selected} onClose={() => setSelected(null)} />
    </div>
  );
}