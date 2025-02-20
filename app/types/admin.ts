export interface AdminStats {
  overview: {
    total_users: number
    active_users: number
    avg_streak: number
  }
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
  }>
  utmStats: {
    sources: Array<{
      value: string
      count: number
      percentage: number
    }>
    mediums: Array<{
      value: string
      count: number
      percentage: number
    }>
    campaigns: Array<{
      value: string
      count: number
      percentage: number
    }>
    channels: Array<{
      value: string
      count: number
      percentage: number
    }>
  }
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
