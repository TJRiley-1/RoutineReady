import { getProgressPercentage, getDotColor } from '../lib/timeUtils'

export default function ProgressLine({ taskDuration, elapsed, isPast, isActive, lineWidth, theme }) {
  const progressPercentage = getProgressPercentage(isPast, isActive, elapsed, taskDuration)
  const dotColor = getDotColor(theme, isPast, isActive)

  return (
    <div
      className="relative flex items-center px-4"
      style={{ minWidth: `${lineWidth}px`, width: `${lineWidth}px` }}
    >
      <div
        className="relative w-full h-3 rounded-full overflow-hidden"
        style={{ backgroundColor: theme.progressBgColor }}
      >
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            background: `linear-gradient(to right, ${theme.progressLineColors.from}, ${theme.progressLineColors.to})`,
            width: `${progressPercentage}%`,
            transition: 'none',
          }}
        />

        {(isActive || isPast) && (
          <div
            className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
            style={{
              left: `${progressPercentage}%`,
              transition: 'none',
            }}
          >
            <div
              className="w-6 h-6 bg-white rounded-full shadow-lg"
              style={{ border: `4px solid ${dotColor}` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  )
}
