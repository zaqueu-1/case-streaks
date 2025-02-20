import { StatsCardProps } from "../../types/components"

export default function StatsCard({
  icon,
  title,
  stat = 0,
  keyword,
}: StatsCardProps) {
  const formatStat = (value: number): string => {
    if (value == 1) {
      return `${value} ${keyword}`
    }
    return `${value} ${keyword}s`
  }

  return (
    <div className='bg-primary_muted p-6 rounded-lg shadow-lg w-full sm:w-auto'>
      <div className='flex items-center justify-center gap-2'>
        <div>
          <p className='text-sm font-light text-secondary_muted'>{title}</p>
          <p className='mt-1 text-2xl font-semibold text-secondary'>
            {formatStat(stat)}
          </p>
        </div>
        <div className='text-3xl'>{icon}</div>
      </div>
    </div>
  )
}
