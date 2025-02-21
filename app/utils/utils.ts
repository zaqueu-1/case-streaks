import streakMessages from "@/app/data/streak-messages.json"
import { LevelInfo } from "@/app/types/news"

export function calculateLevelAndPoints(totalPoints: number): LevelInfo {
  const level = Math.floor(totalPoints / 10) + 1
  const currentLevelPoints = totalPoints % 10
  const pointsToNextLevel = 10 - currentLevelPoints

  return {
    level,
    currentLevelPoints,
    pointsToNextLevel,
  }
}

export function calculateLevelFromPoints(totalPoints: number): number {
  return calculateLevelAndPoints(totalPoints).level
}

export function calculateLevelProgress(totalPoints: number): number {
  const { currentLevelPoints, pointsToNextLevel } =
    calculateLevelAndPoints(totalPoints)
  const totalPointsForLevel = currentLevelPoints + pointsToNextLevel
  return Math.min((currentLevelPoints / totalPointsForLevel) * 100, 100)
}

export function formatDate(dateString: string | Date): string {
  const data = new Date(dateString)
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(data)
}

export function getStreakMessage(streak: number): string {
  if (!streak || streak < 1) return ""

  const messageIndex = Math.min(streak - 1, streakMessages.messages.length - 1)
  return streakMessages.messages[messageIndex]
}
