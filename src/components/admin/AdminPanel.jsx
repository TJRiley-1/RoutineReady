import { Fragment, useState, useRef } from 'react'
import { LogOut, Plus, Clock, Edit2, Trash2 } from 'lucide-react'
import { getIconComponent } from '../../data/iconLibrary'
import { getActiveTheme, getThemeEmoji, getFontStyle, getBackgroundStyle } from '../../lib/themeUtils'
import { calculateEndTime, getDayKey } from '../../lib/timeUtils'
import { presetThemes } from '../../data/presetThemes'
import TransitionIndicator from '../display/TransitionIndicator'
import TimelineRow from '../display/TimelineRow'
import DisplaySettingsModal from '../modals/DisplaySettingsModal'
import TemplateModal from '../modals/TemplateModal'
import ThemeSelectorModal from '../modals/ThemeSelectorModal'
import ThemeEditorModal from '../modals/ThemeEditorModal'
import TaskEditModal from '../modals/TaskEditModal'
import SetupInfoModal from '../modals/SetupInfoModal'

export default function AdminPanel({
  timelineConfig,
  setTimelineConfig,
  templates,
  setTemplates,
  displaySettings,
  setDisplaySettings,
  weeklySchedule,
  setWeeklySchedule,
  setupData,
  currentTheme,
  setCurrentTheme,
  customThemes,
  setCustomThemes,
  activeTemplateId,
  setActiveTemplateId,
  todaysTemplateName,
  setTodaysTemplateName,
  currentTaskIndex,
  elapsedInTask,
  currentTime,
  onExitAdmin,
  onEditSetup,
  onResetSetup,
  onRestoreBackup,
  onSignOut,
}) {
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showDisplaySettings, setShowDisplaySettings] = useState(false)
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [showThemeEditor, setShowThemeEditor] = useState(false)
  const [editingTheme, setEditingTheme] = useState(null)
  const [showSetupInfoMenu, setShowSetupInfoMenu] = useState(false)
  const [showTaskEditModal, setShowTaskEditModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskOverflowWarning, setTaskOverflowWarning] = useState(false)
  const [draggingTemplate, setDraggingTemplate] = useState(null)

  const scrollContainerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const theme = getActiveTheme(currentTheme, customThemes)
  const scaleFactor = displaySettings.scale / 100

  const getMaxTasksForDisplay = () => {
    const availableWidth = displaySettings.width - 100
    const startEndWidth = 140 + 24
    let remainingWidth = availableWidth - startEndWidth * 2
    let maxTasks = 0
    for (const task of timelineConfig.tasks) {
      const taskWidth = task.width || 200
      const transitionWidth = taskWidth * 1.5
      const totalWidth = taskWidth + transitionWidth
      if (remainingWidth >= totalWidth) {
        remainingWidth -= totalWidth
        maxTasks++
      } else break
    }
    if (displaySettings.mode === 'multi-row') return maxTasks * getMaxRowsForDisplay()
    return maxTasks
  }

  const getMaxRowsForDisplay = () => {
    return Math.max(1, Math.floor((displaySettings.height - 200) / 250))
  }

  const maxTasks = getMaxTasksForDisplay()
  const maxRows = getMaxRowsForDisplay()

  const handleAddTask = () => {
    const newTask = {
      id: Date.now(),
      type: 'text',
      content: 'New Task',
      duration: 30,
      imageUrl: null,
      icon: null,
      width: 200,
      height: 160,
    }
    const newTasks = [...timelineConfig.tasks, newTask]
    setTimelineConfig({ ...timelineConfig, tasks: newTasks })
    setTimeout(() => {
      if (newTasks.length > getMaxTasksForDisplay()) {
        setTaskOverflowWarning(true)
        setTimeout(() => setTaskOverflowWarning(false), 5000)
      }
    }, 100)
  }

  const handleDeleteTask = (id) => {
    setTimelineConfig({ ...timelineConfig, tasks: timelineConfig.tasks.filter((t) => t.id !== id) })
  }

  const handleEditTask = (task) => {
    setEditingTask({ ...task })
    setShowTaskEditModal(true)
  }

  const handleSaveTaskFromModal = () => {
    if (!editingTask) return
    setTimelineConfig((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === editingTask.id ? editingTask : t)),
    }))
    setShowTaskEditModal(false)
    setEditingTask(null)
  }

  const handleQuickTimeAdjust = (taskId, delta) => {
    setTimelineConfig((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? { ...task, duration: Math.max(5, Math.min(180, task.duration + delta)) }
          : task
      ),
    }))
  }

  const handleUpdateTaskSize = (taskId, width, height) => {
    setTimelineConfig({
      ...timelineConfig,
      tasks: timelineConfig.tasks.map((t) => (t.id === taskId ? { ...t, width, height } : t)),
    })
  }

  const handleSaveAsTemplate = () => {
    if (newTemplateName.trim()) {
      const newTemplate = {
        id: Date.now().toString(),
        name: newTemplateName,
        startTime: timelineConfig.startTime,
        endTime: timelineConfig.endTime,
        tasks: timelineConfig.tasks.map((t) => ({ ...t })),
      }
      setTemplates([...templates, newTemplate])
      setNewTemplateName('')
      setShowTemplateModal(false)
      alert('Template saved successfully!')
    }
  }

  const handleLoadTemplate = (template) => {
    setTimelineConfig({
      startTime: template.startTime,
      endTime: template.endTime,
      tasks: template.tasks.map((t) => ({ ...t, id: Date.now() + Math.random() })),
    })
    setSelectedTemplate(template.id)
    setActiveTemplateId(template.id)
    setTodaysTemplateName(template.name)
  }

  const handleDeleteTemplate = (templateId) => {
    if (confirm('Delete this template? This cannot be undone.')) {
      setTemplates(templates.filter((t) => t.id !== templateId))
      const updatedSchedule = { ...weeklySchedule }
      Object.keys(updatedSchedule).forEach((day) => {
        if (updatedSchedule[day] === templateId) updatedSchedule[day] = null
      })
      setWeeklySchedule(updatedSchedule)
    }
  }

  const handleSelectTemplateForAssign = (templateId) => {
    setDraggingTemplate((prev) => (prev === templateId ? null : templateId))
  }

  const handleAssignToDay = (dayKey) => {
    if (draggingTemplate) {
      setWeeklySchedule((prev) => ({ ...prev, [dayKey]: draggingTemplate }))
      setDraggingTemplate(null)
    }
  }

  const handleRemoveFromDay = (dayKey) => {
    setWeeklySchedule((prev) => ({ ...prev, [dayKey]: null }))
  }

  const getTemplateInfo = (templateId) => {
    if (!templateId) return null
    const t = templates.find((t) => t.id === templateId)
    if (!t) return null
    return { name: t.name, startTime: t.startTime, endTime: t.endTime, taskCount: t.tasks.length }
  }

  const handleMouseDown = (e) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }
  const handleMouseMove = (e) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    scrollContainerRef.current.scrollLeft = scrollLeft - (x - startX) * 2
  }
  const handleMouseUp = () => setIsDragging(false)

  const handleCreateCustomTheme = () => {
    const newTheme = {
      ...presetThemes['routine-ready'],
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Custom Theme ${customThemes.length + 1}`,
      emoji: '🎨',
    }
    setEditingTheme(newTheme)
    setShowThemeEditor(true)
    setShowThemeSelector(false)
  }

  const handleEditCustomTheme = (thm) => {
    setEditingTheme({ ...thm })
    setShowThemeEditor(true)
    setShowThemeSelector(false)
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 overflow-y-auto">
      {/* Toolbar */}
      <header className="bg-white shadow-lg p-4 flex items-center justify-between sticky top-0 z-20 relative">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowTemplateModal(true)} className="flex items-center gap-2 px-5 min-h-[44px] py-3 bg-brand-primary text-white rounded-[6px] hover:bg-brand-primary-dark font-semibold">Save as Template</button>
          <button onClick={() => setShowDisplaySettings(true)} className="flex items-center gap-2 px-5 min-h-[44px] py-3 bg-brand-bg-subtle text-brand-text border border-brand-border rounded-[6px] hover:bg-gray-200 font-semibold">Display Settings</button>
          <button onClick={() => setShowThemeSelector(true)} className="flex items-center gap-2 px-5 min-h-[44px] py-3 bg-brand-accent text-brand-primary-dark rounded-[6px] hover:bg-brand-accent-light font-semibold">
            <span className="text-lg">{getThemeEmoji(currentTheme, customThemes)}</span>
            <span>Change Theme</span>
          </button>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
          <h1 className="text-2xl font-bold text-brand-text">Timeline Editor</h1>
          {setupData.setupComplete && (
            <span className="text-sm text-brand-text-muted">{setupData.schoolName} - {setupData.className}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSetupInfoMenu(true)} className="flex items-center gap-2 px-5 min-h-[44px] py-3 bg-brand-bg-subtle text-brand-text border border-brand-border rounded-[6px] hover:bg-gray-200 font-semibold">Setup Info</button>
          <button onClick={onExitAdmin} className="flex items-center gap-2 bg-brand-error text-white px-5 min-h-[44px] py-3 rounded-[6px] hover:bg-red-600 font-semibold">
            <LogOut className="w-5 h-5" />Exit Admin
          </button>
          <button onClick={onSignOut} className="flex items-center gap-2 bg-gray-700 text-white px-5 min-h-[44px] py-3 rounded-[6px] hover:bg-gray-800 font-semibold">
            <LogOut className="w-5 h-5" />Sign Out
          </button>
        </div>
      </header>

      {taskOverflowWarning && (
        <div className="bg-red-100 border-l-4 border-brand-error text-red-700 p-4 m-4" role="alert">
          <p className="font-bold">Display Width Exceeded!</p>
          <p>You have {timelineConfig.tasks.length} tasks, but your current display can only show {maxTasks} tasks in {displaySettings.mode} mode.</p>
        </div>
      )}

      {/* Modals */}
      {showSetupInfoMenu && (
        <SetupInfoModal
          setupData={setupData}
          onEditSetup={() => { setShowSetupInfoMenu(false); onEditSetup() }}
          onResetSetup={() => { setShowSetupInfoMenu(false); onResetSetup() }}
          onRestoreBackup={(e) => { setShowSetupInfoMenu(false); onRestoreBackup(e) }}
          onClose={() => setShowSetupInfoMenu(false)}
        />
      )}
      {showDisplaySettings && (
        <DisplaySettingsModal displaySettings={displaySettings} setDisplaySettings={setDisplaySettings} maxTasks={maxTasks} maxRows={maxRows} taskCount={timelineConfig.tasks.length} onClose={() => setShowDisplaySettings(false)} />
      )}
      {showTemplateModal && (
        <TemplateModal newTemplateName={newTemplateName} setNewTemplateName={setNewTemplateName} onSave={handleSaveAsTemplate} onClose={() => { setShowTemplateModal(false); setNewTemplateName('') }} />
      )}
      {showThemeSelector && (
        <ThemeSelectorModal currentTheme={currentTheme} customThemes={customThemes} setCurrentTheme={setCurrentTheme} setCustomThemes={setCustomThemes} onCreateCustom={handleCreateCustomTheme} onEditCustom={handleEditCustomTheme} onClose={() => setShowThemeSelector(false)} />
      )}
      {showThemeEditor && editingTheme && (
        <ThemeEditorModal editingTheme={editingTheme} setEditingTheme={setEditingTheme} customThemes={customThemes} setCustomThemes={setCustomThemes} setCurrentTheme={setCurrentTheme} onClose={() => { setShowThemeEditor(false); setEditingTheme(null) }} onBackToSelector={() => { setShowThemeEditor(false); setEditingTheme(null); setShowThemeSelector(true) }} />
      )}
      {showTaskEditModal && editingTask && (
        <TaskEditModal editingTask={editingTask} setEditingTask={setEditingTask} onSave={handleSaveTaskFromModal} onCancel={() => { setShowTaskEditModal(false); setEditingTask(null) }} />
      )}

      {/* Main content */}
      <main className="p-6">
        {/* Weekly Schedule */}
        <section className="bg-white rounded-[12px] shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-brand-text mb-4 text-center">Weekly Schedule</h2>
          <p className="text-sm text-brand-text-muted text-center mb-4">Assign templates to days using the buttons below. Templates will auto-load when the display starts.</p>
          <div className="grid grid-cols-5 gap-4 mb-6">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => {
              const templateInfo = getTemplateInfo(weeklySchedule[day])
              const dayLabel = day.charAt(0).toUpperCase() + day.slice(1)
              const isToday = getDayKey(new Date().getDay()) === day
              return (
                <div key={day} onClick={() => handleAssignToDay(day)} className={`relative border-2 border-dashed rounded-[12px] p-4 min-h-[140px] transition-all ${draggingTemplate ? 'border-brand-primary bg-brand-primary-bg cursor-pointer hover:border-brand-primary-dark hover:bg-brand-primary-pale/20' : templateInfo ? 'border-brand-success bg-green-50' : 'border-brand-border bg-brand-bg-subtle'} ${isToday ? 'ring-2 ring-brand-accent' : ''}`}>
                  <div className={`text-center font-bold mb-2 ${isToday ? 'text-brand-accent' : 'text-brand-text'}`}>
                    {dayLabel}
                    {isToday && <span className="ml-1 text-xs bg-brand-accent-bg text-brand-primary-dark px-2 py-0.5 rounded-full">Today</span>}
                  </div>
                  {templateInfo ? (
                    <div className="text-center">
                      <div className="font-semibold text-brand-success text-sm mb-1">{templateInfo.name}</div>
                      <div className="text-xs text-brand-text-muted">{templateInfo.startTime} - {templateInfo.endTime}</div>
                      <div className="text-xs text-brand-text-muted">{templateInfo.taskCount} tasks</div>
                      <button onClick={(e) => { e.stopPropagation(); handleRemoveFromDay(day) }} className="mt-2 px-3 py-2 min-h-[44px] text-brand-error hover:bg-red-100 rounded-[6px] transition-colors text-xs font-medium" aria-label={`Remove template from ${dayLabel}`}>Remove</button>
                    </div>
                  ) : (
                    <div className="text-center text-brand-text-muted text-sm mt-4">
                      <div className="text-3xl mb-2 opacity-50">+</div>
                      <div>{draggingTemplate ? 'Click to assign' : 'Select template below'}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Templates */}
        <section className="bg-white rounded-[12px] shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-brand-text mb-4 text-center">Available Templates</h2>
          <p className="text-sm text-brand-text-muted text-center mb-4">
            {draggingTemplate ? 'Now click a day above to assign the template' : 'Click "Assign to Day" to select, then click a day above'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {templates.map((template) => (
              <div key={template.id} className={`border-2 rounded-[12px] p-4 transition-all max-w-xs text-center ${selectedTemplate === template.id ? 'border-brand-primary bg-brand-primary-bg' : draggingTemplate === template.id ? 'border-brand-primary bg-brand-primary-bg ring-2 ring-brand-primary-pale' : 'border-brand-border hover:border-brand-primary'}`}>
                <div className="flex justify-end items-start mb-2 min-h-[24px]">
                  {template.id !== 'default' && (
                    <button onClick={() => handleDeleteTemplate(template.id)} className="px-3 py-2 min-h-[44px] text-brand-error hover:bg-red-50 rounded-[6px] cursor-pointer text-xs font-medium" aria-label={`Delete template ${template.name}`}>Delete</button>
                  )}
                </div>
                <div className="mb-3">
                  <h3 className="font-bold text-brand-text">{template.name}</h3>
                  <p className="text-sm text-brand-text-muted">{template.startTime} - {template.endTime}</p>
                  <p className="text-xs text-brand-text-muted mt-1">{template.tasks.length} tasks</p>
                </div>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => handleSelectTemplateForAssign(template.id)} className={`px-3 min-h-[44px] py-2 rounded-[6px] text-sm font-semibold ${draggingTemplate === template.id ? 'bg-brand-bg-subtle text-brand-text border border-brand-border hover:bg-gray-200' : 'bg-brand-success text-white hover:bg-green-700'}`}>
                    {draggingTemplate === template.id ? 'Cancel' : 'Assign to Day'}
                  </button>
                  <button onClick={() => handleLoadTemplate(template)} className="px-3 min-h-[44px] py-2 bg-brand-primary text-white rounded-[6px] text-sm hover:bg-brand-primary-dark font-semibold">Load Now</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Edit Tasks */}
        <section className="bg-white rounded-[12px] shadow-lg p-6">
          <div className="relative mb-4">
            <h2 className="text-xl font-bold text-brand-text text-center">Edit Tasks (Pan to Navigate)</h2>
            <button onClick={handleAddTask} className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-brand-success text-white px-5 min-h-[44px] py-3 rounded-[6px] hover:bg-green-700 font-semibold" aria-label="Add new task">
              <Plus className="w-5 h-5" />Add Task
            </button>
          </div>
          <div ref={scrollContainerRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} className="overflow-x-auto cursor-grab active:cursor-grabbing" style={{ userSelect: 'none' }}>
            <div className="flex items-center gap-6 p-8 min-w-max">
              <div className="flex flex-col items-center bg-brand-primary-bg rounded-[12px] p-4 min-w-[120px]">
                <Clock className="w-8 h-8 text-brand-primary mb-2" />
                <label htmlFor="start-time" className="sr-only">Start time</label>
                <input id="start-time" type="time" value={timelineConfig.startTime} onChange={(e) => setTimelineConfig({ ...timelineConfig, startTime: e.target.value })} className="text-sm font-bold text-center bg-white border border-brand-primary rounded-[6px] px-1 py-1 w-24" />
                <div className="text-xs text-brand-primary-dark mt-1">Start</div>
              </div>

              {timelineConfig.tasks.map((task) => {
                const taskWidth = task.width || 200
                const taskHeight = task.height || 160
                const transitionWidth = taskWidth * 1.5
                const IconComponent = task.icon ? getIconComponent(task.icon) : null

                return (
                  <Fragment key={task.id}>
                    <div className="flex flex-col">
                      <div className="flex flex-col bg-white border-2 border-brand-border rounded-[12px] p-4" style={{ minWidth: `${taskWidth}px`, width: `${taskWidth}px` }}>
                        {task.type === 'image' && task.imageUrl ? (
                          <img src={task.imageUrl} alt={task.content} className="object-cover rounded mb-2 mx-auto" style={{ width: `${Math.min(taskWidth * 0.6, 96)}px`, height: `${Math.min(taskHeight * 0.6, 96)}px` }} />
                        ) : (
                          <>
                            {IconComponent && <IconComponent className="text-brand-primary mx-auto mb-2" style={{ width: '48px', height: '48px' }} />}
                            <div className="font-bold text-center mb-2" style={{ fontSize: `${Math.min(taskWidth / 10, 20)}px` }}>{task.content}</div>
                          </>
                        )}
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <button onClick={() => handleQuickTimeAdjust(task.id, -5)} disabled={task.duration <= 5} className={`px-2 min-h-[44px] min-w-[44px] py-1 rounded-[6px] text-xs font-bold transition-colors ${task.duration <= 5 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-red-100 text-red-600 hover:bg-red-200'}`} aria-label={`Decrease ${task.content} duration by 5 minutes`}>-5</button>
                          <div className="text-sm text-brand-text-muted font-medium min-w-[50px] text-center">{task.duration} min</div>
                          <button onClick={() => handleQuickTimeAdjust(task.id, 5)} disabled={task.duration >= 180} className={`px-2 min-h-[44px] min-w-[44px] py-1 rounded-[6px] text-xs font-bold transition-colors ${task.duration >= 180 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-100 text-green-600 hover:bg-green-200'}`} aria-label={`Increase ${task.content} duration by 5 minutes`}>+5</button>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditTask(task)} className="flex-1 p-2 min-h-[44px] bg-brand-primary text-white rounded-[6px] hover:bg-brand-primary-dark transition-colors" aria-label={`Edit ${task.content}`}><Edit2 className="w-4 h-4 mx-auto" /></button>
                          <button onClick={() => handleDeleteTask(task.id)} className="flex-1 p-2 min-h-[44px] bg-brand-error text-white rounded-[6px] hover:bg-red-600 transition-colors" aria-label={`Delete ${task.content}`}><Trash2 className="w-4 h-4 mx-auto" /></button>
                        </div>
                      </div>
                      {displaySettings.mode !== 'auto-pan' && (
                        <div className="mt-2 p-3 bg-brand-primary-bg rounded-[12px] border border-brand-primary-pale">
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs font-medium text-brand-primary-dark">Width: {taskWidth}px</label>
                              <input type="range" min="120" max="400" step="10" value={taskWidth} onChange={(e) => handleUpdateTaskSize(task.id, parseInt(e.target.value), taskHeight)} className="w-full" />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-brand-primary-dark">Height: {taskHeight}px</label>
                              <input type="range" min="100" max="300" step="10" value={taskHeight} onChange={(e) => handleUpdateTaskSize(task.id, taskWidth, parseInt(e.target.value))} className="w-full" />
                            </div>
                            <div className="text-xs text-brand-primary-dark mt-1">Transition width: {transitionWidth.toFixed(0)}px</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center bg-brand-bg-subtle rounded-[12px] p-4">
                      <div className="text-xs text-brand-text-muted mb-2 font-medium">Transition Preview</div>
                      {displaySettings.transitionType === 'mascot' ? (
                        <div className="w-full h-8 bg-gray-400 rounded-full relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-around">
                            {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="w-3 h-0.5 bg-white rounded-full" />))}
                          </div>
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xl">🚗</div>
                        </div>
                      ) : (
                        <div className="w-full h-3 bg-brand-border rounded-full relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-primary-dark rounded-full w-1/2"></div>
                          <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-brand-primary rounded-full"></div>
                        </div>
                      )}
                      <div className="text-xs text-brand-text-muted mt-1">Width: {transitionWidth.toFixed(0)}px</div>
                    </div>
                  </Fragment>
                )
              })}

              <div className="flex flex-col items-center bg-red-50 rounded-[12px] p-4 min-w-[120px]">
                <Clock className="w-8 h-8 text-brand-error mb-2" />
                <div className="text-xl font-bold bg-white border border-brand-error rounded-[6px] px-2 py-1 w-28 text-center">{calculateEndTime(timelineConfig.startTime, timelineConfig.tasks)}</div>
                <div className="text-xs text-brand-error mt-1">End</div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Display Preview */}
        <section className="bg-white rounded-[12px] shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-brand-text mb-4 text-center">
            Live Display Preview - What Students See
            <span className="ml-3 text-sm font-normal text-brand-text-muted">(Scaled to {displaySettings.width}x{displaySettings.height} at {displaySettings.scale}% zoom)</span>
          </h2>
          <div className="border-2 border-brand-border rounded-[12px] overflow-x-auto overflow-y-hidden bg-gray-200 p-4 flex justify-center items-center" style={{ height: `${displaySettings.height * scaleFactor * Math.min(1, 1200 / (displaySettings.width * scaleFactor)) + 40}px` }}>
            <div className="relative rounded-xl shadow-xl overflow-hidden" style={{
              background: getBackgroundStyle(theme),
              width: `${displaySettings.width * scaleFactor}px`,
              height: `${displaySettings.height * scaleFactor}px`,
              transform: `scale(${Math.min(1, 1200 / (displaySettings.width * scaleFactor))})`,
              transformOrigin: 'center center',
            }}>
              {displaySettings.mode === 'horizontal' ? (
                <PreviewHorizontal timelineConfig={timelineConfig} displaySettings={displaySettings} theme={theme} currentTaskIndex={currentTaskIndex} elapsedInTask={elapsedInTask} />
              ) : displaySettings.mode === 'multi-row' ? (
                <div className="w-full h-full flex flex-col justify-evenly">
                  {Array.from({ length: displaySettings.rows }).map((_, rowIndex) => {
                    const tasksPerRow = Math.ceil(timelineConfig.tasks.length / displaySettings.rows)
                    const startIdx = rowIndex * tasksPerRow
                    const endIdx = Math.min((rowIndex + 1) * tasksPerRow, timelineConfig.tasks.length)
                    if (startIdx >= timelineConfig.tasks.length) return null
                    return <TimelineRow key={rowIndex} tasks={timelineConfig.tasks} startIdx={startIdx} endIdx={endIdx} rowIndex={rowIndex} theme={theme} displaySettings={displaySettings} timelineConfig={timelineConfig} currentTaskIndex={currentTaskIndex} elapsedInTask={elapsedInTask} />
                  })}
                </div>
              ) : (
                <PreviewAutoPan timelineConfig={timelineConfig} displaySettings={displaySettings} theme={theme} currentTaskIndex={currentTaskIndex} elapsedInTask={elapsedInTask} currentTime={currentTime} scaleFactor={scaleFactor} />
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function PreviewHorizontal({ timelineConfig, displaySettings, theme, currentTaskIndex, elapsedInTask }) {
  return (
    <div className="w-full h-full flex items-center justify-center px-12">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg p-6 min-w-[140px]" style={{ borderLeft: `6px solid ${theme.timeCardAccentColor}` }}>
          <Clock className="w-12 h-12 mb-3" style={{ color: theme.timeCardAccentColor }} />
          <div className="text-5xl font-bold text-gray-800">{timelineConfig.startTime}</div>
          <div className="text-lg text-gray-600 mt-2">Start</div>
        </div>
        {timelineConfig.tasks.map((task, index) => {
          const isCurrentTask = index === currentTaskIndex
          const isPastTask = index < currentTaskIndex
          const taskWidth = task.width || 200
          const taskHeight = task.height || 160
          const transitionWidth = taskWidth * 1.5
          const IconComponent = task.icon ? getIconComponent(task.icon) : null
          const taskCardBorder = theme.cardBorderColorAlt && index % 2 === 1 ? theme.cardBorderColorAlt : theme.cardBorderColor
          return (
            <Fragment key={task.id}>
              <div className={`flex flex-col items-center justify-center ${theme.cardRounded} shadow-lg p-6 transition-all duration-1000 ${isPastTask ? 'opacity-60' : ''} ${isCurrentTask ? 'scale-105' : ''}`} style={{
                minWidth: `${taskWidth}px`, width: `${taskWidth}px`, minHeight: `${taskHeight}px`,
                backgroundColor: isPastTask ? '#f3f4f6' : theme.cardBgColor,
                border: isCurrentTask && theme.currentBorderEnhance ? `${parseInt(theme.cardBorderWidth) * 1.5}px solid ${theme.currentGlowColor}` : `${theme.cardBorderWidth} solid ${taskCardBorder}`,
                boxShadow: isCurrentTask ? `0 0 30px ${theme.currentGlowColor}` : undefined,
              }}>
                {task.type === 'image' && task.imageUrl ? (
                  <img src={task.imageUrl} alt={task.content} className="object-cover rounded-lg mb-3" style={{ width: `${Math.min(taskWidth * 0.7, 128)}px`, height: `${Math.min(taskHeight * 0.6, 128)}px` }} />
                ) : (
                  <>
                    {IconComponent && <IconComponent className="mb-3" style={{ color: theme.cardBorderColor, width: `${Math.min(taskWidth * 0.5, 80)}px`, height: `${Math.min(taskWidth * 0.5, 80)}px` }} />}
                    <div className="text-gray-800 text-center mb-3" style={getFontStyle(theme, Math.min(taskWidth / 5, 36))}>{task.content}</div>
                  </>
                )}
                <div className="text-gray-600" style={{ fontSize: `${Math.min(taskWidth / 10, 20)}px` }}>{task.duration} min</div>
              </div>
              <TransitionIndicator transitionType={displaySettings.transitionType} taskDuration={task.duration} elapsed={elapsedInTask} isPast={isPastTask} isActive={isCurrentTask} mascotImage={displaySettings.mascotImage} width={transitionWidth} theme={theme} />
            </Fragment>
          )
        })}
        <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg p-6 min-w-[140px]" style={{ borderLeft: `6px solid ${theme.timeCardAccentColorAlt || theme.timeCardAccentColor}` }}>
          <Clock className="w-12 h-12 mb-3" style={{ color: theme.timeCardAccentColorAlt || theme.timeCardAccentColor }} />
          <div className="text-5xl font-bold text-gray-800">{calculateEndTime(timelineConfig.startTime, timelineConfig.tasks)}</div>
          <div className="text-lg text-gray-600 mt-2">End</div>
        </div>
      </div>
    </div>
  )
}

function PreviewAutoPan({ timelineConfig, displaySettings, theme, currentTaskIndex, elapsedInTask, currentTime, scaleFactor }) {
  const currentTask = timelineConfig.tasks[currentTaskIndex]
  const nextTask = timelineConfig.tasks[currentTaskIndex + 1]
  const CurrentIcon = currentTask?.icon ? getIconComponent(currentTask.icon) : null
  const NextIcon = nextTask?.icon ? getIconComponent(nextTask.icon) : null
  return (
    <div className="w-full h-full flex flex-col">
      {(displaySettings.topBannerImage || displaySettings.showClock) && (
        <div className="flex items-center justify-center py-2 bg-gradient-to-r from-brand-primary to-brand-primary-dark">
          {displaySettings.topBannerImage && <img src={displaySettings.topBannerImage} alt="Top Banner" className="max-h-12 object-contain" />}
          {displaySettings.showClock && <div className="text-2xl font-bold text-white ml-4">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
        </div>
      )}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full flex items-stretch gap-2" style={{ height: `${displaySettings.autoPanTileHeight}%` }}>
          <div className="flex flex-col items-center justify-center rounded-xl shadow-xl p-4" style={{ flex: '1', background: `linear-gradient(to bottom right, ${theme.bgGradientFrom}, ${theme.bgGradientTo})`, border: `4px solid ${theme.cardBorderColor}` }}>
            {currentTask ? (
              <>
                <div className="text-xs font-semibold mb-2" style={{ color: theme.cardBorderColor }}>CURRENT TASK</div>
                {currentTask.type === 'image' && currentTask.imageUrl ? (
                  <img src={currentTask.imageUrl} alt={currentTask.content} className="object-contain rounded-lg mb-2" style={{ maxWidth: '80px', maxHeight: '80px' }} />
                ) : CurrentIcon && <CurrentIcon className="mb-2" style={{ color: theme.cardBorderColor, width: '40px', height: '40px' }} />}
                <div className="text-xl font-bold text-gray-800 text-center">{currentTask.content}</div>
                <div className="text-sm text-gray-600 mt-2">{currentTask.duration} min</div>
              </>
            ) : <div className="text-sm text-gray-500">No current task</div>}
          </div>
          <div className="flex flex-col items-center justify-center" style={{ flex: '3' }}>
            <TransitionIndicator transitionType={displaySettings.transitionType} taskDuration={currentTask?.duration || 30} elapsed={elapsedInTask} isPast={false} isActive={true} mascotImage={displaySettings.mascotImage} width={displaySettings.width * scaleFactor * 0.5} theme={theme} />
            <div className="mt-4 text-lg font-bold text-gray-700">{Math.max(0, Math.floor((currentTask?.duration || 0) - elapsedInTask))} min remaining</div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl shadow-lg p-4 bg-white border-2 border-gray-300" style={{ flex: '1' }}>
            {nextTask ? (
              <>
                <div className="text-xs font-semibold text-gray-500 mb-2">NEXT TASK</div>
                {nextTask.type === 'image' && nextTask.imageUrl ? (
                  <img src={nextTask.imageUrl} alt={nextTask.content} className="object-contain rounded-lg mb-2" style={{ maxWidth: '60px', maxHeight: '60px' }} />
                ) : NextIcon && <NextIcon className="mb-2" style={{ color: theme.cardBorderColor, width: '32px', height: '32px' }} />}
                <div className="text-lg font-bold text-gray-700 text-center">{nextTask.content}</div>
                <div className="text-xs text-gray-500 mt-2">{nextTask.duration} min</div>
              </>
            ) : <div className="text-sm text-gray-400">All done!</div>}
          </div>
        </div>
      </div>
      {displaySettings.bottomBannerImage && (
        <div className="flex items-center justify-center py-2 bg-gradient-to-r from-brand-primary-dark to-brand-primary">
          <img src={displaySettings.bottomBannerImage} alt="Bottom Banner" className="max-h-12 object-contain" />
        </div>
      )}
    </div>
  )
}
