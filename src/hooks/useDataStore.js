import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

// Debounce helper
function useDebouncedCallback(callback, delay) {
  const timeoutRef = useRef(null)
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  return useCallback((...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => callbackRef.current(...args), delay)
  }, [delay])
}

export function useDataStore() {
  const [session, setSession] = useState(null)
  const [school, setSchool] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load school for current user
  useEffect(() => {
    if (!session?.user) {
      setSchool(null)
      setIsLoading(false)
      return
    }
    loadSchool()
  }, [session?.user?.id])

  const loadSchool = async () => {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('owner_id', session.user.id)
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to load school:', error)
    }
    setSchool(data || null)
    setIsLoading(false)
  }

  // --- School ---
  const saveSchool = async (schoolData) => {
    if (!session?.user) return
    if (school) {
      const { data, error } = await supabase
        .from('schools')
        .update(schoolData)
        .eq('id', school.id)
        .select()
        .single()
      if (!error) setSchool(data)
      return { data, error }
    } else {
      const { data, error } = await supabase
        .from('schools')
        .insert({ ...schoolData, owner_id: session.user.id })
        .select()
        .single()
      if (!error) setSchool(data)
      return { data, error }
    }
  }

  // --- Display Settings ---
  const loadDisplaySettings = async () => {
    if (!school) return null
    const { data } = await supabase
      .from('display_settings')
      .select('*')
      .eq('school_id', school.id)
      .limit(1)
      .single()
    return data
  }

  const saveDisplaySettings = useDebouncedCallback(async (settings) => {
    if (!school) return
    const payload = { ...settings, school_id: school.id }
    const { data: existing } = await supabase
      .from('display_settings')
      .select('id')
      .eq('school_id', school.id)
      .limit(1)
      .single()

    if (existing) {
      await supabase.from('display_settings').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('display_settings').insert(payload)
    }
  }, 500)

  // --- Templates ---
  const loadTemplates = async () => {
    if (!school) return []
    const { data: templates } = await supabase
      .from('templates')
      .select('*')
      .eq('school_id', school.id)
      .order('created_at')

    if (!templates) return []

    // Load tasks for each template
    for (const template of templates) {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('template_id', template.id)
        .order('sort_order')
      template.tasks = tasks || []
    }
    return templates
  }

  const saveTemplate = async (template) => {
    if (!school) return
    const { tasks, ...templateData } = template
    const payload = { ...templateData, school_id: school.id }

    let templateId = template.id
    const { data: existing } = await supabase
      .from('templates')
      .select('id')
      .eq('id', template.id)
      .limit(1)
      .single()

    if (existing) {
      await supabase.from('templates').update(payload).eq('id', template.id)
    } else {
      const { data } = await supabase
        .from('templates')
        .insert(payload)
        .select()
        .single()
      if (data) templateId = data.id
    }

    // Replace all tasks
    if (tasks && templateId) {
      await supabase.from('tasks').delete().eq('template_id', templateId)
      if (tasks.length > 0) {
        const taskRows = tasks.map((task, i) => ({
          ...task,
          template_id: templateId,
          sort_order: i,
          id: undefined, // let DB generate
        }))
        await supabase.from('tasks').insert(taskRows)
      }
    }
  }

  const deleteTemplate = async (templateId) => {
    await supabase.from('tasks').delete().eq('template_id', templateId)
    await supabase.from('templates').delete().eq('id', templateId)
  }

  // --- Weekly Schedule ---
  const loadWeeklySchedule = async () => {
    if (!school) return null
    const { data } = await supabase
      .from('weekly_schedules')
      .select('*')
      .eq('school_id', school.id)
      .limit(1)
      .single()
    return data
  }

  const saveWeeklySchedule = useDebouncedCallback(async (schedule) => {
    if (!school) return
    const payload = { ...schedule, school_id: school.id }
    const { data: existing } = await supabase
      .from('weekly_schedules')
      .select('id')
      .eq('school_id', school.id)
      .limit(1)
      .single()

    if (existing) {
      await supabase.from('weekly_schedules').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('weekly_schedules').insert(payload)
    }
  }, 500)

  // --- Custom Themes ---
  const loadCustomThemes = async () => {
    if (!school) return []
    const { data } = await supabase
      .from('custom_themes')
      .select('*')
      .eq('school_id', school.id)
      .order('created_at')
    return data || []
  }

  const saveCustomTheme = async (theme) => {
    if (!school) return
    const payload = { ...theme, school_id: school.id }
    const { data: existing } = await supabase
      .from('custom_themes')
      .select('id')
      .eq('id', theme.id)
      .limit(1)
      .single()

    if (existing) {
      await supabase.from('custom_themes').update(payload).eq('id', theme.id)
    } else {
      await supabase.from('custom_themes').insert(payload)
    }
  }

  const deleteCustomTheme = async (themeId) => {
    await supabase.from('custom_themes').delete().eq('id', themeId)
  }

  // --- Active Timeline ---
  const loadActiveTimeline = async () => {
    if (!school) return null
    const { data } = await supabase
      .from('active_timeline')
      .select('*')
      .eq('school_id', school.id)
      .limit(1)
      .single()
    return data
  }

  const saveActiveTimeline = useDebouncedCallback(async (config) => {
    if (!school) return
    const payload = { ...config, school_id: school.id }
    const { data: existing } = await supabase
      .from('active_timeline')
      .select('id')
      .eq('school_id', school.id)
      .limit(1)
      .single()

    if (existing) {
      await supabase.from('active_timeline').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('active_timeline').insert(payload)
    }
  }, 500)

  // --- Sign out ---
  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setSchool(null)
  }

  return {
    isAuthenticated: !!session,
    isLoading,
    user: session?.user || null,
    school,
    saveSchool,
    loadDisplaySettings,
    saveDisplaySettings,
    loadTemplates,
    saveTemplate,
    deleteTemplate,
    loadWeeklySchedule,
    saveWeeklySchedule,
    loadCustomThemes,
    saveCustomTheme,
    deleteCustomTheme,
    loadActiveTimeline,
    saveActiveTimeline,
    signOut,
  }
}
