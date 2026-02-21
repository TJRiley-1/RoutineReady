import { readFileAsDataURL } from '../../lib/timeUtils'
import { spritePresets, surfacePresets, getSurfaceGradient, getSurfaceDashColor } from '../../data/transitionPresets'

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="display-settings-title">
      <div className="bg-white rounded-[16px] p-8 w-[700px] shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 id="display-settings-title" className="text-2xl font-bold mb-6 text-brand-text">Display Settings</h2>

        <div className="space-y-6">
          {/* Display Mode */}
          <div>
            <label className="block text-sm font-medium text-brand-text mb-3">Display Mode</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { mode: 'horizontal', label: 'Horizontal', desc: 'Ultra-wide displays' },
                { mode: 'multi-row', label: 'Multi-Row', desc: 'Standard monitors' },
                { mode: 'auto-pan', label: 'Auto-Pan', desc: 'Focus on current task' },
              ].map(({ mode, label, desc }) => (
                <button
                  key={mode}
                  onClick={() => setDisplaySettings({ ...displaySettings, mode })}
                  className={`p-4 border-2 rounded-[6px] ${displaySettings.mode === mode ? 'border-brand-primary bg-brand-primary-bg' : 'border-brand-border'}`}
                >
                  <div className="font-bold">{label}</div>
                  <div className="text-xs text-brand-text-muted">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Multi-row settings */}
          {displaySettings.mode === 'multi-row' && (
            <>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">
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
                <label className="block text-sm font-medium text-brand-text mb-3">
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
                      className={`p-4 border-2 rounded-[6px] ${displaySettings.pathDirection === dir ? 'border-brand-primary bg-brand-primary-bg' : 'border-brand-border'}`}
                    >
                      <div className="font-bold">{label}</div>
                      <div className="text-xs text-brand-text-muted whitespace-pre">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Transition Type */}
          <div>
            <label className="block text-sm font-medium text-brand-text mb-3">
              Transition Indicator
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  setDisplaySettings({ ...displaySettings, transitionType: 'progress-line' })
                }
                className={`p-4 border-2 rounded-[6px] ${displaySettings.transitionType === 'progress-line' ? 'border-brand-primary bg-brand-primary-bg' : 'border-brand-border'}`}
              >
                <div className="font-bold">Progress Line</div>
                <div className="text-xs text-brand-text-muted">
                  Simple line with moving dot (like music players)
                </div>
              </button>
              <button
                onClick={() =>
                  setDisplaySettings({ ...displaySettings, transitionType: 'mascot' })
                }
                className={`p-4 border-2 rounded-[6px] ${displaySettings.transitionType === 'mascot' ? 'border-brand-primary bg-brand-primary-bg' : 'border-brand-border'}`}
              >
                <div className="font-bold">Road with Sprite</div>
                <div className="text-xs text-brand-text-muted">Character travels along a surface</div>
              </button>
            </div>
          </div>

          {/* Sprite & Surface settings for mascot mode */}
          {displaySettings.transitionType === 'mascot' && (
            <>
              {/* Transition Sprite */}
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">
                  Transition Sprite
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {spritePresets.map((sprite) => (
                    <button
                      key={sprite.id}
                      onClick={() =>
                        setDisplaySettings({ ...displaySettings, selectedSprite: sprite.id, mascotImage: null })
                      }
                      className={`p-3 border-2 rounded-[6px] flex flex-col items-center gap-1 ${
                        displaySettings.selectedSprite === sprite.id && !displaySettings.mascotImage
                          ? 'border-brand-primary bg-brand-primary-bg'
                          : 'border-brand-border hover:border-brand-primary'
                      }`}
                    >
                      <span className="text-2xl">{sprite.emoji}</span>
                      <span className="text-xs text-brand-text-muted">{sprite.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Sprite Image */}
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">
                  Upload Sprite Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/png,image/svg+xml,image/gif"
                  onChange={handleMascotUpload}
                  className="w-full p-3 border-2 border-brand-border rounded-[6px]"
                />
                {displaySettings.mascotImage && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={displaySettings.mascotImage}
                      alt="Custom Sprite"
                      className="w-10 h-10 object-contain"
                    />
                    <button
                      onClick={() =>
                        setDisplaySettings({ ...displaySettings, mascotImage: null })
                      }
                      className="px-2 py-1 bg-brand-error text-white text-xs rounded-[6px] hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <p className="text-xs text-brand-text-muted mt-1">PNG/SVG/GIF recommended at 40x40px. Overrides emoji sprite.</p>
              </div>

              {/* Progress Bar Surface */}
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">
                  Progress Bar Surface
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {surfacePresets.map((surface) => (
                    <button
                      key={surface.id}
                      onClick={() =>
                        setDisplaySettings({ ...displaySettings, selectedSurface: surface.id })
                      }
                      className={`p-3 border-2 rounded-[6px] flex flex-col items-center gap-1 ${
                        displaySettings.selectedSurface === surface.id
                          ? 'border-brand-primary bg-brand-primary-bg'
                          : 'border-brand-border hover:border-brand-primary'
                      }`}
                    >
                      <div
                        className="w-full h-4 rounded-full"
                        style={{ background: surface.gradient }}
                      />
                      <span className="text-xs text-brand-text-muted">{surface.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Bar Height */}
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">
                  Progress Bar Height: {displaySettings.roadHeight || 32}px
                </label>
                <input
                  type="range"
                  value={displaySettings.roadHeight || 32}
                  onChange={(e) =>
                    setDisplaySettings({ ...displaySettings, roadHeight: parseInt(e.target.value) })
                  }
                  className="w-full"
                  min="24"
                  max="64"
                  step="4"
                />
              </div>
            </>
          )}

          {/* Auto-Pan settings */}
          {displaySettings.mode === 'auto-pan' && (
            <>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">
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
                  className="w-full p-3 border-2 border-brand-border rounded-[6px]"
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
                      className="px-2 py-1 bg-brand-error text-white text-xs rounded-[6px] hover:bg-red-600"
                      aria-label="Remove top banner"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <p className="text-xs text-brand-text-muted mt-1">Good for school logos or class names</p>
                {displaySettings.topBannerImage && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-brand-text mb-2">
                      Top Banner Height: {displaySettings.topBannerHeight || 48}px
                    </label>
                    <input
                      type="range"
                      value={displaySettings.topBannerHeight || 48}
                      onChange={(e) =>
                        setDisplaySettings({ ...displaySettings, topBannerHeight: parseInt(e.target.value) })
                      }
                      className="w-full"
                      min="32"
                      max="120"
                      step="4"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">
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
                  className="w-full p-3 border-2 border-brand-border rounded-[6px]"
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
                      className="px-2 py-1 bg-brand-error text-white text-xs rounded-[6px] hover:bg-red-600"
                      aria-label="Remove bottom banner"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <p className="text-xs text-brand-text-muted mt-1">
                  Good for decorative images or additional info
                </p>
                {displaySettings.bottomBannerImage && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-brand-text mb-2">
                      Bottom Banner Height: {displaySettings.bottomBannerHeight || 48}px
                    </label>
                    <input
                      type="range"
                      value={displaySettings.bottomBannerHeight || 48}
                      onChange={(e) =>
                        setDisplaySettings({ ...displaySettings, bottomBannerHeight: parseInt(e.target.value) })
                      }
                      className="w-full"
                      min="32"
                      max="120"
                      step="4"
                    />
                  </div>
                )}
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
                <label htmlFor="showClock" className="text-sm text-brand-text">
                  Show live clock in banner area
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">
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
                <p className="text-xs text-brand-text-muted mt-1">
                  Adjust to prevent interference with banner images
                </p>
              </div>
            </>
          )}

          {/* Common resolutions */}
          <div>
            <label className="block text-sm font-medium text-brand-text mb-3">
              Common Display Resolutions
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  setDisplaySettings({ ...displaySettings, width: 2560, height: 1080 })
                }
                className="p-3 border-2 border-brand-border rounded-[6px] hover:border-brand-primary text-left"
              >
                <div className="font-bold">2560 × 1080</div>
                <div className="text-xs text-brand-text-muted">Ultra-wide 21:9</div>
              </button>
              <button
                onClick={() =>
                  setDisplaySettings({ ...displaySettings, width: 1920, height: 1080 })
                }
                className="p-3 border-2 border-brand-border rounded-[6px] hover:border-brand-primary text-left"
              >
                <div className="font-bold">1920 × 1080</div>
                <div className="text-xs text-brand-text-muted">Full HD 16:9</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text mb-2">
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
              className="w-full p-3 h-[44px] border-2 border-brand-border rounded-[6px] focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-pale focus:outline-none"
              min="800"
              max="7680"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text mb-2">
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
              className="w-full p-3 h-[44px] border-2 border-brand-border rounded-[6px] focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-pale focus:outline-none"
              min="600"
              max="2160"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text mb-2">
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

          <div className="bg-brand-primary-bg p-4 rounded-[6px]">
            <div className="text-sm font-medium text-brand-text mb-2">Display Capacity:</div>
            <div className="text-sm text-brand-text-muted">
              <div>
                <strong>Max Tasks:</strong> {maxTasks === Infinity ? 'Unlimited (auto-pan)' : `${maxTasks} tasks`}
              </div>
              <div>
                <strong>Current Tasks:</strong> {taskCount} tasks
              </div>
              {taskCount > maxTasks && (
                <div className="text-brand-error font-bold mt-2">
                  {taskCount - maxTasks} tasks exceed display capacity!
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-brand-primary text-white min-h-[44px] py-3 rounded-[6px] hover:bg-brand-primary-dark font-semibold"
          >
            Save Settings
          </button>
          <button
            onClick={onClose}
            className="px-6 min-h-[44px] py-3 bg-brand-bg-subtle text-brand-text border border-brand-border rounded-[6px] hover:bg-gray-200 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
