import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function Login() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await login(form);
      // Send the user back to the page they tried to open, or their dashboard.
      const target = location.state?.from?.pathname || `/${user.role}`;
      navigate(target, { replace: true });
    } catch (requestError) {
      setError(requestError.userMessage || t('auth.invalidCredentials'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <h1 className="form-card__title">{t('auth.loginTitle')}</h1>

        <ErrorMessage message={error} />

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

        <label className="field">
          <span className="field__label">{t('auth.password')}</span>
          <input
            className="field__input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" className="btn btn--full" disabled={submitting}>
          {submitting ? t('common.loading') : t('auth.loginButton')}
        </button>

        <p className="form-card__footer">
          {t('auth.noAccount')} <Link to="/register">{t('nav.register')}</Link>
        </p>
      </form>
    </div>
  );
}