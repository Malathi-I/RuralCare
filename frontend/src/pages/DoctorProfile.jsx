import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDoctorById } from '../services/doctorService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import SkeletonList from '../components/SkeletonList.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { uniqueAvailabilitySlots } from '../utils/format.js';

/**
 * Public doctor profile built from real API data.
 *
 * The booking button only appears for a logged in patient, and always points
 * at the real booking route so the previous broken link cannot return.
 */
export default function DoctorProfile() {
  const { id } = useParams();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getDoctorById(id);
      setDoctor(data.doctor);
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
        <PageHeader title={t('doctor.profileTitle')} />
        <SkeletonList count={1} />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="stack">
        <PageHeader title={t('doctor.profileTitle')} />

        <ErrorMessage message={error} onRetry={load} />

        <EmptyState
          icon="🩺"
          title={t('doctor.notFoundTitle')}
          message={t('doctor.notFoundText')}
          actionTo="/doctors"
          actionLabel={t('doctor.findTitle')}
        />
      </div>
    );
  }

  const experience =
    doctor.experience > 0 ? `${doctor.experience} ${t('doctor.years')}` : null;

  return (
    <div className="detail">
      <PageHeader
        title={doctor.name}
        subtitle={`${doctor.specialization} · ${doctor.location}`}
      >
        <Link to="/doctors" className="btn btn--ghost btn--small">
          ← {t('doctor.findTitle')}
        </Link>

        {user?.role === 'patient' && doctor.available && (
          <Link
            to={`/patient/book-appointment?doctor=${doctor._id}`}
            className="btn btn--small"
          >
            {t('appointment.book')}
          </Link>
        )}
      </PageHeader>

      <div className="section--tinted">
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
          {experience && (
            <div>
              <dt>{t('doctor.experience')}</dt>
              <dd>{experience}</dd>
            </div>
          )}
          <div>
            <dt>{t('common.status')}</dt>
            <dd>
              <span className={`chip ${doctor.available ? 'chip--ok' : 'chip--off'}`}>
                {doctor.available ? t('doctor.available') : t('doctor.unavailable')}
              </span>
            </dd>
          </div>
          {doctor.qualifications && (
            <div>
              <dt>{t('doctor.qualifications')}</dt>
              <dd>{doctor.qualifications}</dd>
            </div>
          )}
        </dl>

        {doctor.about && (
          <>
            <h2 className="section__title" style={{ marginTop: '1rem' }}>
              {t('doctor.about')}
            </h2>
            <p className="prose">{doctor.about}</p>
          </>
        )}
      </div>

      <section className="section">
        <h2 className="section__title">{t('doctor.availability')}</h2>

        {uniqueAvailabilitySlots(doctor.availability).length > 0 ? (
          <div className="grid grid--2">
            {uniqueAvailabilitySlots(doctor.availability).map((slot, index) => (
              <div className="card" key={`${slot.day}-${slot.startTime}-${index}`}>
                <h3 className="card__title">{slot.day}</h3>
                <p className="card__text">
                  {slot.startTime} – {slot.endTime}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🕒"
            title={t('doctor.noAvailabilityTitle')}
            message={t('doctor.noAvailabilityText')}
          />
        )}
      </section>
    </div>
  );
}