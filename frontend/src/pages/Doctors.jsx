import { useEffect, useMemo, useState } from 'react';
import { getDoctors } from '../services/doctorService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import DoctorCard from '../components/DoctorCard.jsx';
import SkeletonList from '../components/SkeletonList.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';

export default function Doctors() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [location, setLocation] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

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

  // Filter options are derived from the real data, never hard coded.
  const specializations = useMemo(
    () => [...new Set(doctors.map((doctor) => doctor.specialization))].sort(),
    [doctors]
  );

  const locations = useMemo(
    () => [...new Set(doctors.map((doctor) => doctor.location))].sort(),
    [doctors]
  );

  const hasFilters =
    search.trim() || specialization || location || onlyAvailable;

  const visible = doctors.filter((doctor) => {
    const query = search.trim().toLowerCase();

    if (
      query &&
      !doctor.name.toLowerCase().includes(query) &&
      !doctor.specialization.toLowerCase().includes(query) &&
      !doctor.location.toLowerCase().includes(query)
    ) {
      return false;
    }

    if (specialization && doctor.specialization !== specialization) return false;
    if (location && doctor.location !== location) return false;
    if (onlyAvailable && !doctor.available) return false;

    return true;
  });

  return (
    <div className="stack">
      <PageHeader title={t('doctor.findTitle')} subtitle={t('doctor.findSubtitle')} />

      <div className="toolbar">
        <label className="field">
          <span className="field__label">{t('common.search')}</span>
          <input
            className="field__input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('doctor.searchPlaceholder')}
          />
        </label>

        <label className="field">
          <span className="field__label">{t('doctor.specialization')}</span>
          <select
            className="field__input"
            value={specialization}
            onChange={(event) => setSpecialization(event.target.value)}
          >
            <option value="">{t('common.all')}</option>
            {specializations.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">{t('doctor.location')}</span>
          <select
            className="field__input"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          >
            <option value="">{t('common.all')}</option>
            {locations.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <div className="toolbar__row">
          <label className="field field--inline">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(event) => setOnlyAvailable(event.target.checked)}
            />
            <span className="field__label">{t('doctor.onlyAvailable')}</span>
          </label>

          {hasFilters && (
            <button
              type="button"
              className="btn btn--ghost btn--small"
              onClick={() => {
                setSearch('');
                setSpecialization('');
                setLocation('');
                setOnlyAvailable(false);
              }}
            >
              {t('common.clearFilters')}
            </button>
          )}
        </div>

        {!loading && (
          <span className="toolbar__result">
            {t('doctor.resultCount', { count: visible.length, total: doctors.length })}
          </span>
        )}
      </div>

      <ErrorMessage message={error} onRetry={loadDoctors} />

      {loading ? (
        <SkeletonList count={3} />
      ) : doctors.length === 0 ? (
        <EmptyState
          icon="🩺"
          title={t('doctor.noDoctorsTitle')}
          message={t('doctor.noDoctorsText')}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={t('doctor.noMatchesTitle')}
          message={t('doctor.noMatchesText')}
          actionTo="/doctors"
          actionLabel={t('common.clearFilters')}
        />
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