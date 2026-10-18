import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCenterById } from '../services/centerService.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import SkeletonList from '../components/SkeletonList.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';

/** Public healthcare-centre profile built from real API data. */
export default function CenterDetails() {
  const { id } = useParams();
  const { t } = useLanguage();

  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getCenterById(id);
      setCenter(data.center);
    } catch (requestError) {
      setError(requestError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="stack">
        <PageHeader title={t('center.detailsTitle')} />
        <SkeletonList count={1} />
      </div>
    );
  }

  if (error || !center) {
    return (
      <div className="stack">
        <PageHeader title={t('center.detailsTitle')} />

        <ErrorMessage message={error} onRetry={load} />

        <EmptyState
          icon="🏥"
          title={t('center.notFoundTitle')}
          message={t('center.notFoundText')}
          actionTo="/healthcare-centers"
          actionLabel={t('center.findTitle')}
        />
      </div>
    );
  }

  return (
    <div className="detail">
      <PageHeader title={center.name} subtitle={center.location}>
        <Link to="/healthcare-centers" className="btn btn--ghost btn--small">
          ← {t('center.findTitle')}
        </Link>
      </PageHeader>

      <div className="section--tinted">
        <dl className="card__list">
          <div>
            <dt>{t('doctor.location')}</dt>
            <dd>{center.location}</dd>
          </div>
          <div>
            <dt>{t('center.address')}</dt>
            <dd>{center.address}</dd>
          </div>
          <div>
            <dt>{t('common.phone')}</dt>
            <dd>{center.phone}</dd>
          </div>
          {center.email && (
            <div>
              <dt>{t('common.email')}</dt>
              <dd>{center.email}</dd>
            </div>
          )}
          {center.openingHours && (
            <div>
              <dt>{t('center.openingHours')}</dt>
              <dd>{center.openingHours}</dd>
            </div>
          )}
        </dl>
      </div>

      <section className="section">
        <h2 className="section__title">{t('center.services')}</h2>

        {center.services?.length > 0 ? (
          <div className="tag-row">
            {center.services.map((service) => (
              <span className="tag" key={service}>
                {service}
              </span>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="ℹ"
            title={t('center.noServicesTitle')}
            message={t('center.noServicesText')}
          />
        )}
      </section>
    </div>
  );
}