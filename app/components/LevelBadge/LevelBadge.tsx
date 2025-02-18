import { LevelBadgeProps } from "../../types/components"
import { calculateLevelProgress } from "../../utils/utils"

export default function LevelBadge({ stats }: LevelBadgeProps) {
  if (!stats) return null

  const progress = calculateLevelProgress(stats.points)

  return (
    <div className='relative'>
      <div className='flex flex-col items-center justify-center'>
        <div className='relative w-32 h-32 rounded-full bg-primary_muted flex items-center justify-center'>
          <div className='absolute inset-0'>
            <svg className='w-full h-full' viewBox='0 0 100 100'>
              <circle
                className='text-gray-200'
                strokeWidth='8'
                stroke='currentColor'
                fill='transparent'
                r='42'
                cx='50'
                cy='50'
              />
              <circle
                className='text-primary'
                strokeWidth='8'
                strokeLinecap='round'
                stroke='currentColor'
                fill='transparent'
                r='42'
                cx='50'
                cy='50'
                style={{
                  strokeDasharray: "264, 264",
                  strokeDashoffset: 264 - (progress * 264) / 100,
                }}
              />
            </svg>
          </div>
          <div className='relative text-center'>
            <div className='text-4xl font-bold text-secondary'>
              {stats.level}
            </div>
            <div className='text-xs text-secondary_muted'>nível</div>
          </div>
        </div>
        <div className='mt-2 text-center'>
          <div className='text-sm font-medium text-secondary'>
            {stats.currentLevelPoints} /{" "}
            {stats.currentLevelPoints + stats.pointsToNextLevel} XP
          </div>
          <div className='text-xs text-secondary_muted'>
            Faltam {stats.pointsToNextLevel} XP para o próximo nível
          </div>
        </div>
      </div>
    </div>
  )
}
