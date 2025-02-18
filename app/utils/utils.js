import streakMessages from "../data/streak-messages.json"

function calculateRequiredPointsForNextLevel(level) {
  return level * 5 + 5
}

export function calculateLevelAndPoints(totalPoints) {
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

export function calculateLevelFromPoints(totalPoints) {
  return calculateLevelAndPoints(totalPoints).level
}

export function calculateLevelProgress(totalPoints) {
  const { currentLevelPoints, pointsToNextLevel } =
    calculateLevelAndPoints(totalPoints)
  const totalPointsForLevel = currentLevelPoints + pointsToNextLevel
  return Math.min((currentLevelPoints / totalPointsForLevel) * 100, 100)
}

export function formatDate(dateString) {
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

export function getStreakMessage(streak) {
  if (!streak || streak < 1) return ""

  const messageIndex = Math.min(streak - 1, streakMessages.messages.length - 1)
  return streakMessages.messages[messageIndex]
}
