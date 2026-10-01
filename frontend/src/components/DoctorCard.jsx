import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function DoctorCard({ doctor, showBookButton = false }) {
  const { t } = useLanguage();

  return (
    <article className="card">
      <header className="card__header">
        <h3 className="card__title">{doctor.name}</h3>
        <span className={`chip ${doctor.available ? 'chip--ok' : 'chip--off'}`}>
          {doctor.available ? t('doctor.available') : t('doctor.unavailable')}
        </span>
      </header>

      <dl className="card__list">
        <div>
          <dt>{t('doctor.specialization')}</dt>
          <dd>{doctor.specialization}</dd>
        </div>
        <div>
          <dt>{t('doctor.location')}</dt>
          <dd>{doctor.location}</dd>
        </div>
        <div>
          <dt>{t('common.phone')}</dt>
          <dd>{doctor.phone}</dd>
        </div>
      </dl>

      {Array.isArray(doctor.availability) && doctor.availability.length > 0 && (
        <details className="card__extra">
          <summary>{t('doctor.availability')}</summary>
          <ul className="slot-list">
            {doctor.availability.map((slot, index) => (
              <li key={`${slot.day}-${index}`}>
                <strong>{slot.day}</strong> {slot.startTime} - {slot.endTime}
              </li>
            ))}
          </ul>
        </details>
      )}

      {showBookButton && (
        <Link to={`/book-appointment?doctor=${doctor._id}`} className="btn btn--full">
          {t('appointment.book')}
        </Link>
      )}
    </article>
  );
}