import { useLanguage } from '../context/LanguageContext.jsx';

export default function SuccessMessage({ message }) {
  const { t } = useLanguage();

  if (!message) return null;

  return (
    <div className="alert alert--success" role="status">
      {message}
    </div>
  );
}