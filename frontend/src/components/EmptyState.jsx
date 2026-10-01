import { useLanguage } from '../context/LanguageContext.jsx';

export default function EmptyState({ message }) {
  const { t } = useLanguage();

  return (
    <div className="empty-state">
      <p>{message || t('message.noResults')}</p>
    </div>
  );
}