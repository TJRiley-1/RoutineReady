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

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false)

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

  const handleSignOut = async () => {
    if (hasUnsavedChanges) {
      const choice = confirm(
        'You have unsaved changes. Press OK to save before signing out, or Cancel to discard changes.'
      )
      if (choice) {
        try {
          await saveAll()
        } catch {
          alert('Save failed. Please try again.')
          return
        }
      }
    }
    appDataSignOut()
    await signOut()
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
          onExitAdmin={async () => {
            if (hasUnsavedChanges) {
              const choice = confirm('You have unsaved changes. Press OK to save before leaving, or Cancel to discard changes.')
              if (choice) {
                try { await saveAll() } catch { alert('Save failed. Please try again.'); return }
              }
            }
            setIsAdmin(false)
          }}
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
