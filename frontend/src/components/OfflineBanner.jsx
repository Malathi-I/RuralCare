import { useLanguage } from '../context/LanguageContext.jsx';
import { useNetwork } from '../context/NetworkContext.jsx';

/** Shows a clear banner whenever the device loses its connection. */
export default function OfflineBanner() {
  const { t } = useLanguage();
  const { isOnline } = useNetwork();

  if (isOnline) return null;

  return (
    <div className="offline-banner" role="alert">
      <strong>{t('message.offline')}</strong>
      <span>{t('message.offlineHint')}</span>
    </div>
  );
}