import { useEffect } from 'react'
import { X } from 'lucide-react'

const typeStyles = {
  success: 'border-l-4 border-brand-success bg-green-50 text-green-800',
  error: 'border-l-4 border-brand-error bg-red-50 text-red-800',
  warning: 'border-l-4 border-brand-accent bg-amber-50 text-amber-800',
  info: 'border-l-4 border-brand-primary bg-brand-primary-bg text-brand-primary-dark',
}

export default function Notification({ message, type = 'info', onDismiss }) {
  useEffect(() => {
    const delay = type === 'error' || type === 'warning' ? 6000 : 4000
    const timer = setTimeout(onDismiss, delay)
    return () => clearTimeout(timer)
  }, [type, onDismiss])

  return (
    <div className={`mx-4 mt-4 p-4 rounded-[6px] flex items-center justify-between ${typeStyles[type] || typeStyles.info}`} role="status">
      <p className="font-semibold text-sm">{message}</p>
      <button onClick={onDismiss} className="ml-4 flex-shrink-0 p-1 hover:opacity-70 transition-opacity" aria-label="Dismiss notification">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
