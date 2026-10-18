import { useId, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import Icon from './Icon.jsx';

/**
 * Password input with a show / hide toggle.
 *
 * Design notes:
 *  - The value is masked by default and the toggle only changes the `type`
 *    attribute, so the value, the validation rules and the form submit payload
 *    are all untouched.
 *  - The password is never logged, stored or sent anywhere except the existing
 *    auth request.
 *  - The toggle is a real <button type="button">, so it is reachable by
 *    keyboard, activates with Enter/Space, and never submits the form.
 *  - `aria-pressed` communicates the on/off state to assistive technology and
 *    `aria-label` changes with the state so the announced name stays accurate.
 */
export default function PasswordField({
  id,
  name,
  value,
  onChange,
  label,
  hint,
  autoComplete,
  required = false,
  minLength,
  disabled = false,
}) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  // Fall back to a generated id so the field works even if a caller forgets one.
  const generatedId = useId();
  const inputId = id || generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;

  const toggleLabel = visible ? t('auth.hidePassword') : t('auth.showPassword');

  return (
    <div className="field">
      <label className="field__label" htmlFor={inputId}>
        {label}
      </label>

      <div className="field__password">
        <input
          id={inputId}
          className="field__input field__input--password"
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          disabled={disabled}
          aria-describedby={hintId}
        />

        <button
          type="button"
          className="field__toggle"
          onClick={() => setVisible((previous) => !previous)}
          aria-label={toggleLabel}
          aria-pressed={visible}
          /* Keeps the caret in the password after toggling. */
          onMouseDown={(event) => event.preventDefault()}
          disabled={disabled}
        >
          <Icon name={visible ? 'eyeOff' : 'eye'} size={20} />
        </button>
      </div>

      {hint && (
        <span className="field__hint" id={hintId}>
          {hint}
        </span>
      )}
    </div>
  );
}
