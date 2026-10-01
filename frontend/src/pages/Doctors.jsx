import { useEffect, useState } from 'react';
import { getDoctors } from '../services/doctorService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import DoctorCard from '../components/DoctorCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Doctors() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadDoctors = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getDoctors();
      setDoctors(data.doctors);
    } catch (requestError) {
      setError(requestError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  // Filtering happens on the device so it works offline on cached data.
  const visible = doctors.filter((doctor) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      doctor.name.toLowerCase().includes(query) ||
      doctor.specialization.toLowerCase().includes(query) ||
      doctor.location.toLowerCase().includes(query)
    );
  });

  return (
    <div className="stack">
      <h1 className="page-title">{t('doctor.findTitle')}</h1>

      <label className="field">
        <span className="field__label">{t('common.search')}</span>
        <input
          className="field__input"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('doctor.specialization')}
        />
      </label>

      <ErrorMessage message={error} onRetry={loadDoctors} />

      {loading ? (
        <LoadingSpinner />
      ) : visible.length === 0 ? (
        <EmptyState message={t('doctor.noDoctors')} />
      ) : (
        <div className="grid grid--3">
          {visible.map((doctor) => (
            <DoctorCard
              key={doctor._id}
              doctor={doctor}
              showBookButton={user?.role === 'patient'}
            />
          ))}
        </div>
      )}
    </div>
  );
}