import { NextResponse } from "next/server"
import connectDB from "../../lib/mongodb"
import News from "../../models/News"
import { calculateLevelAndPoints } from "../../utils/utils"

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { error: "Email não fornecido" },
        { status: 400 },
      )
    }

    await connectDB()

    const userRecord = await News.findOne({ email })
      .select({
        email: 1,
        lastAccess: 1,
        createdAt: 1,
        accesses: 1,
        points: 1,
      })
      .lean()

    if (!userRecord) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      )
    }

    const streaks = calculateStreaks(userRecord.accesses)
    const utmStats = calculateUtmStats(userRecord.accesses)
    const recentAccesses = userRecord.accesses
    const levelInfo = calculateLevelAndPoints(userRecord.points || 0)

    return NextResponse.json({
      email: userRecord.email,
      totalAccesses: userRecord.accesses.length,
      firstAccess: userRecord.createdAt,
      lastAccess: userRecord.lastAccess,
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
      points: userRecord.points || 0,
      level: levelInfo.level,
      pointsToNextLevel: levelInfo.pointsToNextLevel,
      currentLevelPoints: levelInfo.currentLevelPoints,
      utmStats,
      recentAccesses,
    })
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    )
  }
}

function calculateStreaks(accesses) {
  if (!accesses?.length) return { currentStreak: 0, longestStreak: 0 }

  const sortedAccesses = accesses.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
  )

  const uniqueDays = new Set()
  sortedAccesses.forEach((access) => {
    const date = new Date(access.timestamp)
    const spDate = new Date(
      date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
    )
    if (spDate.getDay() !== 0) {
      const dateString = `${spDate.getFullYear()}-${spDate.getMonth()}-${spDate.getDate()}`
      uniqueDays.add(dateString)
    }
  })

  const uniqueDatesArray = Array.from(uniqueDays)
    .map((dateString) => {
      const [year, month, day] = dateString.split("-")
      return new Date(year, month, day)
    })
    .sort((a, b) => b - a)

  if (uniqueDatesArray.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  let currentStreak = 1
  let longestStreak = 1
  let tempStreak = 1

  const now = new Date()
  const spNow = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
  )
  spNow.setHours(0, 0, 0, 0)

  const getDaysBetweenDates = (date1, date2) => {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const start = d1 < d2 ? d1 : d2
    const end = d1 < d2 ? d2 : d1
    let days = 0

    const current = new Date(start)
    current.setDate(current.getDate() + 1)

    while (current <= end) {
      if (current.getDay() !== 0) {
        days++
      }
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const lastAccessDate = uniqueDatesArray[0]
  const daysSinceLastAccess = getDaysBetweenDates(lastAccessDate, spNow)
  const isCurrentStreakValid = daysSinceLastAccess === 0

  for (let i = 0; i < uniqueDatesArray.length - 1; i++) {
    const currentDate = uniqueDatesArray[i]
    const nextDate = uniqueDatesArray[i + 1]

    const daysBetween = getDaysBetweenDates(nextDate, currentDate)

    if (daysBetween === 1) {
      tempStreak++
      if (i === 0 && isCurrentStreakValid) {
        currentStreak = tempStreak
      }
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      if (i === 0 && isCurrentStreakValid) {
        currentStreak = 1
      }
      tempStreak = 1
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak)
  if (isCurrentStreakValid) {
    currentStreak = Math.max(currentStreak, tempStreak)
  } else {
    currentStreak = 0
  }

  return { currentStreak, longestStreak }
}

function calculateUtmStats(accesses) {
  if (!accesses?.length) return {}

  const stats = {
    sources: {},
    mediums: {},
    campaigns: {},
    channels: {},
  }

  accesses.forEach((access) => {
    if (access.utmSource) {
      stats.sources[access.utmSource] =
        (stats.sources[access.utmSource] || 0) + 1
    }
    if (access.utmMedium) {
      stats.mediums[access.utmMedium] =
        (stats.mediums[access.utmMedium] || 0) + 1
    }
    if (access.utmCampaign) {
      stats.campaigns[access.utmCampaign] =
        (stats.campaigns[access.utmCampaign] || 0) + 1
    }
    if (access.utmChannel) {
      stats.channels[access.utmChannel] =
        (stats.channels[access.utmChannel] || 0) + 1
    }
  })

  return stats
}
