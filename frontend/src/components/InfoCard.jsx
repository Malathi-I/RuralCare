import { useLanguage } from '../context/LanguageContext.jsx';
import Icon from './Icon.jsx';

export default function InfoCard({ item, onRead }) {
  const { t } = useLanguage();

  return (
    <article className="card info-card">
      {/* Decorative category thumbnail - the title below carries the meaning. */}
      <div className="info-card__thumb" aria-hidden="true">
        <Icon name="book" size={30} />
      </div>

      <div className="info-card__meta">
        <span className="chip chip--soft">{item.category}</span>
      </div>

      <h3 className="card__title">{item.title}</h3>

      <p className="card__text">
        {item.content.length > 140 ? `${item.content.slice(0, 140)}...` : item.content}
      </p>

      <div className="card__actions" style={{ marginTop: 'auto' }}>
        <button type="button" className="btn btn--small" onClick={() => onRead(item)}>
          {t('info.readMore')}
        </button>
      </div>
    </article>
  );
}