import streakMessages from "@/app/data/streak-messages.json"

export function formatDate(dateString) {
  const data = new Date(dateString)
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(data)
}

export function getStreakMessage(streak) {
  if (!streak || streak < 1) return ""

  const messageIndex = Math.min(streak - 1, streakMessages.messages.length - 1)
  return streakMessages.messages[messageIndex]
}
