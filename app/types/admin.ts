export interface StatsOverview {
  total_users: number
  active_users: number
  avg_streak: number
}

export interface AdminStats {
  overview: StatsOverview
  engagement: Array<{
    date: string
    users: number
    accesses: number
  }>
  topUsers: Array<{
    email: string
    points: number
    level: number
    unique_days: number
    total_accesses: number
    last_access: string
    max_streak: number
  }>
  utmStats: {
    sources: Array<{
      value: string
      count: number
      percentage: number
      post_id: string
      timestamp: string
    }>
    mediums: Array<{
      value: string
      count: number
      percentage: number
      post_id: string
      timestamp: string
    }>
    campaigns: Array<{
      value: string
      count: number
      percentage: number
      post_id: string
      timestamp: string
    }>
    channels: Array<{
      value: string
      count: number
      percentage: number
      post_id: string
      timestamp: string
    }>
  }
  posts: Array<{
    id: string
    title: string
  }>
}

export interface UpdateResult {
  message?: string
  error?: string
  totalUpdated?: number
  details?: Array<{
    email: string
    uniqueDays: number
    points: number
    level: number
    pointsToNextLevel: number
    currentLevelPoints: number
    totalAccesses: number
    success: boolean
  }>
}
