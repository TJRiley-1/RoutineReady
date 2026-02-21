import { useState, useCallback, useMemo } from 'react'

export const TOUR_STEPS = [
  {
    id: 'screen-size',
    title: 'Set Your Screen Size',
    description:
      'First, let\'s make sure the display fits your screen. We\'ve detected your screen dimensions — click "Apply Detected Size" to use them, or adjust manually in the Display Settings panel.',
    position: 'left',
    opensModal: 'displaySettings',
    scrollTo: null,
    actionLabel: 'Apply Detected Size',
  },
  {
    id: 'display-mode',
    title: 'Choose Display Mode & Transitions',
    description:
      'Now pick how tasks are laid out. "Horizontal" shows a single row, "Multi-Row" stacks them, and "Auto-Pan" focuses on the current task. You can also choose a transition style — progress line or mascot animation.',
    position: 'left',
    opensModal: 'displaySettings',
    scrollTo: null,
    actionLabel: null,
  },
  {
    id: 'tasks',
    title: 'Edit Your Tasks',
    description:
      'This is where you build your daily routine. Add, edit, or delete tasks, adjust durations with the +5/-5 buttons, and resize cards with the sliders. Drag to scroll through the timeline.',
    position: 'top',
    opensModal: null,
    scrollTo: 'edit-tasks-section',
    actionLabel: null,
  },
  {
    id: 'save-templates',
    title: 'Save & Manage Templates',
    description:
      'When you\'re happy with a routine, click "Save Changes" to persist it, or "Save as Template" to create a reusable version. Assign templates to days of the week so the correct routine loads automatically.',
    position: 'top',
    opensModal: null,
    scrollTo: 'weekly-schedule-section',
    actionLabel: null,
  },
  {
    id: 'themes',
    title: 'Personalise Your Theme',
    description:
      'Choose a preset theme or create your own custom look. You can change colours, fonts, card styles, and even add banner images for school branding.',
    position: 'right',
    opensModal: 'themeSelector',
    scrollTo: null,
    actionLabel: null,
  },
  {
    id: 'done',
    title: "You're All Set!",
    description:
      'Your classroom display is ready to go. You can always come back to the admin panel to make changes. If you need this guide again, find "Restart Setup Guide" in User Settings.',
    position: 'center',
    opensModal: null,
    scrollTo: null,
    actionLabel: 'Exit to Display',
  },
]

export function useGuidedTour({
  onOpenDisplaySettings,
  onCloseDisplaySettings,
  onOpenThemeSelector,
  onCloseThemeSelector,
  onExitAdmin,
  onMarkCompleted,
}) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const stepConfig = useMemo(() => TOUR_STEPS[currentStep] || null, [currentStep])
  const totalSteps = TOUR_STEPS.length

  const closeCurrentModal = useCallback((stepIndex) => {
    const step = TOUR_STEPS[stepIndex]
    if (!step) return
    if (step.opensModal === 'displaySettings') onCloseDisplaySettings()
    if (step.opensModal === 'themeSelector') onCloseThemeSelector()
  }, [onCloseDisplaySettings, onCloseThemeSelector])

  const openModalForStep = useCallback((stepIndex) => {
    const step = TOUR_STEPS[stepIndex]
    if (!step) return
    if (step.opensModal === 'displaySettings') onOpenDisplaySettings()
    if (step.opensModal === 'themeSelector') onOpenThemeSelector()
  }, [onOpenDisplaySettings, onOpenThemeSelector])

  const startTour = useCallback(() => {
    setCurrentStep(0)
    setIsActive(true)
    onOpenDisplaySettings()
  }, [onOpenDisplaySettings])

  const nextStep = useCallback(() => {
    if (currentStep >= totalSteps - 1) return
    const nextIdx = currentStep + 1
    const currentConfig = TOUR_STEPS[currentStep]
    const nextConfig = TOUR_STEPS[nextIdx]

    // Close current modal if next step uses a different modal (or none)
    if (currentConfig.opensModal && currentConfig.opensModal !== nextConfig.opensModal) {
      closeCurrentModal(currentStep)
    }

    setCurrentStep(nextIdx)

    // Open next modal if needed (and it's different from current)
    if (nextConfig.opensModal && nextConfig.opensModal !== currentConfig.opensModal) {
      // Small delay to let close animation finish
      setTimeout(() => openModalForStep(nextIdx), 150)
    }
  }, [currentStep, totalSteps, closeCurrentModal, openModalForStep])

  const prevStep = useCallback(() => {
    if (currentStep <= 0) return
    const prevIdx = currentStep - 1
    const currentConfig = TOUR_STEPS[currentStep]
    const prevConfig = TOUR_STEPS[prevIdx]

    if (currentConfig.opensModal && currentConfig.opensModal !== prevConfig.opensModal) {
      closeCurrentModal(currentStep)
    }

    setCurrentStep(prevIdx)

    if (prevConfig.opensModal && prevConfig.opensModal !== currentConfig.opensModal) {
      setTimeout(() => openModalForStep(prevIdx), 150)
    }
  }, [currentStep, closeCurrentModal, openModalForStep])

  const skipTour = useCallback(() => {
    closeCurrentModal(currentStep)
    setIsActive(false)
    setCurrentStep(0)
    onMarkCompleted()
  }, [currentStep, closeCurrentModal, onMarkCompleted])

  return {
    isActive,
    currentStep,
    stepConfig,
    totalSteps,
    startTour,
    skipTour,
    nextStep,
    prevStep,
  }
}
