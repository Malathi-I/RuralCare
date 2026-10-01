import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { LANGUAGES, useLanguage } from '../../context/LanguageContext.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import SuccessMessage from '../../components/SuccessMessage.jsx';

export default function Profile() {
  const { t } = useLanguage();
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    preferredLanguage: user?.preferredLanguage || 'en',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // Role and email are not part of the form and cannot be changed here.
      await updateProfile(form);
      setSuccess(t('message.saved'));
    } catch (requestError) {
      setError(requestError.userMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="stack">
      <h1 className="page-title">{t('nav.profile')}</h1>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <ErrorMessage message={error} />
        <SuccessMessage message={success} />

        <label className="field">
          <span className="field__label">{t('auth.name')}</span>
          <input
            className="field__input"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            minLength={2}
          />
        </label>

        <label className="field">
          <span className="field__label">{t('common.email')}</span>
          <input className="field__input" type="email" value={user?.email} disabled />
        </label>

        <label className="field">
          <span className="field__label">{t('common.role')}</span>
          <input className="field__input" type="text" value={user?.role} disabled />
        </label>

        <label className="field">
          <span className="field__label">{t('auth.language')}</span>
          <select
            className="field__input"
            name="preferredLanguage"
            value={form.preferredLanguage}
            onChange={handleChange}
          >
            {LANGUAGES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className="btn btn--full" disabled={submitting}>
          {submitting ? t('common.loading') : t('common.save')}
        </button>
      </form>
    </div>
  );
}