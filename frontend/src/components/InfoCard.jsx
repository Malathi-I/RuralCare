import { useLanguage } from '../context/LanguageContext.jsx';

export default function InfoCard({ item, onRead }) {
  const { t } = useLanguage();

  return (
    <article className="card">
      <span className="chip chip--soft">{item.category}</span>
      <h3 className="card__title">{item.title}</h3>
      <p className="card__text">
        {item.content.length > 140 ? `${item.content.slice(0, 140)}...` : item.content}
      </p>
      <button type="button" className="btn btn--small" onClick={() => onRead(item)}>
        {t('info.readMore')}
      </button>
    </article>
  );
}