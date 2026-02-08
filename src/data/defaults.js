export const defaultTask = {
  type: 'text',
  content: 'New Task',
  duration: 30,
  imageUrl: null,
  icon: null,
  width: 200,
  height: 160,
}

export const defaultTasks = [
  { id: 1, type: 'text', content: 'Task 1', duration: 30, imageUrl: null, icon: null, width: 200, height: 160 },
  { id: 2, type: 'text', content: 'Task 2', duration: 30, imageUrl: null, icon: null, width: 200, height: 160 },
  { id: 3, type: 'text', content: 'Task 3', duration: 30, imageUrl: null, icon: null, width: 200, height: 160 },
  { id: 4, type: 'text', content: 'Task 4', duration: 30, imageUrl: null, icon: null, width: 200, height: 160 },
  { id: 5, type: 'text', content: 'Task 5', duration: 30, imageUrl: null, icon: null, width: 200, height: 160 },
]

export const defaultTimelineConfig = {
  startTime: '08:00',
  endTime: '10:30',
  tasks: defaultTasks,
}

export const defaultTemplate = {
  id: 'default',
  name: 'Template 1',
  startTime: '08:00',
  endTime: '10:30',
  tasks: [...defaultTasks],
}

export const defaultSetupData = {
  schoolName: '',
  className: '',
  teacherName: '',
  deviceName: '',
  setupComplete: false,
}

export const defaultDisplaySettings = {
  width: 2560,
  height: 1080,
  scale: 100,
  mode: 'horizontal',
  rows: 1,
  pathDirection: 'sequential',
  transitionType: 'progress-line',
  mascotImage: null,
  topBannerImage: null,
  bottomBannerImage: null,
  showClock: false,
  autoPanTileHeight: 60,
}

export const defaultWeeklySchedule = {
  monday: null,
  tuesday: null,
  wednesday: null,
  thursday: null,
  friday: null,
}
