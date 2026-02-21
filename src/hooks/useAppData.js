import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import {
  defaultTimelineConfig,
  defaultTemplate,
  defaultSetupData,
  defaultDisplaySettings,
  defaultWeeklySchedule,
  defaultTasks,
} from '../data/defaults'

// Debounce helper for non-critical saves (display settings, themes)
function useDebouncedSave(saveFn, delay = 800) {
  const timeoutRef = useRef(null)
  const saveFnRef = useRef(saveFn)
  saveFnRef.current = saveFn

  return useCallback((...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => saveFnRef.current(...args), delay)
  }, [delay])
}

export function useAppData(session) {
  const [dataLoaded, setDataLoaded] = useState(false)
  const [showSetupWizard, setShowSetupWizard] = useState(false)
  const [setupStep, setSetupStep] = useState(1)

  // Supabase state
  const [schoolId, setSchoolId] = useState(null)

  // App state (loaded from Supabase)
  const [timelineConfig, setTimelineConfig] = useState(defaultTimelineConfig)
  const [templates, setTemplates] = useState([defaultTemplate])
  const [setupData, setSetupData] = useState(null)
  const [displaySettings, setDisplaySettings] = useState(defaultDisplaySettings)
  const [currentTheme, setCurrentTheme] = useState('routine-ready')
  const [customThemes, setCustomThemes] = useState([])
  const [weeklySchedule, setWeeklySchedule] = useState(defaultWeeklySchedule)

  // Non-persisted state
  const [activeTemplateId, setActiveTemplateId] = useState(null)
  const [todaysTemplateName, setTodaysTemplateName] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Track whether initial load is done to avoid saving defaults back to DB
  const initialLoadDone = useRef(false)

  // --- Load all data from Supabase when session is available ---
  useEffect(() => {
    if (!session?.user) {
      setDataLoaded(false)
      initialLoadDone.current = false
      return
    }
    loadAllData()
  }, [session?.user?.id])

  const loadAllData = async () => {
    const userId = session.user.id

    // 1. Load or create school
    let { data: school } = await supabase
      .from('schools')
      .select('*')
      .eq('owner_id', userId)
      .limit(1)
      .single()

    if (!school) {
      // Check if there's localStorage data to migrate (migration-only usage)
      const localSetup = localStorage.getItem('setupData')
      const parsedSetup = localSetup ? JSON.parse(localSetup) : null

      if (parsedSetup?.setupComplete) {
        const { data: newSchool } = await supabase
          .from('schools')
          .insert({
            owner_id: userId,
            school_name: parsedSetup.schoolName || '',
            class_name: parsedSetup.className || '',
            teacher_name: parsedSetup.teacherName || '',
            device_name: parsedSetup.deviceName || 'Display 1',
          })
          .select()
          .single()
        school = newSchool

        if (school) {
          await migrateLocalStorageToSupabase(school.id)
          clearLocalStorage()
        }
      }

      if (!school) {
        setSetupData(defaultSetupData)
        setShowSetupWizard(true)
        setDataLoaded(true)
        initialLoadDone.current = true
        setSchoolId(null)
        return
      }
    }

    setSchoolId(school.id)
    setSetupData({
      schoolName: school.school_name,
      className: school.class_name,
      teacherName: school.teacher_name,
      deviceName: school.device_name,
      setupComplete: true,
    })

    // 2. Load display settings
    const { data: ds } = await supabase
      .from('display_settings')
      .select('*')
      .eq('school_id', school.id)
      .limit(1)
      .single()

    if (ds) {
      setDisplaySettings({
        width: ds.width,
        height: ds.height,
        scale: ds.scale,
        mode: ds.mode,
        rows: ds.rows,
        pathDirection: ds.path_direction,
        transitionType: ds.transition_type,
        mascotImage: ds.mascot_image,
        topBannerImage: ds.top_banner_image,
        bottomBannerImage: ds.bottom_banner_image,
        showClock: ds.show_clock,
        autoPanTileHeight: ds.auto_pan_tile_height,
      })
      setCurrentTheme(ds.current_theme || 'routine-ready')
    }

    // 3. Load templates with tasks
    const { data: dbTemplates } = await supabase
      .from('templates')
      .select('*')
      .eq('school_id', school.id)
      .order('created_at')

    if (dbTemplates && dbTemplates.length > 0) {
      const loadedTemplates = []
      for (const t of dbTemplates) {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('template_id', t.id)
          .order('sort_order')

        loadedTemplates.push({
          id: t.id,
          name: t.name,
          startTime: t.start_time,
          endTime: t.end_time,
          tasks: (tasks || []).map((task) => ({
            id: task.id,
            type: task.type,
            content: task.content,
            duration: task.duration,
            imageUrl: task.image_url,
            icon: task.icon,
            width: task.width,
            height: task.height,
          })),
        })
      }
      setTemplates(loadedTemplates)
    }

    // 4. Load active timeline
    const { data: at } = await supabase
      .from('active_timeline')
      .select('*')
      .eq('school_id', school.id)
      .limit(1)
      .single()

    if (at) {
      setTimelineConfig({
        startTime: at.start_time,
        endTime: at.end_time,
        tasks: at.tasks_json || [],
      })
      if (at.template_id) setActiveTemplateId(at.template_id)
    }

    // 5. Load weekly schedule
    const { data: ws } = await supabase
      .from('weekly_schedules')
      .select('*')
      .eq('school_id', school.id)
      .limit(1)
      .single()

    if (ws) {
      setWeeklySchedule({
        monday: ws.monday,
        tuesday: ws.tuesday,
        wednesday: ws.wednesday,
        thursday: ws.thursday,
        friday: ws.friday,
      })
    }

    // 6. Load custom themes
    const { data: ct } = await supabase
      .from('custom_themes')
      .select('*')
      .eq('school_id', school.id)
      .order('created_at')

    if (ct && ct.length > 0) {
      setCustomThemes(ct.map((theme) => ({
        id: theme.id,
        name: theme.name,
        cardBg: theme.card_bg,
        cardBorder: theme.card_border,
        cardText: theme.card_text,
        cardTime: theme.card_time,
        cardRadius: theme.card_radius,
        cardShadow: theme.card_shadow,
        cardBorderWidth: theme.card_border_width,
        progressBg: theme.progress_bg,
        progressFill: theme.progress_fill,
        progressHeight: theme.progress_height,
        pageBg: theme.page_bg,
        pageGradient: theme.page_gradient,
        fontFamily: theme.font_family,
        dotCompleted: theme.dot_completed,
        dotCurrent: theme.dot_current,
        dotUpcoming: theme.dot_upcoming,
        emoji: theme.emoji,
      })))
    }

    clearLocalStorage()
    setDataLoaded(true)
    initialLoadDone.current = true
  }

  // --- Migrate localStorage data to Supabase (migration-only) ---
  const migrateLocalStorageToSupabase = async (sId) => {
    // Display settings (migration from localStorage)
    const localDisplay = localStorage.getItem('displaySettings')
    if (localDisplay) {
      const ds = JSON.parse(localDisplay)
      await supabase.from('display_settings').insert({
        school_id: sId,
        width: ds.width,
        height: ds.height,
        scale: ds.scale,
        mode: ds.mode,
        rows: ds.rows,
        path_direction: ds.pathDirection,
        transition_type: ds.transitionType,
        mascot_image: ds.mascotImage,
        top_banner_image: ds.topBannerImage,
        bottom_banner_image: ds.bottomBannerImage,
        show_clock: ds.showClock,
        auto_pan_tile_height: ds.autoPanTileHeight,
        current_theme: localStorage.getItem('currentTheme') || 'routine-ready',
      })
    }

    // Templates + tasks (migration from localStorage)
    const localTemplates = localStorage.getItem('taskTemplates')
    if (localTemplates) {
      const templates = JSON.parse(localTemplates)
      for (const t of templates) {
        const { data: newTemplate } = await supabase
          .from('templates')
          .insert({
            school_id: sId,
            name: t.name,
            start_time: t.startTime,
            end_time: t.endTime,
          })
          .select()
          .single()

        if (newTemplate && t.tasks?.length > 0) {
          await supabase.from('tasks').insert(
            t.tasks.map((task, i) => ({
              template_id: newTemplate.id,
              sort_order: i,
              type: task.type,
              content: task.content,
              duration: task.duration,
              image_url: task.imageUrl,
              icon: task.icon,
              width: task.width,
              height: task.height,
            }))
          )
        }
      }
    }

    // Active timeline (migration from localStorage)
    const localTimeline = localStorage.getItem('currentTimelineConfig')
    if (localTimeline) {
      const tc = JSON.parse(localTimeline)
      await supabase.from('active_timeline').insert({
        school_id: sId,
        start_time: tc.startTime,
        end_time: tc.endTime,
        tasks_json: tc.tasks,
      })
    }

    // Weekly schedule (migration from localStorage)
    const localSchedule = localStorage.getItem('weeklySchedule')
    if (localSchedule) {
      const ws = JSON.parse(localSchedule)
      await supabase.from('weekly_schedules').insert({
        school_id: sId,
        monday: ws.monday,
        tuesday: ws.tuesday,
        wednesday: ws.wednesday,
        thursday: ws.thursday,
        friday: ws.friday,
      })
    }

    // Custom themes (migration from localStorage)
    const localThemes = localStorage.getItem('customThemes')
    if (localThemes) {
      const themes = JSON.parse(localThemes)
      for (const theme of themes) {
        await supabase.from('custom_themes').insert({
          school_id: sId,
          name: theme.name,
          card_bg: theme.cardBg,
          card_border: theme.cardBorder,
          card_text: theme.cardText,
          card_time: theme.cardTime,
          card_radius: theme.cardRadius,
          card_shadow: theme.cardShadow,
          card_border_width: theme.cardBorderWidth,
          progress_bg: theme.progressBg,
          progress_fill: theme.progressFill,
          progress_height: theme.progressHeight,
          page_bg: theme.pageBg,
          page_gradient: theme.pageGradient,
          font_family: theme.fontFamily,
          dot_completed: theme.dotCompleted,
          dot_current: theme.dotCurrent,
          dot_upcoming: theme.dotUpcoming,
          emoji: theme.emoji,
        })
      }
    }
  }

  // Clear localStorage keys (migration-only usage)
  const clearLocalStorage = () => {
    localStorage.removeItem('setupData')
    localStorage.removeItem('taskTemplates')
    localStorage.removeItem('currentTimelineConfig')
    localStorage.removeItem('currentTheme')
    localStorage.removeItem('customThemes')
    localStorage.removeItem('weeklySchedule')
    localStorage.removeItem('displaySettings')
  }

  // --- Debounced Supabase save functions (for non-critical, frequent changes) ---
  const saveDisplaySettingsToDb = useDebouncedSave(async (settings, theme) => {
    if (!schoolId) return
    const { data: existing } = await supabase
      .from('display_settings')
      .select('id')
      .eq('school_id', schoolId)
      .limit(1)
      .single()

    const payload = {
      school_id: schoolId,
      width: settings.width,
      height: settings.height,
      scale: settings.scale,
      mode: settings.mode,
      rows: settings.rows,
      path_direction: settings.pathDirection,
      transition_type: settings.transitionType,
      mascot_image: settings.mascotImage,
      top_banner_image: settings.topBannerImage,
      bottom_banner_image: settings.bottomBannerImage,
      show_clock: settings.showClock,
      auto_pan_tile_height: settings.autoPanTileHeight,
      current_theme: theme,
    }

    if (existing) {
      await supabase.from('display_settings').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('display_settings').insert(payload)
    }
  })

  const saveTimelineToDb = useDebouncedSave(async (config, templateId) => {
    if (!schoolId) return
    const { data: existing } = await supabase
      .from('active_timeline')
      .select('id')
      .eq('school_id', schoolId)
      .limit(1)
      .single()

    const payload = {
      school_id: schoolId,
      template_id: templateId || null,
      start_time: config.startTime,
      end_time: config.endTime,
      tasks_json: config.tasks,
    }

    if (existing) {
      await supabase.from('active_timeline').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('active_timeline').insert(payload)
    }
  })

  const saveTemplatesToDb = async (allTemplates) => {
    if (!schoolId) return
    await supabase.from('templates').delete().eq('school_id', schoolId)

    for (const t of allTemplates) {
      const { data: newTemplate } = await supabase
        .from('templates')
        .insert({
          id: t.id,
          school_id: schoolId,
          name: t.name,
          start_time: t.startTime,
          end_time: t.endTime,
        })
        .select()
        .single()

      if (newTemplate && t.tasks?.length > 0) {
        await supabase.from('tasks').insert(
          t.tasks.map((task, i) => ({
            template_id: newTemplate.id,
            sort_order: i,
            type: task.type,
            content: task.content,
            duration: task.duration,
            image_url: task.imageUrl,
            icon: task.icon,
            width: task.width,
            height: task.height,
          }))
        )
      }
    }
  }

  const saveWeeklyScheduleToDb = async (schedule) => {
    if (!schoolId) return
    const { data: existing } = await supabase
      .from('weekly_schedules')
      .select('id')
      .eq('school_id', schoolId)
      .limit(1)
      .single()

    const payload = {
      school_id: schoolId,
      monday: schedule.monday,
      tuesday: schedule.tuesday,
      wednesday: schedule.wednesday,
      thursday: schedule.thursday,
      friday: schedule.friday,
    }

    if (existing) {
      await supabase.from('weekly_schedules').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('weekly_schedules').insert(payload)
    }
  }

  const saveTimelineConfigToDb = async (config, templateId) => {
    if (!schoolId) return
    const { data: existing } = await supabase
      .from('active_timeline')
      .select('id')
      .eq('school_id', schoolId)
      .limit(1)
      .single()

    const payload = {
      school_id: schoolId,
      template_id: templateId || null,
      start_time: config.startTime,
      end_time: config.endTime,
      tasks_json: config.tasks,
    }

    if (existing) {
      await supabase.from('active_timeline').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('active_timeline').insert(payload)
    }
  }

  const saveCustomThemesToDb = useDebouncedSave(async (themes) => {
    if (!schoolId) return
    await supabase.from('custom_themes').delete().eq('school_id', schoolId)

    for (const theme of themes) {
      await supabase.from('custom_themes').insert({
        id: theme.id,
        school_id: schoolId,
        name: theme.name,
        card_bg: theme.cardBg,
        card_border: theme.cardBorder,
        card_text: theme.cardText,
        card_time: theme.cardTime,
        card_radius: theme.cardRadius,
        card_shadow: theme.cardShadow,
        card_border_width: theme.cardBorderWidth,
        progress_bg: theme.progressBg,
        progress_fill: theme.progressFill,
        progress_height: theme.progressHeight,
        page_bg: theme.pageBg,
        page_gradient: theme.pageGradient,
        font_family: theme.fontFamily,
        dot_completed: theme.dotCompleted,
        dot_current: theme.dotCurrent,
        dot_upcoming: theme.dotUpcoming,
        emoji: theme.emoji,
      })
    }
  })

  // --- Wrapped setters that save to Supabase ---
  const updateDisplaySettings = useCallback((newSettings) => {
    setDisplaySettings(newSettings)
    if (initialLoadDone.current) saveDisplaySettingsToDb(newSettings, currentTheme)
  }, [schoolId, currentTheme])

  const updateCurrentTheme = useCallback((newTheme) => {
    setCurrentTheme(newTheme)
    if (initialLoadDone.current) saveDisplaySettingsToDb(displaySettings, newTheme)
  }, [schoolId, displaySettings])

  const updateTimelineConfig = useCallback((newConfig) => {
    setTimelineConfig(newConfig)
    if (initialLoadDone.current) {
      setHasUnsavedChanges(true)
      saveTimelineToDb(newConfig, activeTemplateId)
    }
  }, [schoolId, activeTemplateId])

  const updateTemplates = useCallback((newTemplates) => {
    setTemplates(newTemplates)
    if (initialLoadDone.current) setHasUnsavedChanges(true)
  }, [])

  const updateWeeklySchedule = useCallback((newSchedule) => {
    setWeeklySchedule(newSchedule)
    if (initialLoadDone.current) setHasUnsavedChanges(true)
  }, [])

  const updateCustomThemes = useCallback((newThemes) => {
    setCustomThemes(newThemes)
    if (initialLoadDone.current) saveCustomThemesToDb(newThemes)
  }, [schoolId])

  // --- Explicit save for templates, weekly schedule, and timeline ---
  const saveAll = useCallback(async () => {
    if (!schoolId) return
    setIsSaving(true)
    try {
      await Promise.all([
        saveTemplatesToDb(templates),
        saveWeeklyScheduleToDb(weeklySchedule),
        saveTimelineConfigToDb(timelineConfig, activeTemplateId),
      ])
      setHasUnsavedChanges(false)
    } catch (err) {
      console.error('Save failed:', err)
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [schoolId, templates, weeklySchedule, timelineConfig, activeTemplateId])

  // --- Warn before closing tab with unsaved changes ---
  useEffect(() => {
    if (!hasUnsavedChanges) return
    const handler = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasUnsavedChanges])

  // --- Auto-save changes back to source template ---
  useEffect(() => {
    if (!initialLoadDone.current) return
    if (activeTemplateId && templates.length > 0) {
      const templateIndex = templates.findIndex((t) => t.id === activeTemplateId)
      if (templateIndex !== -1) {
        const currentTemplate = templates[templateIndex]
        const hasChanges =
          currentTemplate.startTime !== timelineConfig.startTime ||
          JSON.stringify(currentTemplate.tasks) !== JSON.stringify(timelineConfig.tasks)
        if (hasChanges) {
          const updatedTemplates = [...templates]
          updatedTemplates[templateIndex] = {
            ...updatedTemplates[templateIndex],
            startTime: timelineConfig.startTime,
            endTime: timelineConfig.endTime,
            tasks: timelineConfig.tasks.map((task) => ({ ...task })),
          }
          updateTemplates(updatedTemplates)
        }
      }
    }
  }, [timelineConfig, activeTemplateId])

  // Backup export
  useEffect(() => {
    window.exportFullBackup = () => {
      try {
        const backupData = {
          version: '1.0',
          exportDate: new Date().toISOString(),
          taskTemplates: templates,
          currentTimelineConfig: timelineConfig,
          setupData: setupData,
          displaySettings: displaySettings,
          weeklySchedule: weeklySchedule,
          customThemes: customThemes,
          currentTheme: currentTheme,
        }
        const jsonString = JSON.stringify(backupData, null, 2)
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const date = new Date().toISOString().split('T')[0]
        const schoolName = (setupData?.schoolName || 'School').replace(/[^a-zA-Z0-9]/g, '_')
        const className = (setupData?.className || 'Class').replace(/[^a-zA-Z0-9]/g, '_')
        const filename = `${schoolName}-${className}-Backup-${date}.json`
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        return { success: true, filename }
      } catch (error) {
        console.error('Backup export failed:', error)
        return { success: false, error: error.message }
      }
    }
  }, [templates, timelineConfig, setupData, displaySettings, weeklySchedule, customThemes, currentTheme])

  // Restore backup handler
  const handleRestoreBackup = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.json')) {
      alert('Please select a valid JSON backup file.')
      event.target.value = ''
      return
    }
    if (!confirm('This will replace ALL current data with the backup. Are you sure?')) {
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const backupData = JSON.parse(e.target.result)
        if (!backupData.version || !backupData.exportDate) {
          throw new Error('Invalid backup file')
        }

        if (backupData.taskTemplates) updateTemplates(backupData.taskTemplates)
        if (backupData.currentTimelineConfig) updateTimelineConfig(backupData.currentTimelineConfig)
        if (backupData.displaySettings) updateDisplaySettings(backupData.displaySettings)
        if (backupData.weeklySchedule) updateWeeklySchedule(backupData.weeklySchedule)
        if (backupData.customThemes) updateCustomThemes(backupData.customThemes)
        if (backupData.currentTheme) updateCurrentTheme(backupData.currentTheme)

        if (backupData.setupData && schoolId) {
          const sd = backupData.setupData
          await supabase.from('schools').update({
            school_name: sd.schoolName,
            class_name: sd.className,
            teacher_name: sd.teacherName,
            device_name: sd.deviceName,
          }).eq('id', schoolId)
          setSetupData(sd)
        }

        alert(
          `Backup restored!\nExport date: ${new Date(backupData.exportDate).toLocaleString()}`
        )
      } catch (err) {
        alert('Failed to restore backup: ' + err.message)
      }
      event.target.value = ''
    }
    reader.readAsText(file)
  }

  // Setup handlers
  const handleCompleteSetup = async () => {
    if (setupData?.schoolName && setupData?.className && setupData?.teacherName) {
      const { data: newSchool, error } = await supabase
        .from('schools')
        .insert({
          owner_id: session.user.id,
          school_name: setupData.schoolName,
          class_name: setupData.className,
          teacher_name: setupData.teacherName,
          device_name: setupData.deviceName || 'Display 1',
        })
        .select()
        .single()

      if (error) {
        alert('Failed to save setup: ' + error.message)
        return
      }

      setSchoolId(newSchool.id)
      setSetupData({ ...setupData, setupComplete: true })
      setShowSetupWizard(false)

      await supabase.from('display_settings').insert({
        school_id: newSchool.id,
        current_theme: 'routine-ready',
      })

      const { data: defaultT } = await supabase
        .from('templates')
        .insert({
          school_id: newSchool.id,
          name: 'Template 1',
          start_time: '08:00',
          end_time: '10:30',
        })
        .select()
        .single()

      if (defaultT) {
        await supabase.from('tasks').insert(
          defaultTasks.map((task, i) => ({
            template_id: defaultT.id,
            sort_order: i,
            type: task.type,
            content: task.content,
            duration: task.duration,
            width: task.width,
            height: task.height,
          }))
        )

        setTemplates([{
          id: defaultT.id,
          name: 'Template 1',
          startTime: '08:00',
          endTime: '10:30',
          tasks: defaultTasks.map((t) => ({ ...t })),
        }])
      }

      await supabase.from('active_timeline').insert({
        school_id: newSchool.id,
        start_time: '08:00',
        end_time: '10:30',
        tasks_json: defaultTasks,
      })

      await supabase.from('weekly_schedules').insert({
        school_id: newSchool.id,
      })

      initialLoadDone.current = true
      alert('Setup complete! You can now configure your daily schedule.')
    } else {
      alert('Please complete all required fields.')
    }
  }

  const handleSkipSetup = async () => {
    const skipData = {
      schoolName: 'Not Configured',
      className: 'Not Configured',
      teacherName: 'Not Configured',
      deviceName: 'Display 1',
      setupComplete: true,
    }
    setSetupData(skipData)

    const { data: newSchool } = await supabase
      .from('schools')
      .insert({
        owner_id: session.user.id,
        school_name: 'Not Configured',
        class_name: 'Not Configured',
        teacher_name: 'Not Configured',
        device_name: 'Display 1',
      })
      .select()
      .single()

    if (newSchool) {
      setSchoolId(newSchool.id)
      await supabase.from('display_settings').insert({ school_id: newSchool.id, current_theme: 'routine-ready' })
      await supabase.from('active_timeline').insert({ school_id: newSchool.id, start_time: '08:00', end_time: '10:30', tasks_json: defaultTasks })
      await supabase.from('weekly_schedules').insert({ school_id: newSchool.id })
      initialLoadDone.current = true
    }

    setShowSetupWizard(false)
  }

  const handleResetSetup = async () => {
    if (
      confirm(
        'Are you sure you want to reset to default? This will clear all school information, templates, tasks, and weekly schedule.'
      )
    ) {
      if (schoolId) {
        await supabase.from('schools').delete().eq('id', schoolId)
      }

      setSchoolId(null)
      setCurrentTheme('routine-ready')
      setCustomThemes([])
      setWeeklySchedule(defaultWeeklySchedule)
      setActiveTemplateId(null)
      setTodaysTemplateName(null)
      setTemplates([{
        ...defaultTemplate,
        tasks: defaultTasks.map((t) => ({ ...t })),
      }])
      setTimelineConfig({
        ...defaultTimelineConfig,
        tasks: defaultTasks.map((t) => ({ ...t })),
      })
      setDisplaySettings(defaultDisplaySettings)
      setSetupData(defaultSetupData)
      setSetupStep(1)
      setShowSetupWizard(true)
      initialLoadDone.current = false
    }
  }

  const handleSignOut = () => {
    setSchoolId(null)
    setDataLoaded(false)
    setHasUnsavedChanges(false)
    initialLoadDone.current = false
  }

  return {
    dataLoaded,
    showSetupWizard,
    setShowSetupWizard,
    setupStep,
    setSetupStep,
    schoolId,
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
    handleSignOut,
  }
}
