import { Document } from "mongoose"

export interface Access {
  id: string
  user_id: string
  post_id: string
  timestamp: Date
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_channel?: string
}

export interface RecentAccess {
  id: string
  post_id: string
  timestamp: string | Date
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_channel?: string
}

export interface User {
  id: string
  email: string
  is_admin: boolean
  last_access: Date
  created_at: Date
  total_accesses: number
  points: number
  level: number
}

export interface LevelInfo {
  level: number
  currentLevelPoints: number
  pointsToNextLevel: number
}

export interface UtmStats {
  sources: Record<string, number>
  mediums: Record<string, number>
  campaigns: Record<string, number>
  channels: Record<string, number>
}

export interface StatsResponse {
  email: string
  totalAccesses: number
  firstAccess: string | Date
  lastAccess: string | Date
  currentStreak: number
  longestStreak: number
  points: number
  level: number
  pointsToNextLevel: number
  currentLevelPoints: number
  utmStats: {
    sources: Record<string, number>
    mediums: Record<string, number>
    campaigns: Record<string, number>
    channels: Record<string, number>
  }
  recentAccesses: RecentAccess[]
}
