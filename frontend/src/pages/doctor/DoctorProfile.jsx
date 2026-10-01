import { useEffect, useState } from 'react';
import { getMyDoctorProfile } from '../../services/doctorService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';

export default function DoctorProfile() {
  const { t } = useLanguage();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getMyDoctorProfile();
      setDoctor(data.doctor);
    } catch (requestError) {
      setError(requestError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="stack">
      <h1 className="page-title">{t('nav.profile')}</h1>

      <ErrorMessage message={error} onRetry={load} />

      {doctor && (
        <section className="card">
          <h2 className="card__title">{doctor.name}</h2>

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
            <div>
              <dt>{t('common.status')}</dt>
              <dd>
                {doctor.available ? t('doctor.available') : t('doctor.unavailable')}
              </dd>
            </div>
          </dl>
        </section>
      )}

      <section className="stack">
        <h2 className="section-title">{t('doctor.availability')}</h2>
        {doctor?.availability?.length > 0 ? (
          <div className="card">
            <ul className="slot-list">
              {doctor.availability.map((slot, index) => (
                <li key={`${slot.day}-${index}`}>
                  <strong>{slot.day}</strong> {slot.startTime} - {slot.endTime}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="card__text">{t('doctor.availability')}</p>
        )}
      </section>
    </div>
  );
}