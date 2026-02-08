import { useEffect, useRef } from 'react'
import { getDayKey } from '../lib/timeUtils'

export function useWeeklySchedule({
  weeklySchedule,
  templates,
  isAdmin,
  setTimelineConfig,
  setActiveTemplateId,
  setTodaysTemplateName,
}) {
  const hasLoadedInitialTemplate = useRef(false)

  useEffect(() => {
    if (isAdmin || hasLoadedInitialTemplate.current) return
    if (templates.length === 0) return

    const loadTodaysTemplate = () => {
      const today = new Date().getDay()
      const dayKey = getDayKey(today)

      if (dayKey && weeklySchedule[dayKey]) {
        const templateId = weeklySchedule[dayKey]
        const template = templates.find((t) => t.id === templateId)
        if (template) {
          setTimelineConfig({
            startTime: template.startTime,
            endTime: template.endTime,
            tasks: template.tasks.map((task) => ({ ...task, id: Date.now() + Math.random() })),
          })
          setActiveTemplateId(template.id)
          setTodaysTemplateName(template.name)
        }
      }
    }

    loadTodaysTemplate()
    hasLoadedInitialTemplate.current = true

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const msUntilMidnight = tomorrow.getTime() - now.getTime()

    const midnightTimer = setTimeout(() => {
      hasLoadedInitialTemplate.current = false
      window.location.reload()
    }, msUntilMidnight)

    return () => clearTimeout(midnightTimer)
  }, [])
}
