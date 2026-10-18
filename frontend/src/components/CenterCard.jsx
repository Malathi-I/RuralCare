import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import Icon from './Icon.jsx';

export default function CenterCard({ center }) {
  const { t } = useLanguage();

  // A real photo is used when the record provides one; otherwise the card
  // falls back to a lightweight gradient frame.
  const photo = center.image || center.photo || center.photoUrl;

  return (
    <article className="card">
      {photo && (
        <div className="card__thumb">
          <img
            className="card__photo"
            src={photo}
            /* Meaningful alt text: the center's name. */
            alt={`${center.name} — ${center.location}`}
            /* Below the fold on the landing page, so lazy-load it. */
            loading="lazy"
            decoding="async"
            width="320"
            height="160"
          />
        </div>
      )}

      <header className="card__header">
        <div>
          <h3 className="card__title">{center.name}</h3>
          {center.type && <p className="card__subtitle">{center.type}</p>}
        </div>

        {/* The schema defaults `open` to true, so only render a status chip
            when the field is actually present on the record. */}
        {typeof center.open === 'boolean' && (
          <span className={`chip ${center.open ? 'chip--ok' : 'chip--off'}`}>
            {center.open ? t('home.openNow') : t('home.closedNow')}
          </span>
        )}
      </header>

      <div className="card__facts">
        <p className="card__fact">
          <Icon name="pin" size={16} />
          <span>{center.location}</span>
        </p>

        <p className="card__fact">
          <Icon name="hospital" size={16} />
          <span>{center.address}</span>
        </p>

        <p className="card__fact">
          <Icon name="stethoscope" size={16} />
          <span>{center.phone}</span>
        </p>

        {center.openingHours && (
          <p className="card__fact">
            <Icon name="clock" size={16} />
            <span>{center.openingHours}</span>
          </p>
        )}
      </div>

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

      <div className="card__actions">
        <Link
          to={`/healthcare-centers/${center._id}`}
          className="btn btn--small btn--ghost"
        >
          {t('home.ctaViewCenter')}
        </Link>
      </div>
    </article>
  );
}