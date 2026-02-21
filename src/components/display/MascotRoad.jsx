import { getProgressPercentage } from '../../lib/timeUtils'

export default function MascotRoad({ taskDuration, elapsed, isPast, isActive, mascotImg, roadWidth, surfaceGradient, roadHeight, spriteEmoji, dashColor }) {
  const progressPercentage = getProgressPercentage(isPast, isActive, elapsed, taskDuration)
  const height = roadHeight || 32
  const numDashes = Math.max(6, Math.floor(roadWidth / 50))
  const spriteSize = Math.round(height * 1.2)
  const dashClr = dashColor || '#ffffff'

  return (
    <div
      className="relative flex items-center px-4"
      style={{ minWidth: `${roadWidth}px`, width: `${roadWidth}px` }}
    >
      <div
        className="relative w-full rounded-full overflow-hidden"
        style={{
          height: `${height}px`,
          background: surfaceGradient || '#9ca3af',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-around">
          {Array.from({ length: numDashes }).map((_, i) => (
            <div key={i} className="rounded-full" style={{ width: '16px', height: '4px', backgroundColor: dashClr }} />
          ))}
        </div>

        <div
          className="absolute top-0 left-0 h-full bg-green-300/40"
          style={{
            width: `${progressPercentage}%`,
            transition: 'none',
          }}
        />

        {(isActive || isPast) && (
          <div
            className="absolute top-1/2 transform -translate-y-1/2"
            style={{
              left: `calc(${progressPercentage}% - ${spriteSize / 2}px)`,
              transition: 'none',
            }}
          >
            {mascotImg ? (
              <img src={mascotImg} alt="Mascot" style={{ width: `${spriteSize}px`, height: `${spriteSize}px`, objectFit: 'contain' }} />
            ) : (
              <div style={{ fontSize: `${spriteSize}px`, lineHeight: 1 }}>{spriteEmoji || '\u{1F427}'}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
