import { Edit, Upload, RefreshCw } from 'lucide-react'

export default function SetupInfoModal({
  setupData,
  onEditSetup,
  onResetSetup,
  onRestoreBackup,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-96 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Setup Information</h2>

        {setupData.setupComplete && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium text-gray-700">School:</span>{' '}
                <span className="text-gray-600">{setupData.schoolName}</span>
              </p>
              <p>
                <span className="font-medium text-gray-700">Class:</span>{' '}
                <span className="text-gray-600">{setupData.className}</span>
              </p>
              <p>
                <span className="font-medium text-gray-700">Teacher:</span>{' '}
                <span className="text-gray-600">{setupData.teacherName}</span>
              </p>
              {setupData.deviceName && (
                <p>
                  <span className="font-medium text-gray-700">Device:</span>{' '}
                  <span className="text-gray-600">{setupData.deviceName}</span>
                </p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={onEditSetup}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            <Edit className="w-5 h-5" />
            Edit Setup Info
          </button>

          <label className="w-full flex items-center justify-center gap-2 bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition-colors font-semibold cursor-pointer">
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
            className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold"
          >
            <RefreshCw className="w-5 h-5" />
            Reset to Default
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
