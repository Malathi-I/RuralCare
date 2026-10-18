import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LANGUAGES, useLanguage } from '../context/LanguageContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import PasswordField from '../components/PasswordField.jsx';

const EMPTY_FORM = { name: '', email: '', password: '', preferredLanguage: 'en' };

export default function Register() {
  const { t } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Simple client-side check so the user gets instant feedback.
    if (form.password.length < 6) {
      setError(t('auth.passwordHint'));
      return;
    }

    setSubmitting(true);

    try {
      const user = await register(form);
      navigate(`/${user.role}`, { replace: true });
    } catch (requestError) {
      setError(requestError.userMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <h1 className="form-card__title">{t('auth.registerTitle')}</h1>

        <ErrorMessage message={error} />

        <label className="field">
          <span className="field__label">{t('auth.name')}</span>
          <input
            className="field__input"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
            required
            minLength={2}
          />
        </label>

        <label className="field">
          <span className="field__label">{t('auth.email')}</span>
          <input
            className="field__input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </label>

        <PasswordField
          id="register-password"
          name="password"
          value={form.password}
          onChange={handleChange}
          label={t('auth.password')}
          hint={t('auth.passwordHint')}
          autoComplete="new-password"
          required
          minLength={6}
        />

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
          {submitting ? t('common.loading') : t('auth.registerButton')}
        </button>

        <p className="form-card__footer">
          {t('auth.haveAccount')} <Link to="/login">{t('nav.login')}</Link>
        </p>
      </form>
    </div>
  );
}