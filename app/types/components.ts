import { Access, StatsResponse } from "./news"

export interface StatsCardProps {
  icon: string
  title: string
  stat?: number
  keyword: string
}

export interface LevelBadgeProps {
  stats: StatsResponse | null
}

export interface ShareButtonProps {
  stats: StatsResponse | null
}

export interface AccessCalendarProps {
  accesses: Access[]
}

export interface Achievement {
  id: string
  icon: string
  title: string
  description: string
  condition: string
  unlocked: boolean
}

export interface AchievementsProps {
  stats: StatsResponse | null
  onAchievementsUpdate?: (achievements: Achievement[]) => void
}
