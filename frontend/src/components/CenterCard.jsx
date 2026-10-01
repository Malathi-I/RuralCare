import { useLanguage } from '../context/LanguageContext.jsx';

export default function CenterCard({ center }) {
  const { t } = useLanguage();

  return (
    <article className="card">
      <header className="card__header">
        <h3 className="card__title">{center.name}</h3>
      </header>

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
      </dl>

      {center.services?.length > 0 && (
        <>
          <h4 className="card__subtitle">{t('center.services')}</h4>
          <div className="tag-row">
            {center.services.map((service) => (
              <span className="tag" key={service}>
                {service}
              </span>
            ))}
          </div>
        </>
      )}
    </article>
  );
}