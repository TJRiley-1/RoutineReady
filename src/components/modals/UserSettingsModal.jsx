import { useState } from 'react'
import { Edit, Upload, RefreshCw, LogOut, User, KeyRound, Play } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Notification from '../ui/Notification'

export default function UserSettingsModal({
  setupData,
  session,
  onEditSetup,
  onResetSetup,
  onRestoreBackup,
  onRestartGuide,
  onSignOut,
  onClose,
}) {
  const [displayName, setDisplayName] = useState(
    session?.user?.user_metadata?.display_name || ''
  )
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)
  const [resetSending, setResetSending] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [notification, setNotification] = useState(null)

  const userEmail = session?.user?.email || ''

  const handleSaveDisplayName = async () => {
    setNameSaving(true)
    try {
      await supabase.auth.updateUser({ data: { display_name: displayName } })
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 3000)
    } catch (err) {
      setNotification({ message: 'Failed to save display name: ' + err.message, type: 'error' })
    } finally {
      setNameSaving(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!userEmail) return
    setResetSending(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail)
      if (error) throw error
      setResetSent(true)
      setTimeout(() => setResetSent(false), 5000)
    } catch (err) {
      setNotification({ message: 'Failed to send password reset email: ' + err.message, type: 'error' })
    } finally {
      setResetSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="user-settings-title">
      <div className="bg-white rounded-[16px] p-8 w-[480px] shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 id="user-settings-title" className="text-2xl font-bold mb-6 text-brand-text">User Settings</h2>

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onDismiss={() => setNotification(null)}
          />
        )}

        {/* Account Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-brand-text-muted uppercase tracking-wide mb-3">Account</h3>
          <div className="space-y-3 p-4 bg-brand-bg-subtle rounded-[6px]">
            <div>
              <label className="block text-xs font-medium text-brand-text-muted mb-1">Email</label>
              <div className="text-sm text-brand-text bg-gray-100 px-3 py-2 rounded-[6px]">{userEmail}</div>
            </div>
            <div>
              <label htmlFor="display-name" className="block text-xs font-medium text-brand-text-muted mb-1">Display Name</label>
              <div className="flex gap-2">
                <input
                  id="display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="flex-1 px-3 py-2 h-[44px] border-2 border-brand-border rounded-[6px] text-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-pale focus:outline-none"
                />
                <button
                  onClick={handleSaveDisplayName}
                  disabled={nameSaving}
                  className="px-4 min-h-[44px] bg-brand-primary text-white rounded-[6px] hover:bg-brand-primary-dark text-sm font-semibold transition-colors"
                >
                  {nameSaving ? 'Saving...' : nameSaved ? 'Saved!' : 'Save'}
                </button>
              </div>
            </div>
            <button
              onClick={handlePasswordReset}
              disabled={resetSending || resetSent}
              className="w-full flex items-center justify-center gap-2 px-4 min-h-[44px] py-2 bg-brand-bg-subtle text-brand-text border border-brand-border rounded-[6px] hover:bg-gray-200 text-sm font-semibold transition-colors"
            >
              <KeyRound className="w-4 h-4" />
              {resetSending ? 'Sending...' : resetSent ? 'Reset email sent!' : 'Reset Password'}
            </button>
          </div>
        </div>

        {/* Setup Info Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-brand-text-muted uppercase tracking-wide mb-3">Setup Info</h3>
          {setupData.setupComplete && (
            <div className="mb-3 p-4 bg-brand-bg-subtle rounded-[6px]">
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
          <button
            onClick={onEditSetup}
            className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white min-h-[44px] py-3 rounded-[6px] hover:bg-brand-primary-dark transition-colors font-semibold"
          >
            <Edit className="w-5 h-5" />
            Edit Setup Info
          </button>
        </div>

        {/* Data Management Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-brand-text-muted uppercase tracking-wide mb-3">Data Management</h3>
          <div className="space-y-3">
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
            {onRestartGuide && (
              <button
                onClick={onRestartGuide}
                className="w-full flex items-center justify-center gap-2 bg-brand-accent text-brand-primary-dark min-h-[44px] py-3 rounded-[6px] hover:bg-brand-accent-light transition-colors font-semibold"
              >
                <Play className="w-5 h-5" />
                Restart Setup Guide
              </button>
            )}
            <button
              onClick={onResetSetup}
              className="w-full flex items-center justify-center gap-2 bg-brand-error text-white min-h-[44px] py-3 rounded-[6px] hover:bg-red-600 transition-colors font-semibold"
            >
              <RefreshCw className="w-5 h-5" />
              Reset to Default
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <div className="pt-4 border-t border-brand-border space-y-3">
          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 bg-brand-bg-subtle text-brand-text border border-brand-border min-h-[44px] py-3 rounded-[6px] hover:bg-gray-200 transition-colors font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
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
