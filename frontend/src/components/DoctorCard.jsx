import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { uniqueAvailabilitySlots } from '../utils/format.js';
import Icon from './Icon.jsx';

/** Initials avatar so a doctor card reads clearly without any image download. */
const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

export default function DoctorCard({ doctor, showBookButton = false }) {
  const { t } = useLanguage();

  const experience =
    doctor.experience > 0 ? `${doctor.experience} ${t('doctor.years')}` : null;

  // A real photo is used when the record provides one; otherwise the card
  // falls back to a lightweight gradient + initials frame.
  const photo = doctor.image || doctor.photo || doctor.photoUrl;

  return (
    <article className="card">
      {photo ? (
        <div className="card__thumb">
          <img
            className="card__photo"
            src={photo}
            /* Meaningful alt text: the doctor's name. */
            alt={`${doctor.name} — ${doctor.specialization}`}
            /* Below the fold on the landing page, so lazy-load it. */
            loading="lazy"
            decoding="async"
            width="320"
            height="160"
          />
        </div>
      ) : (
        <div className="card__thumb">
          <span style={{ fontSize: '1.9rem', fontWeight: 700 }}>
            {initials(doctor.name)}
          </span>
        </div>
      )}

      <header className="card__header">
        <div>
          <h3 className="card__title">{doctor.name}</h3>
          <p className="card__subtitle">{doctor.specialization}</p>
        </div>

        <span className={`chip ${doctor.available ? 'chip--ok' : 'chip--off'}`}>
          {doctor.available ? t('doctor.available') : t('doctor.unavailable')}
        </span>
      </header>

      <div className="card__facts">
        <p className="card__fact">
          <Icon name="pin" size={16} />
          <span>{doctor.location}</span>
        </p>

        <p className="card__fact">
          <Icon name="clock" size={16} />
          <span>
            {doctor.available ? t('home.availabilityOn') : t('home.availabilityOff')}
          </span>
        </p>

        <p className="card__fact">
          <Icon name="stethoscope" size={16} />
          <span>{doctor.phone}</span>
        </p>

        {experience && (
          <p className="card__fact">
            <Icon name="check" size={16} />
            <span>{experience}</span>
          </p>
        )}
      </div>

      {uniqueAvailabilitySlots(doctor.availability).length > 0 && (
        <details className="card__extra">
          <summary>{t('doctor.availability')}</summary>
          <ul className="slot-list">
            {uniqueAvailabilitySlots(doctor.availability).map((slot, index) => (
              <li key={`${slot.day}-${slot.startTime}-${index}`}>
                <strong>{slot.day}</strong> {slot.startTime} - {slot.endTime}
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="card__actions">
        <Link to={`/doctors/${doctor._id}`} className="btn btn--small btn--ghost">
          {t('home.ctaViewProfile')}
        </Link>

        {showBookButton && doctor.available && (
          <Link
            to={`/patient/book-appointment?doctor=${doctor._id}`}
            className="btn btn--small"
          >
            {t('appointment.book')}
          </Link>
        )}
      </div>
    </article>
  );
}