import { NextResponse } from "next/server"
import connectDB from "@/app/lib/mongodb"
import News from "@/app/models/News"

function calculateRequiredPointsForNextLevel(currentLevel) {
  return currentLevel * 5 + 5
}

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
        totalAccesses: 1,
        lastAccess: 1,
        createdAt: 1,
        accesses: 1,
        points: 1,
        level: 1,
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
    const recentAccesses = userRecord.accesses.slice(-10)
    const nextLevelPoints = calculateRequiredPointsForNextLevel(
      userRecord.level || 1,
    )

    return NextResponse.json({
      email: userRecord.email,
      totalAccesses: userRecord.accesses.length,
      firstAccess: userRecord.createdAt,
      lastAccess: userRecord.lastAccess,
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
      points: userRecord.points || 0,
      level: userRecord.level || 1,
      nextLevelPoints,
      pointsToNextLevel: nextLevelPoints - (userRecord.points || 0),
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
    const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    uniqueDays.add(dateString)
  })

  const uniqueDatesArray = Array.from(uniqueDays)
    .map((dateString) => {
      const [year, month, day] = dateString.split("-")
      return new Date(year, month, day)
    })
    .sort((a, b) => b - a)

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < uniqueDatesArray.length; i++) {
    const currentDate = uniqueDatesArray[i]
    const previousDate = i > 0 ? uniqueDatesArray[i - 1] : null

    if (i === 0) {
      tempStreak = 1
    } else {
      const dayDiff = Math.floor(
        (previousDate - currentDate) / (1000 * 60 * 60 * 24),
      )
      if (dayDiff === 1) {
        tempStreak++
      } else {
        tempStreak = 1
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak)

    if (
      i === 0 ||
      (previousDate &&
        Math.floor((today - previousDate) / (1000 * 60 * 60 * 24)) <= 1)
    ) {
      currentStreak = tempStreak
    }
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
