import { calculateLevelProgress } from "../../utils/utils"

export default function LevelBadge({stats}) {
    return (
        <div className='flex items-center'>
            <div className='flex flex-col items-center'>
                <div className='relative'>
                    <div className='w-16 h-16 rounded-full bg-primary_muted flex items-center justify-center'>
                        <span className='text-xl font-bold font-montserrat text-secondary flex items-center gap-1'>
                        <span className='text-xs font-light'>lv</span>
                            {stats?.level || 1}
                        </span>
                    </div>
                </div>
          <div className='mt-2 w-24'>
            <div className='relative h-2 w-full bg-gray-200 rounded-full overflow-hidden'>
              <div
                className='absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out'
                style={{
                  width: `${calculateLevelProgress(
                    stats?.points || 0,
                    stats?.level || 1,
                  )}%`,
                }}
              />
            </div>
            <div className='mt-1 flex gap-1 justify-end text-[10px] font-poppins text-secondary'>
              <span>{stats?.pointsToNextLevel || 5}xp para o</span>
              <span className='text-primary underline'>
                nível {stats?.level + 1}!
              </span>
            </div>
          </div>
        </div>
      </div>
    )
}