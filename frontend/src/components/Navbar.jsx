import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import LanguageSelector from './LanguageSelector.jsx';

const PUBLIC_LINKS = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/doctors', key: 'nav.doctors' },
  { to: '/healthcare-centers', key: 'nav.centers' },
  { to: '/health-information', key: 'nav.info' },
];

export default function Navbar() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Each role gets a different dashboard path.
  const dashboardPath = user ? `/${user.role}` : '/login';

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <>
      <a className="skip-link" href="#main-content">
        {t('nav.skipToContent')}
      </a>

      <header className="navbar">
        <div className="navbar__inner">
          <Link to="/" className="navbar__brand" onClick={() => setOpen(false)}>
            <span className="navbar__mark" aria-hidden="true">
              +
            </span>
            RuralCare
          </Link>

          <button
            type="button"
            className="navbar__toggle"
            aria-expanded={open}
            aria-controls="main-navigation"
            onClick={() => setOpen((previous) => !previous)}
          >
            <span className="sr-only">{t('nav.menu')}</span>
            <span aria-hidden="true">{open ? '✕' : '☰'}</span>
          </button>

          <nav
            id="main-navigation"
            className={`navbar__links${open ? ' navbar__links--open' : ''}`}
          >
            {PUBLIC_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className="navbar__link"
                onClick={() => setOpen(false)}
              >
                {t(link.key)}
              </NavLink>
            ))}

            {user && (
              <NavLink
                to={dashboardPath}
                className="navbar__link"
                onClick={() => setOpen(false)}
              >
                {t('nav.dashboard')}
              </NavLink>
            )}

            <LanguageSelector />

            {user ? (
              <>
                <span
                  className={`role-chip role-chip--${user.role}`}
                  style={{ color: '#fff', background: 'rgba(255,255,255,0.18)' }}
                >
                  {t(`role.${user.role}`)}
                </span>

                <button
                  type="button"
                  className="btn btn--small"
                  onClick={handleLogout}
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="navbar__link" onClick={() => setOpen(false)}>
                  {t('nav.login')}
                </NavLink>
                <NavLink
                  to="/register"
                  className="btn btn--small"
                  onClick={() => setOpen(false)}
                >
                  {t('nav.register')}
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}