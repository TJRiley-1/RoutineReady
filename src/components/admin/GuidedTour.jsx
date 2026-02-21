import { ChevronLeft, ChevronRight, X, Monitor } from 'lucide-react'

const POSITION_CLASSES = {
  left: 'left-8 top-1/2 -translate-y-1/2',
  right: 'right-8 top-1/2 -translate-y-1/2',
  top: 'top-24 left-1/2 -translate-x-1/2',
  center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
}

export default function GuidedTour({
  stepConfig,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onAction,
  detectedScreen,
}) {
  if (!stepConfig) return null

  const progress = ((currentStep + 1) / totalSteps) * 100
  const isFirst = currentStep === 0
  const isLast = currentStep === totalSteps - 1
  const showBackdrop = !stepConfig.opensModal

  return (
    <>
      {/* Semi-transparent backdrop — only when no modal is open for this step */}
      {showBackdrop && (
        <div className="fixed inset-0 bg-black/30 z-[54]" />
      )}

      {/* Positioned card */}
      <div
        className={`fixed z-[55] w-[420px] ${POSITION_CLASSES[stepConfig.position] || POSITION_CLASSES.center}`}
      >
        <div className="bg-white rounded-[16px] border-2 border-brand-primary shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-5 pb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-brand-primary">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <button
                onClick={onSkip}
                className="text-sm text-brand-text-muted hover:text-brand-text transition-colors font-medium"
              >
                Skip Guide
              </button>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-4">
            <h3 className="text-xl font-bold text-brand-text mb-2">{stepConfig.title}</h3>
            <p className="text-sm text-brand-text-muted leading-relaxed">{stepConfig.description}</p>

            {/* Detected screen info for step 1 */}
            {stepConfig.id === 'screen-size' && detectedScreen && (
              <div className="mt-3 p-3 bg-brand-primary-bg rounded-[8px] border border-brand-primary-pale">
                <div className="flex items-center gap-2 text-sm text-brand-primary-dark">
                  <Monitor className="w-4 h-4" />
                  <span className="font-medium">
                    Detected: {detectedScreen.width} x {detectedScreen.height}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 pb-5 space-y-3">
            {/* Optional action button */}
            {stepConfig.actionLabel && (
              <button
                onClick={onAction}
                className="w-full flex items-center justify-center gap-2 bg-brand-accent text-brand-primary-dark min-h-[44px] py-3 rounded-[8px] hover:bg-brand-accent-light transition-colors font-semibold"
              >
                {stepConfig.actionLabel}
              </button>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3">
              {!isFirst && (
                <button
                  onClick={onPrev}
                  className="flex items-center justify-center gap-1 px-4 min-h-[44px] py-2 bg-brand-bg-subtle text-brand-text border border-brand-border rounded-[8px] hover:bg-gray-200 transition-colors font-semibold text-sm flex-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button
                onClick={isLast ? onSkip : onNext}
                className="flex items-center justify-center gap-1 px-4 min-h-[44px] py-2 bg-brand-primary text-white rounded-[8px] hover:bg-brand-primary-dark transition-colors font-semibold text-sm flex-1"
              >
                {isLast ? 'Finish' : 'Next'}
                {!isLast && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
