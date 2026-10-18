import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import PasswordField from '../components/PasswordField.jsx';

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
      // The returned user comes from the backend, which reads the role from
      // the database. The submitted form never influences it.
      const user = await login(form);

      const dashboardPath = `/${user.role}`;
      const requestedPath = location.state?.from?.pathname;

      // Only return to the page the user was trying to reach when it belongs
      // to their own area. Honouring a saved patient path after an admin login
      // would briefly route the admin into the patient section.
      const canReturn =
        typeof requestedPath === 'string' &&
        (requestedPath === dashboardPath || requestedPath.startsWith(`${dashboardPath}/`));

      navigate(canReturn ? requestedPath : dashboardPath, { replace: true });
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

        <PasswordField
          id="login-password"
          name="password"
          value={form.password}
          onChange={handleChange}
          label={t('auth.password')}
          autoComplete="current-password"
          required
        />

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