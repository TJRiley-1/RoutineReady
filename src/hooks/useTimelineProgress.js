import { useState, useEffect } from 'react'
import { getCurrentTaskProgress } from '../lib/timeUtils'

export function useTimelineProgress(timelineConfig) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 50)
    return () => clearInterval(timer)
  }, [])

  const { currentTaskIndex, elapsedInTask } = getCurrentTaskProgress(currentTime, timelineConfig)

  return { currentTime, currentTaskIndex, elapsedInTask }
}
