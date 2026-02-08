import { useState, useEffect, useCallback, useRef } from 'react'
import { useTimelineProgress } from './hooks/useTimelineProgress'
import { useWeeklySchedule } from './hooks/useWeeklySchedule'
import { getActiveTheme } from './lib/themeUtils'
import { supabase } from './lib/supabase'
import {
  defaultTimelineConfig,
  defaultTemplate,
  defaultSetupData,
  defaultDisplaySettings,
  defaultWeeklySchedule,
  defaultTasks,
} from './data/defaults'
import AuthGate from './components/AuthGate'
import SetupWizard from './components/SetupWizard'
import DisplayView from './components/DisplayView'
import AdminPanel from './components/AdminPanel'

// Debounce helper for saving to Supabase
function useDebouncedSave(saveFn, delay = 800) {
  const timeoutRef = useRef(null)
  const saveFnRef = useRef(saveFn)
  saveFnRef.current = saveFn

  return useCallback((...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => saveFnRef.current(...args), delay)
  }, [delay])
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [showSetupWizard, setShowSetupWizard] = useState(false)
  const [setupStep, setSetupStep] = useState(1)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Supabase state
  const [session, setSession] = useState(null)
  const [schoolId, setSchoolId] = useState(null)

  // App state (loaded from Supabase)
  const [timelineConfig, setTimelineConfig] = useState(defaultTimelineConfig)
  const [templates, setTemplates] = useState([defaultTemplate])
  const [setupData, setSetupData] = useState(null)
  const [displaySettings, setDisplaySettings] = useState(defaultDisplaySettings)
  const [currentTheme, setCurrentTheme] = useState('ocean-calm')
  const [customThemes, setCustomThemes] = useState([])
  const [weeklySchedule, setWeeklySchedule] = useState(defaultWeeklySchedule)

  // Non-persisted state
  const [activeTemplateId, setActiveTemplateId] = useState(null)
  const [todaysTemplateName, setTodaysTemplateName] = useState(null)

  // Track whether initial load is done to avoid saving defaults back to DB
  const initialLoadDone = useRef(false)

  // --- Auth listener ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

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
      // Check if there's localStorage data to migrate
      const localSetup = localStorage.getItem('setupData')
      const parsedSetup = localSetup ? JSON.parse(localSetup) : null

      if (parsedSetup?.setupComplete) {
        // Migrate localStorage setup data to Supabase
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
        // No school at all — show setup wizard
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
      setCurrentTheme(ds.current_theme || 'ocean-calm')
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

  // --- Migrate localStorage data to Supabase ---
  const migrateLocalStorageToSupabase = async (sId) => {
    // Display settings
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
        current_theme: localStorage.getItem('currentTheme') || 'ocean-calm',
      })
    }

    // Templates + tasks
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

    // Active timeline
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

    // Weekly schedule
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

    // Custom themes
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

  const clearLocalStorage = () => {
    localStorage.removeItem('setupData')
    localStorage.removeItem('taskTemplates')
    localStorage.removeItem('currentTimelineConfig')
    localStorage.removeItem('currentTheme')
    localStorage.removeItem('customThemes')
    localStorage.removeItem('weeklySchedule')
    localStorage.removeItem('displaySettings')
  }

  // --- Debounced Supabase save functions ---
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

  const saveTemplatesToDb = useDebouncedSave(async (allTemplates) => {
    if (!schoolId) return
    // Delete existing templates and re-insert
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
  })

  const saveWeeklyScheduleToDb = useDebouncedSave(async (schedule) => {
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
  })

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
    if (initialLoadDone.current) saveTimelineToDb(newConfig, activeTemplateId)
  }, [schoolId, activeTemplateId])

  const updateTemplates = useCallback((newTemplates) => {
    setTemplates(newTemplates)
    if (initialLoadDone.current) saveTemplatesToDb(newTemplates)
  }, [schoolId])

  const updateWeeklySchedule = useCallback((newSchedule) => {
    setWeeklySchedule(newSchedule)
    if (initialLoadDone.current) saveWeeklyScheduleToDb(newSchedule)
  }, [schoolId])

  const updateCustomThemes = useCallback((newThemes) => {
    setCustomThemes(newThemes)
    if (initialLoadDone.current) saveCustomThemesToDb(newThemes)
  }, [schoolId])

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

        // Apply to state — the wrapped setters will save to Supabase
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
      // Save school to Supabase
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

      // Create default display settings
      await supabase.from('display_settings').insert({
        school_id: newSchool.id,
        current_theme: 'ocean-calm',
      })

      // Create default template
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

      // Create default active timeline
      await supabase.from('active_timeline').insert({
        school_id: newSchool.id,
        start_time: '08:00',
        end_time: '10:30',
        tasks_json: defaultTasks,
      })

      // Create default weekly schedule
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
      await supabase.from('display_settings').insert({ school_id: newSchool.id, current_theme: 'ocean-calm' })
      await supabase.from('active_timeline').insert({ school_id: newSchool.id, start_time: '08:00', end_time: '10:30', tasks_json: defaultTasks })
      await supabase.from('weekly_schedules').insert({ school_id: newSchool.id })
      initialLoadDone.current = true
    }

    setShowSetupWizard(false)
  }

  const handleEditSetup = () => {
    setSetupStep(2)
    setShowSetupWizard(true)
    setIsAdmin(false)
  }

  const handleResetSetup = async () => {
    if (
      confirm(
        'Are you sure you want to reset to default? This will clear all school information, templates, tasks, and weekly schedule.'
      )
    ) {
      if (schoolId) {
        // Delete school — cascades to all related tables
        await supabase.from('schools').delete().eq('id', schoolId)
      }

      setSchoolId(null)
      setCurrentTheme('ocean-calm')
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
      setIsAdmin(false)
      initialLoadDone.current = false
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setSchoolId(null)
    setDataLoaded(false)
    initialLoadDone.current = false
  }

  const theme = getActiveTheme(currentTheme, customThemes)

  // Show loading while fetching data from Supabase
  if (session && !dataLoaded) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
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
          onExitAdmin={() => setIsAdmin(false)}
          onEditSetup={handleEditSetup}
          onResetSetup={handleResetSetup}
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
