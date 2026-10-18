import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import LanguageSelector from './LanguageSelector.jsx';

/**
 * Navigation links for the logged in user's role.
 *
 * Each role gets its own set, so a patient never sees doctor or admin links.
 * This is a usability helper only - the backend enforces the real permissions.
 */
export const ROLE_NAV = {
  patient: [
    { to: '/patient', key: 'nav.dashboard', end: true },
    { to: '/patient/appointments', key: 'nav.myAppointments' },
    { to: '/patient/book-appointment', key: 'appointment.book' },
    { to: '/patient/find-doctor', key: 'nav.doctors' },
    { to: '/patient/find-center', key: 'nav.centers' },
    { to: '/patient/health-information', key: 'nav.info' },
    { to: '/patient/profile', key: 'nav.profile' },
  ],
  doctor: [
    { to: '/doctor', key: 'nav.dashboard', end: true },
    { to: '/doctor/today', key: 'appointment.todays' },
    { to: '/doctor/upcoming', key: 'appointment.upcoming' },
    { to: '/doctor/appointments', key: 'appointment.manage' },
    { to: '/doctor/availability', key: 'doctor.availability' },
    { to: '/doctor/profile', key: 'nav.profile' },
  ],
  admin: [
    { to: '/admin', key: 'nav.dashboard', end: true },
    { to: '/admin/users', key: 'nav.users' },
    { to: '/admin/doctors', key: 'nav.doctors' },
    { to: '/admin/centers', key: 'nav.centers' },
    { to: '/admin/appointments', key: 'appointment.title' },
    { to: '/admin/health-information', key: 'nav.info' },
  ],
};

export default function DashboardShell({ greeting, meta, items, children }) {
  const { t } = useLanguage();
  const { user } = useAuth();

  const links = ROLE_NAV[user?.role] || [];

  return (
    <div className="dashboard">
      <div className="dashboard__head">
        <div>
          <h1 className="dashboard__greeting">{greeting}</h1>
          {meta && <p className="dashboard__meta">{meta}</p>}
        </div>

        <span className={`role-chip role-chip--${user?.role}`}>
          {t(`role.${user?.role}`)}
        </span>
      </div>

      <nav className="dash-nav" aria-label={t('nav.dashboard')}>
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `dash-nav__link${isActive ? ' active' : ''}`
            }
          >
            {t(item.key)}
          </NavLink>
        ))}

        <span className="dash-nav__link" style={{ marginLeft: 'auto' }}>
          <LanguageSelector />
        </span>
      </nav>

      <div className="stack">{items}</div>

      <div className="stack">{children}</div>
    </div>
  );
}