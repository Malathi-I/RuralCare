import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';

/**
 * Accessible confirmation dialog used before any destructive action.
 *
 * Replaces window.confirm so the confirmation matches the rest of the design
 * system, is keyboard accessible and can be translated.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = true,
  busy = false,
  onConfirm,
  onCancel,
}) {
  const { t } = useLanguage();
  const confirmRef = useRef(null);

  // Move focus to the confirm button so keyboard users are not stranded.
  useEffect(() => {
    if (open && confirmRef.current) confirmRef.current.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onCancel}
    >
      <div
        className="modal__panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <h2 className="modal__title" id="confirm-dialog-title">
            {title || t('common.confirm')}
          </h2>
        </div>

        <p className="confirm__text">
          {message || t('message.confirmDelete')}
        </p>

        <div className="modal__footer">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel || t('common.cancel')}
          </button>

          <button
            ref={confirmRef}
            type="button"
            className={`btn${danger ? ' btn--danger' : ''}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? t('common.loading') : confirmLabel || t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}