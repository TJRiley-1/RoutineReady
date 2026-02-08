import { X } from 'lucide-react'
import { presetThemes } from '../../data/presetThemes'
import { getFontStyle } from '../../lib/themeUtils'

export default function ThemeEditorModal({
  editingTheme,
  setEditingTheme,
  customThemes,
  setCustomThemes,
  setCurrentTheme,
  onClose,
  onBackToSelector,
}) {
  const handleSave = () => {
    if (!editingTheme.name.trim()) {
      alert('Please enter a theme name')
      return
    }
    const existingIndex = customThemes.findIndex((t) => t.id === editingTheme.id)
    if (existingIndex >= 0) {
      const updated = [...customThemes]
      updated[existingIndex] = editingTheme
      setCustomThemes(updated)
    } else {
      setCustomThemes([...customThemes, editingTheme])
    }
    setCurrentTheme(editingTheme.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[95vh] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-3xl font-bold text-gray-800">Custom Theme Editor</h2>
          <button onClick={onBackToSelector} className="text-gray-500 hover:text-gray-700">
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Controls */}
          <div className="w-1/2 overflow-y-auto p-6 border-r">
            {/* Theme Name */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Theme Name</label>
              <input
                type="text"
                value={editingTheme.name}
                onChange={(e) => setEditingTheme({ ...editingTheme, name: e.target.value })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-indigo-500 focus:outline-none"
                placeholder="My Custom Theme"
              />
            </div>

            {/* Theme Emoji */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Theme Emoji</label>
              <input
                type="text"
                value={editingTheme.emoji}
                onChange={(e) => setEditingTheme({ ...editingTheme, emoji: e.target.value })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-4xl text-center focus:border-indigo-500 focus:outline-none"
                placeholder="🎨"
                inputMode="text"
              />
              <p className="text-xs text-gray-500 mt-1">
                Click to select or paste an emoji (Windows: Win+. | Mac: Cmd+Ctrl+Space)
              </p>
            </div>

            {/* Base Theme Template */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Start from Preset
              </label>
              <select
                onChange={(e) => {
                  const baseTheme = presetThemes[e.target.value]
                  if (baseTheme) {
                    setEditingTheme({
                      ...baseTheme,
                      id: editingTheme.id,
                      name: editingTheme.name,
                      emoji: editingTheme.emoji,
                    })
                  }
                }}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Choose a preset to copy...</option>
                {Object.values(presetThemes).map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.emoji} {theme.name}
                  </option>
                ))}
              </select>
            </div>

            <hr className="my-6" />

            {/* Background Gradient */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Background Gradient</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Color
                  </label>
                  <input
                    type="color"
                    value={editingTheme.bgGradientFrom}
                    onChange={(e) =>
                      setEditingTheme({ ...editingTheme, bgGradientFrom: e.target.value })
                    }
                    className="w-full h-12 rounded border-2 border-gray-300 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Color</label>
                  <input
                    type="color"
                    value={editingTheme.bgGradientTo}
                    onChange={(e) =>
                      setEditingTheme({ ...editingTheme, bgGradientTo: e.target.value })
                    }
                    className="w-full h-12 rounded border-2 border-gray-300 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Task Card Styling */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Task Card Design</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Corner Style
                </label>
                <select
                  value={editingTheme.cardRounded}
                  onChange={(e) =>
                    setEditingTheme({ ...editingTheme, cardRounded: e.target.value })
                  }
                  className="w-full p-2 border-2 border-gray-300 rounded-lg"
                >
                  <option value="rounded-3xl">Extra Rounded</option>
                  <option value="rounded-2xl">Very Rounded</option>
                  <option value="rounded-xl">Rounded</option>
                  <option value="rounded-lg">Slightly Rounded</option>
                  <option value="rounded-md">Minimal Rounded</option>
                  <option value="rounded-sm">Sharp Corners</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Border Color
                </label>
                <input
                  type="color"
                  value={editingTheme.cardBorderColor}
                  onChange={(e) =>
                    setEditingTheme({ ...editingTheme, cardBorderColor: e.target.value })
                  }
                  className="w-full h-12 rounded border-2 border-gray-300 cursor-pointer"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Border Width: {editingTheme.cardBorderWidth}
                </label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="1"
                  value={parseInt(editingTheme.cardBorderWidth)}
                  onChange={(e) =>
                    setEditingTheme({ ...editingTheme, cardBorderWidth: `${e.target.value}px` })
                  }
                  className="w-full"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Background
                </label>
                <input
                  type="color"
                  value={editingTheme.cardBgColor}
                  onChange={(e) =>
                    setEditingTheme({ ...editingTheme, cardBgColor: e.target.value })
                  }
                  className="w-full h-12 rounded border-2 border-gray-300 cursor-pointer"
                />
              </div>
            </div>

            {/* Font Style */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Font Style</h3>
              <select
                value={`${editingTheme.fontWeight}-${editingTheme.fontTransform}-${editingTheme.fontFamily || 'sans-serif'}`}
                onChange={(e) => {
                  const parts = e.target.value.split('-')
                  const weight = parts[0]
                  const transform = parts[1]
                  const family = parts.slice(2).join('-')
                  setEditingTheme({
                    ...editingTheme,
                    fontWeight: weight,
                    fontTransform: transform,
                    fontFamily: family,
                  })
                }}
                className="w-full p-2 border-2 border-gray-300 rounded-lg"
              >
                <option value="300-none-sans-serif">Light</option>
                <option value="400-none-sans-serif">Regular</option>
                <option value="500-none-sans-serif">Medium</option>
                <option value="700-none-sans-serif">Bold</option>
                <option value="800-none-sans-serif">Extra Bold</option>
                <option value="800-uppercase-sans-serif">Comic (Uppercase & Bold)</option>
                <option value="100-none-twinkl-looped">Twinkl Cursive Looped - Thin</option>
                <option value="300-none-twinkl-looped">Twinkl Cursive Looped - Light</option>
                <option value="400-none-twinkl-looped">Twinkl Cursive Looped - Regular</option>
                <option value="600-none-twinkl-looped">Twinkl Cursive Looped - Semibold</option>
                <option value="700-none-twinkl-looped">Twinkl Cursive Looped - Bold</option>
                <option value="100-none-twinkl-unlooped">Twinkl Cursive Unlooped - Thin</option>
                <option value="300-none-twinkl-unlooped">Twinkl Cursive Unlooped - Light</option>
                <option value="400-none-twinkl-unlooped">Twinkl Cursive Unlooped - Regular</option>
                <option value="600-none-twinkl-unlooped">
                  Twinkl Cursive Unlooped - Semibold
                </option>
                <option value="700-none-twinkl-unlooped">Twinkl Cursive Unlooped - Bold</option>
                <option value="100-none-twinkl-precursive">Twinkl Precursive - Thin</option>
                <option value="300-none-twinkl-precursive">Twinkl Precursive - Light</option>
                <option value="400-none-twinkl-precursive">Twinkl Precursive - Regular</option>
                <option value="600-none-twinkl-precursive">Twinkl Precursive - Semibold</option>
                <option value="700-none-twinkl-precursive">Twinkl Precursive - Bold</option>
              </select>
            </div>

            {/* Current Task Highlight */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Current Task Highlight</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Glow Color</label>
                <input
                  type="color"
                  value={editingTheme.currentGlowColor}
                  onChange={(e) =>
                    setEditingTheme({ ...editingTheme, currentGlowColor: e.target.value })
                  }
                  className="w-full h-12 rounded border-2 border-gray-300 cursor-pointer"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Overlay
                </label>
                <input
                  type="color"
                  value={editingTheme.currentBgOverlay.match(/#[0-9a-f]{6}/i)?.[0] || '#ffffff'}
                  onChange={(e) => {
                    const opacity =
                      editingTheme.currentBgOverlay.match(/[\d.]+\)$/)?.[0].replace(')', '') ||
                      '0.5'
                    setEditingTheme({
                      ...editingTheme,
                      currentBgOverlay: `rgba(${parseInt(e.target.value.slice(1, 3), 16)}, ${parseInt(e.target.value.slice(3, 5), 16)}, ${parseInt(e.target.value.slice(5, 7), 16)}, ${opacity})`,
                    })
                  }}
                  className="w-full h-12 rounded border-2 border-gray-300 cursor-pointer"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingTheme.currentBorderEnhance || false}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        currentBorderEnhance: e.target.checked,
                      })
                    }
                    className="mr-2 w-5 h-5"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Enhance Border on Current Task
                  </span>
                </label>
              </div>
            </div>

            {/* Progress Line Colors */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Time Progress Colors</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Past/Done</label>
                  <input
                    type="color"
                    value={editingTheme.tickPastColor}
                    onChange={(e) =>
                      setEditingTheme({ ...editingTheme, tickPastColor: e.target.value })
                    }
                    className="w-full h-10 rounded border-2 border-gray-300 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Current/Active
                  </label>
                  <input
                    type="color"
                    value={editingTheme.tickCurrentColor}
                    onChange={(e) =>
                      setEditingTheme({ ...editingTheme, tickCurrentColor: e.target.value })
                    }
                    className="w-full h-10 rounded border-2 border-gray-300 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Future/Next
                  </label>
                  <input
                    type="color"
                    value={editingTheme.tickFutureColor}
                    onChange={(e) =>
                      setEditingTheme({ ...editingTheme, tickFutureColor: e.target.value })
                    }
                    className="w-full h-10 rounded border-2 border-gray-300 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Time Card Accent */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Time Card Accents</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accent Color
                </label>
                <input
                  type="color"
                  value={editingTheme.timeCardAccentColor}
                  onChange={(e) =>
                    setEditingTheme({ ...editingTheme, timeCardAccentColor: e.target.value })
                  }
                  className="w-full h-12 rounded border-2 border-gray-300 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="w-1/2 overflow-y-auto p-6 bg-gray-50">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Live Preview</h3>

            {/* Background Preview */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Background</p>
              <div
                className="w-full h-32 rounded-lg shadow-inner"
                style={{
                  background: editingTheme.bgGradientVia
                    ? `linear-gradient(to right, ${editingTheme.bgGradientFrom}, ${editingTheme.bgGradientVia}, ${editingTheme.bgGradientTo})`
                    : `linear-gradient(to right, ${editingTheme.bgGradientFrom}, ${editingTheme.bgGradientTo})`,
                }}
              ></div>
            </div>

            {/* Task Card Previews */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Task Cards</p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600 mb-2">Regular Task:</p>
                  <div
                    className={`${editingTheme.cardRounded} p-4 shadow-lg`}
                    style={{
                      backgroundColor: editingTheme.cardBgColor,
                      border: `${editingTheme.cardBorderWidth} solid ${editingTheme.cardBorderColor}`,
                    }}
                  >
                    <div
                      className="text-center text-gray-800"
                      style={getFontStyle(editingTheme, 14)}
                    >
                      Reading Time
                    </div>
                    <div className="text-center text-gray-600 text-sm mt-2">30 min</div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-600 mb-2">Current Task (Active):</p>
                  <div
                    className={`${editingTheme.cardRounded} p-4 shadow-2xl transform scale-105`}
                    style={{
                      backgroundColor: editingTheme.cardBgColor,
                      border: editingTheme.currentBorderEnhance
                        ? `${parseInt(editingTheme.cardBorderWidth) * 1.5}px solid ${editingTheme.currentGlowColor}`
                        : `${editingTheme.cardBorderWidth} solid ${editingTheme.cardBorderColor}`,
                      boxShadow: `0 0 20px ${editingTheme.currentGlowColor}`,
                    }}
                  >
                    <div
                      className="text-center text-gray-800"
                      style={getFontStyle(editingTheme, 14)}
                    >
                      Math Activity
                    </div>
                    <div className="text-center text-gray-600 text-sm mt-2">45 min</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Line Preview */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Progress Indicator</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: editingTheme.tickPastColor }}
                ></div>
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: editingTheme.tickCurrentColor }}
                ></div>
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: editingTheme.tickFutureColor }}
                ></div>
                <span className="text-xs text-gray-600 ml-2">Past → Current → Future</span>
              </div>
            </div>

            {/* Time Cards Preview */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Time Cards</p>
              <div className="flex gap-4">
                <div
                  className="flex-1 rounded-xl shadow-lg p-4 bg-white"
                  style={{ borderLeft: `4px solid ${editingTheme.timeCardAccentColor}` }}
                >
                  <div
                    className="text-2xl font-bold text-center"
                    style={{ color: editingTheme.timeCardAccentColor }}
                  >
                    09:00
                  </div>
                  <div className="text-xs text-gray-600 text-center mt-1">Start</div>
                </div>
                <div
                  className="flex-1 rounded-xl shadow-lg p-4 bg-white"
                  style={{ borderLeft: `4px solid ${editingTheme.timeCardAccentColor}` }}
                >
                  <div
                    className="text-2xl font-bold text-center"
                    style={{ color: editingTheme.timeCardAccentColor }}
                  >
                    15:00
                  </div>
                  <div className="text-xs text-gray-600 text-center mt-1">End</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            onClick={onBackToSelector}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-bold text-lg"
          >
            Save & Apply Theme
          </button>
        </div>
      </div>
    </div>
  )
}
