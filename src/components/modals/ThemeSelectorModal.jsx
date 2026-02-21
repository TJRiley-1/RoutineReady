import { useState } from 'react'
import { X, Check, Edit, Trash2, Plus } from 'lucide-react'
import { presetThemes } from '../../data/presetThemes'
import ConfirmModal from './ConfirmModal'

export default function ThemeSelectorModal({
  currentTheme,
  customThemes,
  setCurrentTheme,
  setCustomThemes,
  onCreateCustom,
  onEditCustom,
  onClose,
}) {
  const [confirmState, setConfirmState] = useState(null)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8" role="dialog" aria-modal="true" aria-labelledby="theme-selector-title">
      <div className="bg-white rounded-[16px] p-8 w-full max-w-5xl shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="theme-selector-title" className="text-3xl font-bold text-brand-text">Choose a Theme</h2>
          <button onClick={onClose} className="text-brand-text-muted hover:text-brand-text" aria-label="Close theme selector">
            <X className="w-8 h-8" />
          </button>
        </div>

        <h3 className="text-xl font-semibold text-brand-text mb-4">Preset Themes</h3>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Object.values(presetThemes).map((theme) => (
            <div
              key={theme.id}
              onClick={() => {
                setCurrentTheme(theme.id)
                onClose()
              }}
              className={`relative cursor-pointer border-4 rounded-[12px] p-4 transition-all hover:shadow-xl ${
                currentTheme === theme.id ? 'border-brand-primary' : 'border-brand-border'
              }`}
            >
              {currentTheme === theme.id && (
                <div className="absolute top-2 right-2 bg-brand-primary text-white rounded-full p-1">
                  <Check className="w-5 h-5" />
                </div>
              )}
              <div className="text-4xl mb-2 text-center">{theme.emoji}</div>
              <div className="text-lg font-bold text-center mb-3">{theme.name}</div>
              <div
                className="h-20 rounded-[6px] mb-3"
                style={{
                  background: theme.bgGradientVia
                    ? `linear-gradient(to right, ${theme.bgGradientFrom}, ${theme.bgGradientVia}, ${theme.bgGradientTo})`
                    : `linear-gradient(to right, ${theme.bgGradientFrom}, ${theme.bgGradientTo})`,
                }}
              ></div>
              <div
                className={`${theme.cardRounded} p-3 text-center text-sm font-semibold`}
                style={{
                  backgroundColor: theme.cardBgColor,
                  border: `${theme.cardBorderWidth} solid ${theme.cardBorderColor}`,
                  fontWeight: theme.fontWeight,
                  textTransform: theme.fontTransform,
                }}
              >
                Sample Task
              </div>
            </div>
          ))}
        </div>

        {customThemes.length > 0 && (
          <>
            <h3 className="text-xl font-semibold text-brand-text mb-4">Custom Themes</h3>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {customThemes.map((theme) => (
                <div
                  key={theme.id}
                  className={`relative border-4 rounded-[12px] p-4 transition-all ${
                    currentTheme === theme.id ? 'border-brand-primary' : 'border-brand-border'
                  }`}
                >
                  {currentTheme === theme.id && (
                    <div className="absolute top-2 right-2 bg-brand-primary text-white rounded-full p-1">
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-4xl">{theme.emoji}</div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditCustom(theme)
                        }}
                        className="p-2 text-brand-primary hover:bg-brand-primary-bg rounded-[6px] cursor-pointer"
                        aria-label={`Edit ${theme.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmState({
                            title: 'Delete Theme',
                            message: `Delete "${theme.name}"?`,
                            confirmLabel: 'Delete',
                            confirmStyle: 'danger',
                            onConfirm: () => {
                              setConfirmState(null)
                              setCustomThemes(customThemes.filter((t) => t.id !== theme.id))
                              if (currentTheme === theme.id) {
                                setCurrentTheme('routine-ready')
                              }
                            },
                          })
                        }}
                        className="p-2 text-brand-error hover:bg-red-50 rounded-[6px] cursor-pointer"
                        aria-label={`Delete ${theme.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      setCurrentTheme(theme.id)
                      onClose()
                    }}
                    className="cursor-pointer"
                  >
                    <div className="text-lg font-bold text-center mb-3">
                      {theme.name}
                      <span className="ml-2 text-xs bg-brand-primary-bg text-brand-primary-dark px-2 py-1 rounded">
                        custom
                      </span>
                    </div>
                    <div
                      className="h-20 rounded-[6px] mb-3"
                      style={{
                        background: theme.bgGradientVia
                          ? `linear-gradient(to right, ${theme.bgGradientFrom}, ${theme.bgGradientVia}, ${theme.bgGradientTo})`
                          : `linear-gradient(to right, ${theme.bgGradientFrom}, ${theme.bgGradientTo})`,
                      }}
                    ></div>
                    <div
                      className={`${theme.cardRounded} p-3 text-center text-sm font-semibold`}
                      style={{
                        backgroundColor: theme.cardBgColor,
                        border: `${theme.cardBorderWidth} solid ${theme.cardBorderColor}`,
                        fontWeight: theme.fontWeight,
                        textTransform: theme.fontTransform,
                      }}
                    >
                      Sample Task
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <button
          onClick={onCreateCustom}
          className="w-full min-h-[44px] py-4 bg-brand-primary text-white rounded-[6px] hover:bg-brand-primary-dark font-bold text-lg"
        >
          <Plus className="w-6 h-6 inline mr-2" />
          Create Custom Theme
        </button>
      </div>

      {confirmState && (
        <ConfirmModal
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          confirmStyle={confirmState.confirmStyle}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  )
}
