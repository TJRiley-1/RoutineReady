import { Fragment } from 'react'
import { Clock } from 'lucide-react'
import { getIconComponent } from '../data/iconLibrary'
import { getFontStyle, getBackgroundStyle } from '../lib/themeUtils'
import { calculateEndTime } from '../lib/timeUtils'
import TransitionIndicator from './TransitionIndicator'
import TimelineRow from './TimelineRow'

export default function DisplayView({
  timelineConfig,
  displaySettings,
  theme,
  currentTaskIndex,
  elapsedInTask,
  currentTime,
  todaysTemplateName,
  onEnterAdmin,
}) {
  const scaleFactor = displaySettings.scale / 100
  const bgStyle = getBackgroundStyle(theme)

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: bgStyle }}
    >
      <button
        onClick={onEnterAdmin}
        className="absolute top-4 right-4 px-6 py-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all hover:bg-gray-50 z-50 flex items-center gap-2 font-semibold text-gray-700"
        aria-label="Settings"
      >
        <span className="text-2xl">⚙️</span>
        <span>Admin</span>
      </button>

      {todaysTemplateName && (
        <div className="absolute top-4 left-4 px-4 py-2 bg-white/90 rounded-lg shadow-md z-50">
          <div className="text-xs text-gray-500">Today's Schedule</div>
          <div className="text-sm font-semibold text-gray-700">{todaysTemplateName}</div>
        </div>
      )}

      <div
        className="absolute top-0 left-0"
        style={{
          background: bgStyle,
          width: `${displaySettings.width}px`,
          height: `${displaySettings.height}px`,
          transform: `scale(${scaleFactor})`,
          transformOrigin: 'top left',
        }}
      >
        <div className="w-full h-full flex items-center px-8 py-16">
          {displaySettings.mode === 'horizontal' ? (
            <HorizontalTimeline
              timelineConfig={timelineConfig}
              displaySettings={displaySettings}
              theme={theme}
              currentTaskIndex={currentTaskIndex}
              elapsedInTask={elapsedInTask}
            />
          ) : displaySettings.mode === 'multi-row' ? (
            <MultiRowTimeline
              timelineConfig={timelineConfig}
              displaySettings={displaySettings}
              theme={theme}
              currentTaskIndex={currentTaskIndex}
              elapsedInTask={elapsedInTask}
            />
          ) : (
            <AutoPanTimeline
              timelineConfig={timelineConfig}
              displaySettings={displaySettings}
              theme={theme}
              currentTaskIndex={currentTaskIndex}
              elapsedInTask={elapsedInTask}
              currentTime={currentTime}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function HorizontalTimeline({ timelineConfig, displaySettings, theme, currentTaskIndex, elapsedInTask }) {
  return (
    <div className="w-full h-full flex items-center gap-4 overflow-x-auto">
      <div
        className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg p-6 min-w-[140px]"
        style={{ borderLeft: `6px solid ${theme.timeCardAccentColor}` }}
      >
        <Clock className="w-12 h-12 mb-3" style={{ color: theme.timeCardAccentColor }} />
        <div className="text-5xl font-bold text-gray-800">{timelineConfig.startTime}</div>
        <div className="text-lg text-gray-600 mt-2">Start</div>
      </div>

      {timelineConfig.tasks.map((task, index) => {
        const isCurrentTask = index === currentTaskIndex
        const isPastTask = index < currentTaskIndex
        const taskWidth = task.width || 200
        const taskHeight = task.height || 160
        const transitionWidth = taskWidth * 1.5
        const IconComponent = task.icon ? getIconComponent(task.icon) : null
        const taskCardBorder =
          theme.cardBorderColorAlt && index % 2 === 1
            ? theme.cardBorderColorAlt
            : theme.cardBorderColor

        return (
          <Fragment key={task.id}>
            <div
              className={`flex flex-col items-center justify-center ${theme.cardRounded} shadow-lg p-6 transition-all duration-1000 ${isPastTask ? 'opacity-60' : ''} ${isCurrentTask ? 'scale-105' : ''}`}
              style={{
                minWidth: `${taskWidth}px`,
                width: `${taskWidth}px`,
                minHeight: `${taskHeight}px`,
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
                    width: `${Math.min(taskWidth * 0.7, 128)}px`,
                    height: `${Math.min(taskHeight * 0.6, 128)}px`,
                  }}
                />
              ) : (
                <>
                  {IconComponent && (
                    <IconComponent
                      className="text-indigo-600 mb-3"
                      style={{
                        width: `${Math.min(taskWidth * 0.5, 80)}px`,
                        height: `${Math.min(taskWidth * 0.5, 80)}px`,
                      }}
                    />
                  )}
                  <div
                    className="text-gray-800 text-center mb-3"
                    style={getFontStyle(theme, Math.min(taskWidth / 5, 36))}
                  >
                    {task.content}
                  </div>
                </>
              )}
              <div
                className="text-gray-600"
                style={{ fontSize: `${Math.min(taskWidth / 10, 20)}px` }}
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
            />
          </Fragment>
        )
      })}

      <div
        className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg p-6 min-w-[140px]"
        style={{
          borderLeft: `6px solid ${theme.timeCardAccentColorAlt || theme.timeCardAccentColor}`,
        }}
      >
        <Clock
          className="w-12 h-12 mb-3"
          style={{ color: theme.timeCardAccentColorAlt || theme.timeCardAccentColor }}
        />
        <div className="text-5xl font-bold text-gray-800">
          {calculateEndTime(timelineConfig.startTime, timelineConfig.tasks)}
        </div>
        <div className="text-lg text-gray-600 mt-2">End</div>
      </div>
    </div>
  )
}

