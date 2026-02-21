import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useAppData } from './hooks/useAppData'
import { useTimelineProgress } from './hooks/useTimelineProgress'
import { useWeeklySchedule } from './hooks/useWeeklySchedule'
import { getActiveTheme } from './lib/themeUtils'
import { defaultSetupData } from './data/defaults'
import AuthGate from './components/auth/AuthGate'
import SetupWizard from './components/setup/SetupWizard'
import DisplayView from './components/display/DisplayView'
import AdminPanel from './components/admin/AdminPanel'
import ConfirmModal from './components/modals/ConfirmModal'
import Notification from './components/ui/Notification'

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [appConfirm, setAppConfirm] = useState(null)

  const { session, signOut } = useAuth()

  const {
    dataLoaded,
    showSetupWizard,
    setShowSetupWizard,
    setupStep,
    setSetupStep,
    timelineConfig,
    templates,
    setupData,
    setSetupData,
    displaySettings,
    currentTheme,
    customThemes,
    weeklySchedule,
    activeTemplateId,
    setActiveTemplateId,
    todaysTemplateName,
    setTodaysTemplateName,
    hasUnsavedChanges,
    isSaving,
    notification,
    setNotification,
    pendingConfirm,
    setPendingConfirm,
    saveAll,
    updateDisplaySettings,
    updateCurrentTheme,
    updateTimelineConfig,
    updateTemplates,
    updateWeeklySchedule,
    updateCustomThemes,
    handleRestoreBackup,
    handleCompleteSetup,
    handleSkipSetup,
    handleResetSetup,
    handleSignOut: appDataSignOut,
  } = useAppData(session)

  // Timeline progress
  const { currentTime, currentTaskIndex, elapsedInTask } = useTimelineProgress(timelineConfig)

  // Weekly schedule auto-load
  useWeeklySchedule({
    weeklySchedule,
    templates,
    isAdmin,
    setTimelineConfig: updateTimelineConfig,
    setActiveTemplateId,
    setTodaysTemplateName,
  })

  const handleEditSetup = () => {
    setSetupStep(2)
    setShowSetupWizard(true)
    setIsAdmin(false)
  }

  const handleResetSetupAndReturn = async () => {
    await handleResetSetup()
    setIsAdmin(false)
  }

  const handleSignOut = () => {
    if (hasUnsavedChanges) {
      setAppConfirm({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Press Save to save before signing out, or Discard to sign out without saving.',
        confirmLabel: 'Save & Sign Out',
        onConfirm: async () => {
          setAppConfirm(null)
          await saveAll()
          appDataSignOut()
          await signOut()
        },
      })
    } else {
      appDataSignOut()
      signOut()
    }
  }

  const handleExitAdmin = () => {
    if (hasUnsavedChanges) {
      setAppConfirm({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Press Save to save before leaving, or Discard to leave without saving.',
        confirmLabel: 'Save & Exit',
        onConfirm: async () => {
          setAppConfirm(null)
          await saveAll()
          setIsAdmin(false)
        },
      })
    } else {
      setIsAdmin(false)
    }
  }

  const theme = getActiveTheme(currentTheme, customThemes)

  // Show loading while fetching data from Supabase
  if (session && !dataLoaded) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center">
        <div className="text-white text-xl font-semibold">Loading your routines...</div>
      </div>
    )
  }

  return (
    <AuthGate>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onDismiss={() => setNotification(null)}
        />
      )}

      {pendingConfirm && (
        <ConfirmModal
          title={pendingConfirm.title}
          message={pendingConfirm.message}
          confirmLabel={pendingConfirm.confirmLabel}
          confirmStyle={pendingConfirm.confirmStyle}
          onConfirm={pendingConfirm.onConfirm}
          onCancel={() => setPendingConfirm(null)}
        />
      )}

      {appConfirm && (
        <ConfirmModal
          title={appConfirm.title}
          message={appConfirm.message}
          confirmLabel={appConfirm.confirmLabel}
          confirmStyle={appConfirm.confirmStyle}
          onConfirm={appConfirm.onConfirm}
          onCancel={() => {
            setAppConfirm(null)
            // For sign-out: discard and proceed; for exit-admin: just close
            if (appConfirm.title === 'Unsaved Changes') {
              // The user chose to discard — perform the action without saving
              if (appConfirm.confirmLabel === 'Save & Sign Out') {
                appDataSignOut()
                signOut()
              } else {
                setIsAdmin(false)
              }
            }
          }}
        />
      )}

      {!isAdmin && showSetupWizard ? (
        <SetupWizard
          setupStep={setupStep}
          setSetupStep={setSetupStep}
          setupData={setupData || defaultSetupData}
          setSetupData={setSetupData}
          onComplete={handleCompleteSetup}
          onSkip={handleSkipSetup}
        />
      ) : isAdmin ? (
        <AdminPanel
          timelineConfig={timelineConfig}
          setTimelineConfig={updateTimelineConfig}
          templates={templates}
          setTemplates={updateTemplates}
          displaySettings={displaySettings}
          setDisplaySettings={updateDisplaySettings}
          weeklySchedule={weeklySchedule}
          setWeeklySchedule={updateWeeklySchedule}
          setupData={setupData || defaultSetupData}
          session={session}
          currentTheme={currentTheme}
          setCurrentTheme={updateCurrentTheme}
          customThemes={customThemes}
          setCustomThemes={updateCustomThemes}
          activeTemplateId={activeTemplateId}
          setActiveTemplateId={setActiveTemplateId}
          todaysTemplateName={todaysTemplateName}
          setTodaysTemplateName={setTodaysTemplateName}
          currentTaskIndex={currentTaskIndex}
          elapsedInTask={elapsedInTask}
          currentTime={currentTime}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          onSave={saveAll}
          onExitAdmin={handleExitAdmin}
          onEditSetup={handleEditSetup}
          onResetSetup={handleResetSetupAndReturn}
          onRestoreBackup={handleRestoreBackup}
          onSignOut={handleSignOut}
        />
      ) : (
        <DisplayView
          timelineConfig={timelineConfig}
          displaySettings={displaySettings}
          theme={theme}
          currentTaskIndex={currentTaskIndex}
          elapsedInTask={elapsedInTask}
          currentTime={currentTime}
          todaysTemplateName={todaysTemplateName}
          onEnterAdmin={() => setIsAdmin(true)}
        />
      )}
    </AuthGate>
  )
}
