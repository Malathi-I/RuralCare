import { useEffect, useState } from 'react';
import { getInformation } from '../../services/infoService.js';
import {
  createInformation,
  updateInformation,
  deleteInformation,
} from '../../services/adminService.js';
import { LANGUAGES, useLanguage } from '../../context/LanguageContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import SuccessMessage from '../../components/SuccessMessage.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const EMPTY = { title: '', content: '', category: '', language: 'en' };

export default function InfoManagement() {
  const { t } = useLanguage();

  const [items, setItems] = useState([]);
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
      const data = await getInformation();
      setItems(data.items);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (editingId) {
        await updateInformation(editingId, form);
      } else {
        await createInformation(form);
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

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title,
      content: item.content,
      category: item.category,
      language: item.language,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (item) => {
    if (!window.confirm(t('message.confirmDelete'))) return;
    setError('');

    try {
      await deleteInformation(item._id);
      await load();
    } catch (requestError) {
      setError(requestError.userMessage);
    }
  };
return (
    <div className="stack">
      <h1 className="page-title">{t('nav.info')}</h1>

      <ErrorMessage message={error} onRetry={load} />
      <SuccessMessage message={success} />

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <h2 className="section-title">
          {editingId ? t('common.edit') : t('common.add')}
        </h2>

        <label className="field">
          <span className="field__label">{t('common.name')}</span>
          <input
            className="field__input"
            name="title"
            value={form.title}
            onChange={change}
            required
          />
        </label>

        <label className="field">
          <span className="field__label">{t('info.category')}</span>
          <input
            className="field__input"
            name="category"
            value={form.category}
            onChange={change}
            required
          />
        </label>

        <label className="field">
          <span className="field__label">{t('common.save')}</span>
          <textarea
            className="field__input field__input--textarea"
            name="content"
            value={form.content}
            onChange={change}
            rows={5}
            required
          />
        </label>

        <label className="field">
          <span className="field__label">{t('auth.language')}</span>
          <select
            className="field__input"
            name="language"
            value={form.language}
            onChange={change}
          >
            {LANGUAGES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
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
      ) : items.length === 0 ? (
        <EmptyState message={t('info.noInfo')} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t('common.name')}</th>
                <th>{t('info.category')}</th>
                <th>{t('auth.language')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td>
                    {LANGUAGES.find((lang) => lang.code === item.language)?.label ||
                      item.language}
                  </td>
                  <td className="table__actions">
                    <button
                      type="button"
                      className="btn btn--small"
                      onClick={() => startEdit(item)}
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      type="button"
                      className="btn btn--small btn--danger"
                      onClick={() => handleDelete(item)}
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