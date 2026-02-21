import { Fragment } from 'react'
import { Clock } from 'lucide-react'
import { getIconComponent } from '../../data/iconLibrary'
import { getFontStyle } from '../../lib/themeUtils'
import { calculateEndTime } from '../../lib/timeUtils'
import TransitionIndicator from './TransitionIndicator'

export default function TimelineRow({
  tasks,
  startIdx,
  endIdx,
  rowIndex,
  theme,
  displaySettings,
  timelineConfig,
  currentTaskIndex,
  elapsedInTask,
}) {
  const isSnake = displaySettings.pathDirection === 'snake'
  const isReverse = isSnake && rowIndex % 2 === 1
  const rowTasks = tasks.slice(startIdx, endIdx)
  if (isReverse) rowTasks.reverse()

  const showStartClock = !isReverse && rowIndex === 0
  const showEndClock =
    (isReverse && rowIndex === displaySettings.rows - 1) ||
    (!isReverse && endIdx >= timelineConfig.tasks.length)

  return (
    <div className="flex items-center gap-4 w-full" key={rowIndex}>
      {showStartClock && (
        <div
          className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg p-4 min-w-[120px] flex-shrink-0"
          style={{ borderLeft: `4px solid ${theme.timeCardAccentColor}` }}
        >
          <Clock className="w-10 h-10 mb-2" style={{ color: theme.timeCardAccentColor }} />
          <div className="text-4xl font-bold text-gray-800">{timelineConfig.startTime}</div>
          <div className="text-sm text-gray-600 mt-1">Start</div>
        </div>
      )}

      {rowTasks.map((task, localIndex) => {
        const actualIndex = isReverse ? endIdx - 1 - localIndex : startIdx + localIndex
        const isCurrentTask = actualIndex === currentTaskIndex
        const isPastTask = actualIndex < currentTaskIndex
        const taskWidth = task.width || 200
        const taskHeight = task.height || 160
        const transitionWidth = taskWidth * 1.2
        const IconComponent = task.icon ? getIconComponent(task.icon) : null
        const taskCardBorder =
          theme.cardBorderColorAlt && actualIndex % 2 === 1
            ? theme.cardBorderColorAlt
            : theme.cardBorderColor

        return (
          <Fragment key={task.id}>
            <div
              className={`flex flex-col items-center justify-center ${theme.cardRounded} shadow-lg p-4 transition-all duration-1000 ${isPastTask ? 'opacity-60' : ''} ${isCurrentTask ? 'scale-105' : ''}`}
              style={{
                minWidth: `${taskWidth * 0.8}px`,
                width: `${taskWidth * 0.8}px`,
                minHeight: `${taskHeight * 0.8}px`,
                backgroundColor: isCurrentTask
                  ? theme.currentBgOverlay
                  : isPastTask
                    ? '#f3f4f6'
                    : theme.cardBgColor,
                border:
                  isCurrentTask && theme.currentBorderEnhance
                    ? `${parseInt(theme.cardBorderWidth) * 1.5}px solid ${theme.currentGlowColor}`
                    : `${theme.cardBorderWidth} solid ${taskCardBorder}`,
                boxShadow: isCurrentTask ? `0 0 25px ${theme.currentGlowColor}` : undefined,
              }}
            >
              {task.type === 'image' && task.imageUrl ? (
                <img
                  src={task.imageUrl}
                  alt={task.content}
                  className="object-cover rounded-lg mb-2"
                  style={{
                    width: `${Math.min(taskWidth * 0.6, 96)}px`,
                    height: `${Math.min(taskHeight * 0.5, 96)}px`,
                  }}
                />
              ) : (
                <>
                  {IconComponent && (
                    <IconComponent
                      className="mb-2"
                      style={{
                        color: theme.cardBorderColor,
                        width: `${Math.min(taskWidth * 0.4, 64)}px`,
                        height: `${Math.min(taskWidth * 0.4, 64)}px`,
                      }}
                    />
                  )}
                  <div
                    className="text-gray-800 text-center mb-2"
                    style={getFontStyle(theme, Math.min(taskWidth / 6, 28))}
                  >
                    {task.content}
                  </div>
                </>
              )}
              <div
                className="text-gray-600"
                style={{ fontSize: `${Math.min(taskWidth / 12, 18)}px` }}
              >
                {task.duration} min
              </div>
            </div>

            <TransitionIndicator
              transitionType={displaySettings.transitionType}
              taskDuration={task.duration}
              elapsed={elapsedInTask}
              isPast={isPastTask}
              isActive={isCurrentTask}
              mascotImage={displaySettings.mascotImage}
              width={transitionWidth}
              theme={theme}
              selectedSprite={displaySettings.selectedSprite}
              selectedSurface={displaySettings.selectedSurface}
              roadHeight={displaySettings.roadHeight}
            />
          </Fragment>
        )
      })}

      {showEndClock && (
        <div
          className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg p-4 min-w-[120px] flex-shrink-0"
          style={{
            borderLeft: `4px solid ${theme.timeCardAccentColorAlt || theme.timeCardAccentColor}`,
          }}
        >
          <Clock
            className="w-10 h-10 mb-2"
            style={{ color: theme.timeCardAccentColorAlt || theme.timeCardAccentColor }}
          />
          <div className="text-4xl font-bold text-gray-800">
            {calculateEndTime(timelineConfig.startTime, timelineConfig.tasks)}
          </div>
          <div className="text-sm text-gray-600 mt-1">End</div>
        </div>
      )}
    </div>
  )
}