function MultiRowTimeline({ timelineConfig, displaySettings, theme, currentTaskIndex, elapsedInTask }) {
  return (
    <div className="w-full h-full flex flex-col justify-evenly">
      {Array.from({ length: displaySettings.rows }).map((_, rowIndex) => {
        const tasksPerRow = Math.ceil(timelineConfig.tasks.length / displaySettings.rows)
        const startIdx = rowIndex * tasksPerRow
        const endIdx = Math.min((rowIndex + 1) * tasksPerRow, timelineConfig.tasks.length)

        if (startIdx >= timelineConfig.tasks.length) return null

        return (
          <TimelineRow
            key={rowIndex}
            tasks={timelineConfig.tasks}
            startIdx={startIdx}
            endIdx={endIdx}
            rowIndex={rowIndex}
            theme={theme}
            displaySettings={displaySettings}
            timelineConfig={timelineConfig}
            currentTaskIndex={currentTaskIndex}
            elapsedInTask={elapsedInTask}
          />
        )
      })}
    </div>
  )
}

function AutoPanTimeline({ timelineConfig, displaySettings, theme, currentTaskIndex, elapsedInTask, currentTime }) {
  const currentTask = timelineConfig.tasks[currentTaskIndex]
  const nextTask = timelineConfig.tasks[currentTaskIndex + 1]
  const CurrentIcon = currentTask?.icon ? getIconComponent(currentTask.icon) : null
  const NextIcon = nextTask?.icon ? getIconComponent(nextTask.icon) : null

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top Banner */}
      {(displaySettings.topBannerImage || displaySettings.showClock) && (
        <div className="flex items-center justify-center py-4 bg-gradient-to-r from-indigo-500 to-purple-600">
          {displaySettings.topBannerImage && (
            <img src={displaySettings.topBannerImage} alt="Top Banner" className="max-h-20 object-contain" />
          )}
          {displaySettings.showClock && (
            <div className="text-4xl font-bold text-white ml-8">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      )}

      {/* Main Task Display Area */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div
          className="w-full flex items-stretch gap-4"
          style={{ height: `${displaySettings.autoPanTileHeight}%` }}
        >
          {/* Current Task */}
          <div
            className={`flex flex-col items-center justify-center ${theme.cardRounded} shadow-2xl p-8`}
            style={{
              flex: '1',
              backgroundColor: theme.currentBgOverlay,
              border: theme.currentBorderEnhance
                ? `${parseInt(theme.cardBorderWidth) * 2}px solid ${theme.currentGlowColor}`
                : `${parseInt(theme.cardBorderWidth) * 2}px solid ${theme.cardBorderColor}`,
              boxShadow: `0 0 40px ${theme.currentGlowColor}`,
            }}
          >
            {currentTask ? (
              <>
                <div className="text-sm font-semibold mb-4" style={{ color: theme.currentGlowColor }}>
                  CURRENT TASK
                </div>
                {currentTask.type === 'image' && currentTask.imageUrl ? (
                  <img
                    src={currentTask.imageUrl}
                    alt={currentTask.content}
                    className="object-contain rounded-lg mb-4"
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                  />
                ) : (
                  CurrentIcon && (
                    <CurrentIcon className="text-indigo-600 mb-4" style={{ width: '80px', height: '80px' }} />
                  )
                )}
                <div className="text-gray-800 text-center" style={getFontStyle(theme, 36)}>
                  {currentTask.content}
                </div>
                <div className="text-2xl text-gray-600 mt-4">{currentTask.duration} min</div>
              </>
            ) : (
              <div className="text-2xl text-gray-500">No current task</div>
            )}
          </div>

          {/* Transition Indicator */}
          <div className="flex flex-col items-center justify-center" style={{ flex: '3' }}>
            <TransitionIndicator
              transitionType={displaySettings.transitionType}
              taskDuration={currentTask?.duration || 30}
              elapsed={elapsedInTask}
              isPast={false}
              isActive={true}
              mascotImage={displaySettings.mascotImage}
              width={displaySettings.width * 0.5}
              theme={theme}
            />
            <div className="mt-8 text-3xl font-bold text-gray-700">
              {Math.max(0, Math.floor((currentTask?.duration || 0) - elapsedInTask))} min remaining
            </div>
          </div>

          {/* Next Task */}
          <div
            className={`flex flex-col items-center justify-center ${theme.cardRounded} shadow-lg p-8`}
            style={{
              flex: '1',
              backgroundColor: theme.cardBgColor,
              border: `${theme.cardBorderWidth} solid ${theme.cardBorderColor}`,
            }}
          >
            {nextTask ? (
              <>
                <div className="text-sm font-semibold text-gray-500 mb-4">NEXT TASK</div>
                {nextTask.type === 'image' && nextTask.imageUrl ? (
                  <img
                    src={nextTask.imageUrl}
                    alt={nextTask.content}
                    className="object-contain rounded-lg mb-4"
                    style={{ maxWidth: '150px', maxHeight: '150px' }}
                  />
                ) : (
                  NextIcon && (
                    <NextIcon className="text-indigo-600 mb-4" style={{ width: '64px', height: '64px' }} />
                  )
                )}
                <div className="text-gray-700 text-center" style={getFontStyle(theme, 28)}>
                  {nextTask.content}
                </div>
                <div className="text-xl text-gray-500 mt-4">{nextTask.duration} min</div>
              </>
            ) : (
              <div className="text-xl text-gray-400">All done!</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      {displaySettings.bottomBannerImage && (
        <div className="flex items-center justify-center py-4 bg-gradient-to-r from-purple-600 to-indigo-500">
          <img src={displaySettings.bottomBannerImage} alt="Bottom Banner" className="max-h-20 object-contain" />
        </div>
      )}
    </div>
  )
}
