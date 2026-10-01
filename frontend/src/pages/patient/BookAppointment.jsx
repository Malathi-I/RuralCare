import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDoctors } from '../../services/doctorService.js';
import { bookAppointment } from '../../services/appointmentService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import SuccessMessage from '../../components/SuccessMessage.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { buildTimeSlots, dayNameFromDate, todayString } from '../../utils/format.js';

export default function BookAppointment() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    doctor: searchParams.get('doctor') || '',
    appointmentDate: '',
    appointmentTime: '',
  });

  useEffect(() => {
    const loadDoctors = async () => {
      setLoading(true);
      setLoadError('');

      try {
        const data = await getDoctors({ available: 'true' });
        setDoctors(data.doctors);
      } catch (requestError) {
        setLoadError(requestError.userMessage);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor._id === form.doctor),
    [doctors, form.doctor]
  );

  const timeSlots = useMemo(
    () => buildTimeSlots(selectedDoctor?.availability, form.appointmentDate),
    [selectedDoctor, form.appointmentDate]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSuccess('');

    // Changing the doctor or date invalidates the chosen time.
    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === 'doctor' || name === 'appointmentDate'
        ? { appointmentTime: '' }
        : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await bookAppointment({
        doctor: form.doctor,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
      });

      setSuccess(t('appointment.booked'));
      setForm((previous) => ({ ...previous, appointmentTime: '' }));
    } catch (requestError) {
      setError(requestError.userMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="stack">
      <h1 className="page-title">{t('appointment.bookTitle')}</h1>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <ErrorMessage message={loadError || error} />
        <SuccessMessage message={success} />

        <label className="field">
          <span className="field__label">{t('appointment.chooseDoctor')}</span>
          <select
            className="field__input"
            name="doctor"
            value={form.doctor}
            onChange={handleChange}
            required
          >
            <option value="">-- {t('appointment.chooseDoctor')} --</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name} - {doctor.specialization} ({doctor.location})
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">{t('appointment.chooseDate')}</span>
          <input
            className="field__input"
            type="date"
            name="appointmentDate"
            min={todayString()}
            value={form.appointmentDate}
            onChange={handleChange}
            required
          />
        </label>

        <div className="field">
          <span className="field__label">{t('appointment.chooseTime')}</span>

          {timeSlots.length === 0 ? (
            <p className="field__hint">
              {selectedDoctor
                ? t('doctor.availability')
                : t('appointment.chooseDoctor')}
            </p>
          ) : (
            <div className="slot-grid">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`slot${form.appointmentTime === slot ? ' slot--active' : ''}`}
                  onClick={() => {
                    setForm((previous) => ({ ...previous, appointmentTime: slot }));
                    setSuccess('');
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}

          {form.appointmentDate && selectedDoctor && timeSlots.length > 0 && (
            <span className="field__hint">{dayNameFromDate(form.appointmentDate)}</span>
          )}
        </div>

        <button
          type="submit"
          className="btn btn--full"
          disabled={submitting || !form.appointmentTime}
        >
          {submitting ? t('common.loading') : t('appointment.book')}
        </button>
      </form>
    </div>
  );
}