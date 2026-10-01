import { useEffect, useState } from 'react';
import { getCenters } from '../../services/centerService.js';
import {
  createCenter,
  updateCenter,
  deleteCenter,
} from '../../services/adminService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import SuccessMessage from '../../components/SuccessMessage.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const EMPTY = { name: '', location: '', address: '', phone: '', services: '' };

export default function CenterManagement() {
  const { t } = useLanguage();

  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getCenters();
      setCenters(data.centers);
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

  // The form uses a comma separated string, the API expects an array.
  const toPayload = () => ({
    ...form,
    services: form.services
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (editingId) {
        await updateCenter(editingId, toPayload());
      } else {
        await createCenter(toPayload());
      }

      setSuccess(t('message.saved'));
      setForm(EMPTY);
      setEditingId(null);
      await load();
    } catch (requestError) {
      setError(requestError.userMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (center) => {
    setEditingId(center._id);
    setForm({
      name: center.name,
      location: center.location,
      address: center.address,
      phone: center.phone,
      services: (center.services || []).join(', '),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (center) => {
    if (!window.confirm(t('message.confirmDelete'))) return;
    setError('');

    try {
      await deleteCenter(center._id);
      await load();
    } catch (requestError) {
      setError(requestError.userMessage);
    }
  };
return (
    <div className="stack">
      <h1 className="page-title">{t('nav.centers')}</h1>

      <ErrorMessage message={error} onRetry={load} />
      <SuccessMessage message={success} />

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <h2 className="section-title">
          {editingId ? t('common.edit') : t('common.add')}
        </h2>

        <div className="grid grid--2">
          <label className="field">
            <span className="field__label">{t('common.name')}</span>
            <input
              className="field__input"
              name="name"
              value={form.name}
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

          <label className="field">
            <span className="field__label">{t('center.address')}</span>
            <input
              className="field__input"
              name="address"
              value={form.address}
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
        </div>

        <label className="field">
          <span className="field__label">{t('center.services')}</span>
          <input
            className="field__input"
            name="services"
            value={form.services}
            onChange={change}
            placeholder="OPD, Pharmacy, Lab"
          />
        </label>

        <div className="tag-row">
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? t('common.loading') : t('common.save')}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY);
              }}
            >
              {t('common.cancel')}
            </button>
          )}
        </div>
      </form>
{loading ? (
        <LoadingSpinner />
      ) : centers.length === 0 ? (
        <EmptyState message={t('center.noCenters')} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t('common.name')}</th>
                <th>{t('doctor.location')}</th>
                <th>{t('common.phone')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {centers.map((center) => (
                <tr key={center._id}>
                  <td>{center.name}</td>
                  <td>{center.location}</td>
                  <td>{center.phone}</td>
                  <td className="table__actions">
                    <button
                      type="button"
                      className="btn btn--small"
                      onClick={() => startEdit(center)}
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      type="button"
                      className="btn btn--small btn--danger"
                      onClick={() => handleDelete(center)}
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