import { Document } from "mongoose"

export interface Access {
  id: string
  timestamp: Date
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmChannel?: string
}

export interface INews extends Document {
  email: string
  isAdmin: boolean
  accesses: Access[]
  lastAccess: Date
  createdAt: Date
  totalAccesses: number
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
  firstAccess: Date
  lastAccess: Date
  currentStreak: number
  longestStreak: number
  points: number
  level: number
  pointsToNextLevel: number
  currentLevelPoints: number
  utmStats: UtmStats
  recentAccesses: Access[]
} 