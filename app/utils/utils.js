import streakMessages from "../data/streak-messages.json"

export function calculateLevelProgress(points, level) {
  const currentLevelMinPoints =
    level === 1 ? 0 : calculateTotalPointsForLevel(level - 1)
  const nextLevelPoints = level * 5 + 5
  const currentLevelPoints = points - currentLevelMinPoints

  return Math.min((currentLevelPoints / nextLevelPoints) * 100, 100)
}

function calculateTotalPointsForLevel(targetLevel) {
  let totalPoints = 0
  for (let level = 1; level < targetLevel; level++) {
    totalPoints += level * 5 + 5
  }
  return totalPoints
}

export function calculateLevelFromPoints(points) {
  let level = 1
  let pointsRequired = 10

  while (points >= pointsRequired) {
    level++
    pointsRequired += level * 5 + 5
  }

  return level
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
