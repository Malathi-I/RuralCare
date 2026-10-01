import { useEffect, useState } from 'react';
import { getUsers, updateUserRole, deleteUser } from '../../services/adminService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { ROLES } from '../../utils/constants.js';

export default function UserManagement() {
  const { t } = useLanguage();

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
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      className="field__input field__input--compact"
                      value={user.role}
                      onChange={(event) => handleRoleChange(user, event.target.value)}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--small btn--danger"
                      onClick={() => handleDelete(user)}
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