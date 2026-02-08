export function getTotalDuration(tasks) {
  return tasks.reduce((sum, task) => sum + task.duration, 0)
}

export function calculateEndTime(startTime, tasks) {
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = getTotalDuration(tasks)
  const endMinutes = hours * 60 + minutes + totalMinutes
  const endHours = Math.floor(endMinutes / 60) % 24
  const endMins = endMinutes % 60
  return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
}

export function getCurrentTaskProgress(currentTime, timelineConfig) {
  const now = currentTime
  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()

  const [startHour, startMinute] = timelineConfig.startTime.split(':').map(Number)
  const startSeconds = startHour * 3600 + startMinute * 60

  const elapsedSeconds = currentSeconds - startSeconds

  if (elapsedSeconds < 0) return { currentTaskIndex: -1, elapsedInTask: 0 }

  let accumulatedTime = 0
  for (let i = 0; i < timelineConfig.tasks.length; i++) {
    const taskDurationSeconds = timelineConfig.tasks[i].duration * 60
    if (elapsedSeconds < accumulatedTime + taskDurationSeconds) {
      return {
        currentTaskIndex: i,
        elapsedInTask: (elapsedSeconds - accumulatedTime) / 60,
      }
    }
    accumulatedTime += taskDurationSeconds
  }

  return { currentTaskIndex: timelineConfig.tasks.length, elapsedInTask: 0 }
}

export function getDayKey(dayNumber) {
  const dayMap = { 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday' }
  return dayMap[dayNumber] || null
}

export function getProgressPercentage(isPast, isActive, elapsed, taskDuration) {
  if (isPast) return 100
  if (isActive) return Math.min(100, (elapsed / taskDuration) * 100)
  return 0
}

export function getDotColor(theme, isPast, isActive) {
  if (isPast) return theme.tickPastColor
  if (isActive) return theme.tickCurrentColor
  return theme.tickFutureColor
}

export function readFileAsDataURL(file, onLoad) {
  if (!file) return
  const reader = new FileReader()
  reader.onloadend = () => onLoad(reader.result)
  reader.readAsDataURL(file)
}
