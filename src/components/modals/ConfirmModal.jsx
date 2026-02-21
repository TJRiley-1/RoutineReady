export default function ConfirmModal({
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  confirmStyle = 'primary',
  onConfirm,
  onCancel,
}) {
  const confirmClasses =
    confirmStyle === 'danger'
      ? 'bg-brand-error text-white hover:bg-red-600'
      : 'bg-brand-primary text-white hover:bg-brand-primary-dark'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div className="bg-white rounded-[16px] shadow-lg max-w-md w-full">
        <div className="p-6">
          <h2 id="confirm-modal-title" className="text-xl font-bold text-brand-text mb-3">{title}</h2>
          <p className="text-brand-text-muted whitespace-pre-line">{message}</p>
        </div>
        <div className="flex gap-3 justify-end p-6 pt-0">
          <button
            onClick={onCancel}
            className="px-6 min-h-[44px] py-3 bg-brand-bg-subtle text-brand-text border border-brand-border rounded-[6px] hover:bg-gray-200 transition-colors font-semibold"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 min-h-[44px] py-3 rounded-[6px] transition-colors font-semibold ${confirmClasses}`}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
