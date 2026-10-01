import { useEffect, useState } from 'react';
import {
  getAdminDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../../services/adminService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { WEEKDAYS } from '../../utils/constants.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import SuccessMessage from '../../components/SuccessMessage.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const EMPTY_DOCTOR = {
  name: '',
  email: '',
  password: '',
  specialization: '',
  phone: '',
  location: '',
  availability: [{ day: 'Monday', startTime: '09:00', endTime: '17:00' }],
};

export default function DoctorManagement() {
  const { t } = useLanguage();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_DOCTOR);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAdminDoctors();
      setDoctors(data.doctors);
    } catch (requestError) {
      setError(requestError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const changeSlot = (index, patch) => {
    setForm((previous) => ({
      ...previous,
      availability: previous.availability.map((slot, position) =>
        position === index ? { ...slot, ...patch } : slot
      ),
    }));
  };

  const addSlot = () => {
    setForm((previous) => ({
      ...previous,
      availability: [
        ...previous.availability,
        { day: 'Monday', startTime: '09:00', endTime: '17:00' },
      ],
    }));
  };

  const removeSlot = (index) => {
    setForm((previous) => ({
      ...previous,
      availability: previous.availability.filter(
        (slot, position) => position !== index
      ),
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await createDoctor(form);
      setSuccess(t('message.created'));
      setForm(EMPTY_DOCTOR);
      await load();
    } catch (requestError) {
      setError(requestError.userMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAvailability = async (doctor) => {
    setError('');

    try {
      await updateDoctor(doctor._id, { available: !doctor.available });
      await load();
    } catch (requestError) {
      setError(requestError.userMessage);
    }
  };

  const handleDelete = async (doctor) => {
    if (!window.confirm(t('message.confirmDelete'))) return;
    setError('');

    try {
      await deleteDoctor(doctor._id);
      await load();
    } catch (requestError) {
      setError(requestError.userMessage);
    }
  };
return (
    <div className="stack">
      <h1 className="page-title">{t('nav.doctors')}</h1>

      <ErrorMessage message={error} onRetry={load} />
      <SuccessMessage message={success} />

      <form className="form-card" onSubmit={handleCreate} noValidate>
        <h2 className="section-title">{t('common.add')}</h2>

        <div className="grid grid--2">
          <label className="field">
            <span className="field__label">{t('auth.name')}</span>
            <input
              className="field__input"
              name="name"
              value={form.name}
              onChange={change}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">{t('common.email')}</span>
            <input
              className="field__input"
              type="email"
              name="email"
              value={form.email}
              onChange={change}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">{t('auth.password')}</span>
            <input
              className="field__input"
              type="password"
              name="password"
              value={form.password}
              onChange={change}
              required
              minLength={6}
            />
          </label>

          <label className="field">
            <span className="field__label">{t('doctor.specialization')}</span>
            <input
              className="field__input"
              name="specialization"
              value={form.specialization}
              onChange={change}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">{t('common.phone')}</span>
            <input
              className="field__input"
              name="phone"
              value={form.phone}
              onChange={change}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">{t('doctor.location')}</span>
            <input
              className="field__input"
              name="location"
              value={form.location}
              onChange={change}
              required
            />
          </label>
        </div>

        <h3 className="section-title">{t('doctor.availability')}</h3>

        {form.availability.map((slot, index) => (
          <div className="availability-row" key={index}>
            <div className="availability-row__times">
              <label className="field">
                <span className="field__label">{t('doctor.day')}</span>
                <select
                  className="field__input"
                  value={slot.day}
                  onChange={(event) =>
                    changeSlot(index, { day: event.target.value })
                  }
                >
                  {WEEKDAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field__label">{t('doctor.startTime')}</span>
                <input
                  className="field__input"
                  type="time"
                  value={slot.startTime}
                  onChange={(event) =>
                    changeSlot(index, { startTime: event.target.value })
                  }
                />
              </label>

              <label className="field">
                <span className="field__label">{t('doctor.endTime')}</span>
                <input
                  className="field__input"
                  type="time"
                  value={slot.endTime}
                  onChange={(event) =>
                    changeSlot(index, { endTime: event.target.value })
                  }
                />
              </label>
            </div>

            <button
              type="button"
              className="btn btn--small btn--danger"
              onClick={() => removeSlot(index)}
            >
              {t('common.delete')}
            </button>
          </div>
        ))}

        <div className="tag-row">
          <button type="button" className="btn btn--ghost" onClick={addSlot}>
            {t('common.add')}
          </button>
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? t('common.loading') : t('message.created')}
          </button>
        </div>
      </form>
{loading ? (
        <LoadingSpinner />
      ) : doctors.length === 0 ? (
        <EmptyState message={t('doctor.noDoctors')} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t('common.name')}</th>
                <th>{t('doctor.specialization')}</th>
                <th>{t('common.email')}</th>
                <th>{t('common.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor._id}>
                  <td>{doctor.name}</td>
                  <td>{doctor.specialization}</td>
                  <td>{doctor.user?.email}</td>
                  <td>
                    <button
                      type="button"
                      className={`chip chip--button ${doctor.available ? 'chip--ok' : 'chip--off'}`}
                      onClick={() => toggleAvailability(doctor)}
                    >
                      {doctor.available
                        ? t('doctor.available')
                        : t('doctor.unavailable')}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--small btn--danger"
                      onClick={() => handleDelete(doctor)}
                    >
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}