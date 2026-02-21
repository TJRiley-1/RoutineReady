import ProgressLine from './ProgressLine'
import MascotRoad from './MascotRoad'
import { getSpriteEmoji, getSurfaceGradient, getSurfaceDashColor } from '../../data/transitionPresets'

export default function TransitionIndicator({
  transitionType,
  taskDuration,
  elapsed,
  isPast,
  isActive,
  mascotImage,
  width,
  theme,
  selectedSprite,
  selectedSurface,
  roadHeight,
}) {
  if (transitionType === 'mascot') {
    const spriteEmoji = getSpriteEmoji(selectedSprite || 'penguin')
    const surfaceGradient = getSurfaceGradient(selectedSurface || 'ice')
    const dashColor = getSurfaceDashColor(selectedSurface || 'ice')

    return (
      <MascotRoad
        taskDuration={taskDuration}
        elapsed={isActive ? elapsed : 0}
        isPast={isPast}
        isActive={isActive}
        mascotImg={mascotImage}
        roadWidth={width}
        surfaceGradient={surfaceGradient}
        roadHeight={roadHeight || 32}
        spriteEmoji={spriteEmoji}
        dashColor={dashColor}
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
