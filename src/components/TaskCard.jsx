import { getIconComponent } from '../data/iconLibrary'
import { getFontStyle } from '../lib/themeUtils'

export default function TaskCard({ task, theme, isCurrentTask, isPastTask, scaleFactor = 1 }) {
  const taskWidth = task.width || 200
  const taskHeight = task.height || 160
  const IconComponent = task.icon ? getIconComponent(task.icon) : null

  const taskCardBorder =
    theme.cardBorderColorAlt && task._index % 2 === 1
      ? theme.cardBorderColorAlt
      : theme.cardBorderColor

  return (
    <div
      className={`flex flex-col items-center justify-center ${theme.cardRounded} shadow-lg p-6 transition-all duration-1000 ${isPastTask ? 'opacity-60' : ''} ${isCurrentTask ? 'scale-105' : ''}`}
      style={{
        minWidth: `${taskWidth * scaleFactor}px`,
        width: `${taskWidth * scaleFactor}px`,
        minHeight: `${taskHeight * scaleFactor}px`,
        backgroundColor: isCurrentTask
          ? theme.currentBgOverlay
          : isPastTask
            ? '#f3f4f6'
            : theme.cardBgColor,
        border:
          isCurrentTask && theme.currentBorderEnhance
            ? `${parseInt(theme.cardBorderWidth) * 1.5}px solid ${theme.currentGlowColor}`
            : `${theme.cardBorderWidth} solid ${taskCardBorder}`,
        boxShadow: isCurrentTask ? `0 0 30px ${theme.currentGlowColor}` : undefined,
      }}
    >
      {task.type === 'image' && task.imageUrl ? (
        <img
          src={task.imageUrl}
          alt={task.content}
          className="object-cover rounded-lg mb-3"
          style={{
            width: `${Math.min(taskWidth * 0.7 * scaleFactor, 128)}px`,
            height: `${Math.min(taskHeight * 0.6 * scaleFactor, 128)}px`,
          }}
        />
      ) : (
        <>
          {IconComponent && (
            <IconComponent
              className="text-indigo-600 mb-3"
              style={{
                width: `${Math.min(taskWidth * 0.5 * scaleFactor, 80)}px`,
                height: `${Math.min(taskWidth * 0.5 * scaleFactor, 80)}px`,
              }}
            />
          )}
          <div
            className="text-gray-800 text-center mb-3"
            style={getFontStyle(theme, Math.min((taskWidth * scaleFactor) / 5, 36))}
          >
            {task.content}
          </div>
        </>
      )}
      <div
        className="text-gray-600"
        style={{ fontSize: `${Math.min((taskWidth * scaleFactor) / 10, 20)}px` }}
      >
        {task.duration} min
      </div>
    </div>
  )
}
