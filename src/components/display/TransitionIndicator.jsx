import ProgressLine from './ProgressLine'
import MascotRoad from './MascotRoad'

export default function TransitionIndicator({
  transitionType,
  taskDuration,
  elapsed,
  isPast,
  isActive,
  mascotImage,
  width,
  theme,
}) {
  if (transitionType === 'mascot') {
    return (
      <MascotRoad
        taskDuration={taskDuration}
        elapsed={isActive ? elapsed : 0}
        isPast={isPast}
        isActive={isActive}
        mascotImg={mascotImage}
        roadWidth={width}
      />
    )
  }

  return (
    <ProgressLine
      taskDuration={taskDuration}
      elapsed={isActive ? elapsed : 0}
      isPast={isPast}
      isActive={isActive}
      lineWidth={width}
      theme={theme}
    />
  )
}
