import { Edit, Upload, RefreshCw } from 'lucide-react'

export default function SetupInfoModal({
  setupData,
  onEditSetup,
  onResetSetup,
  onRestoreBackup,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="setup-info-title">
      <div className="bg-white rounded-[16px] p-8 w-96 shadow-lg">
        <h2 id="setup-info-title" className="text-2xl font-bold mb-6 text-brand-text">Setup Information</h2>

        {setupData.setupComplete && (
          <div className="mb-6 p-4 bg-brand-bg-subtle rounded-[6px]">
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium text-brand-text">School:</span>{' '}
                <span className="text-brand-text-muted">{setupData.schoolName}</span>
              </p>
              <p>
                <span className="font-medium text-brand-text">Class:</span>{' '}
                <span className="text-brand-text-muted">{setupData.className}</span>
              </p>
              <p>
                <span className="font-medium text-brand-text">Teacher:</span>{' '}
                <span className="text-brand-text-muted">{setupData.teacherName}</span>
              </p>
              {setupData.deviceName && (
                <p>
                  <span className="font-medium text-brand-text">Device:</span>{' '}
                  <span className="text-brand-text-muted">{setupData.deviceName}</span>
                </p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={onEditSetup}
            className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white min-h-[44px] py-3 rounded-[6px] hover:bg-brand-primary-dark transition-colors font-semibold"
          >
            <Edit className="w-5 h-5" />
            Edit Setup Info
          </button>

          <label className="w-full flex items-center justify-center gap-2 bg-brand-accent text-brand-primary-dark min-h-[44px] py-3 rounded-[6px] hover:bg-brand-accent-light transition-colors font-semibold cursor-pointer">
            <Upload className="w-5 h-5" />
            Restore from Backup
            <input
              type="file"
              accept=".json"
              onChange={onRestoreBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={onResetSetup}
            className="w-full flex items-center justify-center gap-2 bg-brand-error text-white min-h-[44px] py-3 rounded-[6px] hover:bg-red-600 transition-colors font-semibold"
          >
            <RefreshCw className="w-5 h-5" />
            Reset to Default
          </button>
          <button
            onClick={onClose}
            className="w-full bg-brand-bg-subtle text-brand-text border border-brand-border min-h-[44px] py-3 rounded-[6px] hover:bg-gray-200 transition-colors font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
