import streakMessages from "../data/streak-messages.json"
import { LevelInfo } from "../types/news"

function calculateRequiredPointsForNextLevel(level: number): number {
  return level * 5 + 5
}

export function calculateLevelAndPoints(totalPoints: number): LevelInfo {
  let level = 1
  let remainingPoints = totalPoints

  while (true) {
    const pointsForNextLevel = calculateRequiredPointsForNextLevel(level)
    if (remainingPoints < pointsForNextLevel) {
      break
    }
    remainingPoints -= pointsForNextLevel
    level++
  }

  return {
    level,
    currentLevelPoints: remainingPoints,
    pointsToNextLevel:
      calculateRequiredPointsForNextLevel(level) - remainingPoints,
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
