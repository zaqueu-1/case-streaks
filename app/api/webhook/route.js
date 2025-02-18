import { NextResponse } from "next/server"
import connectDB from "../../lib/mongodb"
import News from "../../models/News"
import { verifyWebhook } from "../../lib/webhookMiddleware"
import { calculateLevelAndPoints } from "../../utils/utils"

export async function GET(req) {
  let response = null

  try {
    await verifyWebhook(req)

    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")
    const id = searchParams.get("id")
    const utmSource = searchParams.get("utm_source")
    const utmMedium = searchParams.get("utm_medium")
    const utmCampaign = searchParams.get("utm_campaign")
    const utmChannel = searchParams.get("utm_channel")

    if (!email || !id) {
      response = NextResponse.json(
        {
          error: "Parâmetros inválidos",
          required: ["email", "id"],
        },
        { status: 400 },
      )
      return response
    }

    await connectDB()

    const normalizedId = id.startsWith("post_") ? id : `post_${id}`
    const now = new Date()
    const spNow = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
    )
    const today = new Date(
      spNow.getFullYear(),
      spNow.getMonth(),
      spNow.getDate(),
    )

    const newAccess = {
      id: normalizedId,
      timestamp: now,
      utmSource,
      utmMedium,
      utmCampaign,
      utmChannel,
    }

    let news = await News.findOne({ email })

    if (!news) {
      news = new News({
        email,
        accesses: [newAccess],
        lastAccess: now,
        createdAt: now,
        points: spNow.getDay() !== 0 ? 5 : 0, // 5 pontos se não for domingo
      })
    } else {
      const hasAccessToday = news.accesses.some((access) => {
        const accessDate = new Date(access.timestamp)
        const spAccessDate = new Date(
          accessDate.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
        )
        return (
          spAccessDate.getFullYear() === today.getFullYear() &&
          spAccessDate.getMonth() === today.getMonth() &&
          spAccessDate.getDate() === today.getDate()
        )
      })

      news.accesses.push(newAccess)
      news.lastAccess = now

      if (!hasAccessToday && spNow.getDay() !== 0) {
        // Recalcula pontos baseado em dias únicos de acesso (excluindo domingos)
        const uniqueDays = new Set()
        news.accesses.forEach((access) => {
          const date = new Date(access.timestamp)
          const spDate = new Date(
            date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
          )
          if (spDate.getDay() !== 0) {
            const dateString = `${spDate.getFullYear()}-${spDate.getMonth()}-${spDate.getDate()}`
            uniqueDays.add(dateString)
          }
        })

        news.points = uniqueDays.size * 5
      }
    }

    const levelInfo = calculateLevelAndPoints(news.points)
    news.level = levelInfo.level

    await news.save()

    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/update-points`)
    } catch (error) {
      console.error("Erro ao atualizar pontos:", error)
    }

    response = NextResponse.json(
      {
        message: "Acesso registrado com sucesso",
        data: {
          email: news.email,
          totalAccesses: news.accesses.length,
          lastAccess: news.lastAccess,
          currentAccess: newAccess,
          points: news.points,
          level: levelInfo.level,
          pointsToNextLevel: levelInfo.pointsToNextLevel,
          currentLevelPoints: levelInfo.currentLevelPoints,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Erro ao processar webhook:", error)

    const statusCode = error.message.includes("tentativas") ? 429 : 500

    response = NextResponse.json(
      {
        error: "Erro ao processar webhook",
        message: error.message,
        retryable: statusCode === 500,
      },
      { status: statusCode },
    )
  }

  return response
}
