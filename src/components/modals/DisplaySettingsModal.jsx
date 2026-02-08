import { readFileAsDataURL } from '../../lib/timeUtils'

export default function DisplaySettingsModal({
  displaySettings,
  setDisplaySettings,
  maxTasks,
  maxRows,
  taskCount,
  onClose,
}) {
  const handleMascotUpload = (event) => {
    readFileAsDataURL(event.target.files[0], (dataUrl) => {
      setDisplaySettings({ ...displaySettings, mascotImage: dataUrl })
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-[700px] shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Display Settings</h2>

        <div className="space-y-6">
          {/* Display Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Display Mode</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { mode: 'horizontal', label: 'Horizontal', desc: 'Ultra-wide displays' },
                { mode: 'multi-row', label: 'Multi-Row', desc: 'Standard monitors' },
                { mode: 'auto-pan', label: 'Auto-Pan', desc: 'Focus on current task' },
              ].map(({ mode, label, desc }) => (
                <button
                  key={mode}
                  onClick={() => setDisplaySettings({ ...displaySettings, mode })}
                  className={`p-4 border-2 rounded-lg ${displaySettings.mode === mode ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
                >
                  <div className="font-bold">{label}</div>
                  <div className="text-xs text-gray-600">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Multi-row settings */}
          {displaySettings.mode === 'multi-row' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Rows: {displaySettings.rows} (Max: {maxRows})
                </label>
                <input
                  type="range"
                  value={displaySettings.rows}
                  onChange={(e) =>
                    setDisplaySettings({ ...displaySettings, rows: parseInt(e.target.value) })
                  }
                  className="w-full"
                  min="1"
                  max={maxRows}
                  step="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Path Direction
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { dir: 'sequential', label: 'Sequential', desc: '→ → →\n→ → →' },
                    { dir: 'snake', label: 'Snake', desc: '→ → →\n← ← ←' },
                  ].map(({ dir, label, desc }) => (
                    <button
                      key={dir}
                      onClick={() =>
                        setDisplaySettings({ ...displaySettings, pathDirection: dir })
                      }
                      className={`p-4 border-2 rounded-lg ${displaySettings.pathDirection === dir ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
                    >
                      <div className="font-bold">{label}</div>
                      <div className="text-xs text-gray-600 whitespace-pre">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Transition Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Transition Indicator
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  setDisplaySettings({ ...displaySettings, transitionType: 'progress-line' })
                }
                className={`p-4 border-2 rounded-lg ${displaySettings.transitionType === 'progress-line' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
              >
                <div className="font-bold">Progress Line</div>
                <div className="text-xs text-gray-600">
                  Simple line with moving dot (like music players)
                </div>
              </button>
              <button
                onClick={() =>
                  setDisplaySettings({ ...displaySettings, transitionType: 'mascot' })
                }
                className={`p-4 border-2 rounded-lg ${displaySettings.transitionType === 'mascot' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
              >
                <div className="font-bold">Road with Mascot</div>
                <div className="text-xs text-gray-600">Character travels along a road</div>
              </button>
            </div>
          </div>

          {/* Mascot Upload */}
          {displaySettings.transitionType === 'mascot' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Class Mascot Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleMascotUpload}
                className="w-full p-3 border-2 border-gray-300 rounded-lg"
              />
              {displaySettings.mascotImage && (
                <div className="mt-2">
                  <img
                    src={displaySettings.mascotImage}
                    alt="Mascot"
                    className="w-16 h-16 object-contain"
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Default: 🚗 (car emoji)</p>
            </div>
          )}

          {/* Auto-Pan settings */}
          {displaySettings.mode === 'auto-pan' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Top Banner Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    readFileAsDataURL(e.target.files[0], (dataUrl) => {
                      setDisplaySettings({ ...displaySettings, topBannerImage: dataUrl })
                    })
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-lg"
                />
                {displaySettings.topBannerImage && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={displaySettings.topBannerImage}
                      alt="Top Banner"
                      className="h-12 object-contain"
                    />
                    <button
                      onClick={() =>
                        setDisplaySettings({ ...displaySettings, topBannerImage: null })
                      }
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">Good for school logos or class names</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bottom Banner Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    readFileAsDataURL(e.target.files[0], (dataUrl) => {
                      setDisplaySettings({ ...displaySettings, bottomBannerImage: dataUrl })
                    })
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-lg"
                />
                {displaySettings.bottomBannerImage && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={displaySettings.bottomBannerImage}
                      alt="Bottom Banner"
                      className="h-12 object-contain"
                    />
                    <button
                      onClick={() =>
                        setDisplaySettings({ ...displaySettings, bottomBannerImage: null })
                      }
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Good for decorative images or additional info
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showClock"
                  checked={displaySettings.showClock}
                  onChange={(e) =>
                    setDisplaySettings({ ...displaySettings, showClock: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="showClock" className="text-sm text-gray-700">
                  Show live clock in banner area
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Tile Height: {displaySettings.autoPanTileHeight}% of display height
                </label>
                <input
                  type="range"
                  value={displaySettings.autoPanTileHeight}
                  onChange={(e) =>
                    setDisplaySettings({
                      ...displaySettings,
                      autoPanTileHeight: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                  min="30"
                  max="80"
                  step="5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Adjust to prevent interference with banner images
                </p>
              </div>
            </>
          )}

          {/* Common resolutions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Common Display Resolutions
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  setDisplaySettings({ ...displaySettings, width: 2560, height: 1080 })
                }
                className="p-3 border-2 border-gray-300 rounded-lg hover:border-indigo-500 text-left"
              >
                <div className="font-bold">2560 × 1080</div>
                <div className="text-xs text-gray-600">Ultra-wide 21:9</div>
              </button>
              <button
                onClick={() =>
                  setDisplaySettings({ ...displaySettings, width: 1920, height: 1080 })
                }
                className="p-3 border-2 border-gray-300 rounded-lg hover:border-indigo-500 text-left"
              >
                <div className="font-bold">1920 × 1080</div>
                <div className="text-xs text-gray-600">Full HD 16:9</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Width: {displaySettings.width}px
            </label>
            <input
              type="number"
              value={displaySettings.width}
              onChange={(e) =>
                setDisplaySettings({
                  ...displaySettings,
                  width: parseInt(e.target.value) || 1920,
                })
              }
              className="w-full p-3 border-2 border-gray-300 rounded-lg"
              min="800"
              max="7680"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height: {displaySettings.height}px
            </label>
            <input
              type="number"
              value={displaySettings.height}
              onChange={(e) =>
                setDisplaySettings({
                  ...displaySettings,
                  height: parseInt(e.target.value) || 1080,
                })
              }
              className="w-full p-3 border-2 border-gray-300 rounded-lg"
              min="600"
              max="2160"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scale: {displaySettings.scale}%
            </label>
            <input
              type="range"
              value={displaySettings.scale}
              onChange={(e) =>
                setDisplaySettings({ ...displaySettings, scale: parseInt(e.target.value) })
              }
              className="w-full"
              min="50"
              max="150"
              step="5"
            />
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Display Capacity:</div>
            <div className="text-sm text-gray-600">
              <div>
                <strong>Max Tasks:</strong> {maxTasks} tasks
              </div>
              <div>
                <strong>Current Tasks:</strong> {taskCount} tasks
              </div>
              {taskCount > maxTasks && (
                <div className="text-red-600 font-bold mt-2">
                  {taskCount - maxTasks} tasks exceed display capacity!
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold"
          >
            Save Settings
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
