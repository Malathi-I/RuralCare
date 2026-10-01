import { LANGUAGES, useLanguage } from '../context/LanguageContext.jsx';

/** Dropdown that switches the interface language. */
export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label className="language-selector">
      <span className="sr-only">{t('nav.language')}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        aria-label={t('nav.language')}
      >
        {LANGUAGES.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}