import { getProgressPercentage } from '../lib/timeUtils'

export default function MascotRoad({ taskDuration, elapsed, isPast, isActive, mascotImg, roadWidth }) {
  const progressPercentage = getProgressPercentage(isPast, isActive, elapsed, taskDuration)
  const numDashes = Math.max(6, Math.floor(roadWidth / 50))

  return (
    <div
      className="relative flex items-center px-4"
      style={{ minWidth: `${roadWidth}px`, width: `${roadWidth}px` }}
    >
      <div className="relative w-full h-8 bg-gray-400 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-around">
          {Array.from({ length: numDashes }).map((_, i) => (
            <div key={i} className="w-4 h-1 bg-white rounded-full" />
          ))}
        </div>

        <div
          className="absolute top-0 left-0 h-full bg-green-300"
          style={{
            width: `${progressPercentage}%`,
            transition: 'none',
          }}
        />

        {(isActive || isPast) && (
          <div
            className="absolute top-1/2 transform -translate-y-1/2"
            style={{
              left: `calc(${progressPercentage}% - 20px)`,
              transition: 'none',
            }}
          >
            {mascotImg ? (
              <img src={mascotImg} alt="Mascot" className="w-10 h-10 object-contain" />
            ) : (
              <div className="text-3xl">🚗</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
