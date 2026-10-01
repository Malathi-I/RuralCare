import { useEffect, useState } from 'react';
import { getMyDoctorProfile, updateMyAvailability } from '../../services/doctorService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { WEEKDAYS } from '../../utils/constants.js';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import SuccessMessage from '../../components/SuccessMessage.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

/** Builds one editable row per weekday. */
const buildRows = (availability) =>
  WEEKDAYS.map((day) => {
    const existing = availability?.find((slot) => slot.day === day);

    return {
      day,
      enabled: Boolean(existing),
      startTime: existing?.startTime || '09:00',
      endTime: existing?.endTime || '17:00',
    };
  });

export default function Availability() {
  const { t } = useLanguage();

  const [rows, setRows] = useState([]);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getMyDoctorProfile();
      setRows(buildRows(data.doctor.availability));
      setAvailable(data.doctor.available);
    } catch (requestError) {
      setError(requestError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateRow = (day, patch) => {
    setRows((previous) =>
      previous.map((row) => (row.day === day ? { ...row, ...patch } : row))
    );
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    // Only the ticked days are sent to the server.
    const payload = rows
      .filter((row) => row.enabled)
      .map((row) => ({
        day: row.day,
        startTime: row.startTime,
        endTime: row.endTime,
      }));

    const invalid = payload.some((slot) => slot.startTime >= slot.endTime);
    if (invalid) {
      setError(t('doctor.saveAvailability'));
      return;
    }

    setSubmitting(true);

    try {
      await updateMyAvailability({ availability: payload, available });
      setSuccess(t('message.saved'));
    } catch (requestError) {
      setError(requestError.userMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="stack">
      <h1 className="page-title">{t('doctor.setAvailability')}</h1>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <ErrorMessage message={error} />
        <SuccessMessage message={success} />

        <label className="field field--inline">
          <input
            type="checkbox"
            checked={available}
            onChange={(event) => setAvailable(event.target.checked)}
          />
          <span className="field__label">{t('doctor.available')}</span>
        </label>

        <div className="stack">
          {rows.map((row) => (
            <div className="availability-row" key={row.day}>
              <label className="field field--inline">
                <input
                  type="checkbox"
                  checked={row.enabled}
                  onChange={(event) =>
                    updateRow(row.day, { enabled: event.target.checked })
                  }
                />
                <span className="field__label">{row.day}</span>
              </label>

              {row.enabled && (
                <div className="availability-row__times">
                  <label className="field">
                    <span className="field__label">{t('doctor.startTime')}</span>
                    <input
                      className="field__input"
                      type="time"
                      value={row.startTime}
                      onChange={(event) =>
                        updateRow(row.day, { startTime: event.target.value })
                      }
                    />
                  </label>

                  <label className="field">
                    <span className="field__label">{t('doctor.endTime')}</span>
                    <input
                      className="field__input"
                      type="time"
                      value={row.endTime}
                      onChange={(event) =>
                        updateRow(row.day, { endTime: event.target.value })
                      }
                    />
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn--full" disabled={submitting}>
          {submitting ? t('common.loading') : t('doctor.saveAvailability')}
        </button>
      </form>
    </div>
  );
}