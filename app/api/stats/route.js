import { NextResponse } from "next/server"
import connectDB from "@/app/lib/mongodb"
import News from "@/app/models/News"

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
        accesses: { $slice: -10 },
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

    return NextResponse.json({
      email: userRecord.email,
      totalAccesses: userRecord.totalAccesses,
      firstAccess: userRecord.createdAt,
      lastAccess: userRecord.lastAccess,
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
      utmStats,
      recentAccesses: userRecord.accesses,
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

  let currentStreak = 0
  let longestStreak = 0
  let currentDate = new Date()

  currentDate.setHours(0, 0, 0, 0)

  if (currentDate.getDay() === 0) {
    currentDate.setDate(currentDate.getDate() - 1)
  }

  function getWorkingDays(startDate, endDate) {
    let days = 0
    let current = new Date(startDate)

    while (current <= endDate) {
      if (current.getDay() !== 0) {
        days++
      }
      current.setDate(current.getDate() + 1)
    }
    return days - 1
  }

  for (let i = 0; i < sortedAccesses.length; i++) {
    const accessDate = new Date(sortedAccesses[i].timestamp)
    accessDate.setHours(0, 0, 0, 0)

    if (accessDate.getDay() === 0) continue

    const workingDays = getWorkingDays(accessDate, currentDate)

    if (workingDays <= 1) {
      currentStreak++
      currentDate = accessDate
    } else {
      break
    }
  }

  let tempStreak = 1
  for (let i = 1; i < sortedAccesses.length; i++) {
    const prevDate = new Date(sortedAccesses[i - 1].timestamp)
    const currDate = new Date(sortedAccesses[i].timestamp)

    prevDate.setHours(0, 0, 0, 0)
    currDate.setHours(0, 0, 0, 0)

    if (prevDate.getDay() === 0 || currDate.getDay() === 0) continue

    const workingDays = getWorkingDays(currDate, prevDate)

    if (workingDays <= 1) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak)

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
