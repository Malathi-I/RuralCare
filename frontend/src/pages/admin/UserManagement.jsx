import { useEffect, useState } from 'react';
import {
  getUsers,
  updateUserRole,
  updateUserActive,
  deleteUser,
} from '../../services/adminService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { ROLES } from '../../utils/constants.js';

export default function UserManagement() {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getUsers();
      setUsers(data.users);
    } catch (requestError) {
      setError(requestError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = async (user, role) => {
    if (role === user.role) return;
    setError('');

    try {
      await updateUserRole(user._id, role);
      await load();
    } catch (requestError) {
      setError(requestError.userMessage);
    }
  };

  const handleToggleActive = async (user) => {
    const isActive = user.active !== false;

    // Only deactivation needs confirmation; the backend additionally blocks
    // targeting your own account, and the button is hidden for that row.
    if (isActive && !window.confirm(t('account.deactivateConfirm'))) return;
    setError('');

    try {
      await updateUserActive(user._id, !isActive);
      await load();
    } catch (requestError) {
      setError(requestError.userMessage);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(t('message.confirmDelete'))) return;
    setError('');

    try {
      await deleteUser(user._id);
      await load();
    } catch (requestError) {
      setError(requestError.userMessage);
    }
  };

  return (
    <div className="stack">
      <h1 className="page-title">{t('nav.users')}</h1>

      <ErrorMessage message={error} onRetry={load} />

      {loading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <EmptyState message={t('message.noResults')} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t('common.name')}</th>
                <th>{t('common.email')}</th>
                <th>{t('common.role')}</th>
                <th>{t('common.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                // Older records may predate the flag; treat missing as active.
                const isActive = user.active !== false;
                const isSelf = user._id === currentUser?._id;

                return (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className="field__input field__input--compact"
                        value={user.role}
                        onChange={(event) => handleRoleChange(user, event.target.value)}
                        aria-label={t('common.role')}
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {/* Display label is translated; the submitted value stays the raw role. */}
                            {t(`role.${role}`)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={`chip ${isActive ? 'chip--ok' : 'chip--off'}`}>
                        {isActive ? t('account.active') : t('account.inactive')}
                      </span>
                    </td>
                    <td className="table__actions">
                      {!isSelf && (
                        <button
                          type="button"
                          className="btn btn--small"
                          onClick={() => handleToggleActive(user)}
                        >
                          {isActive ? t('account.deactivate') : t('account.activate')}
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn--small btn--danger"
                        onClick={() => handleDelete(user)}
                      >
                        {t('common.delete')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}