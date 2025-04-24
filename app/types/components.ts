import { Access, StatsResponse, RecentAccess } from "./news"

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
  accesses: RecentAccess[]
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
