import { NextResponse } from "next/server"
import connectDB from "../../lib/mongodb"
import News from "../../models/News"
import { verifyWebhook } from "../../lib/webhookMiddleware"
import { calculateLevelFromPoints } from "../../utils/utils"

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
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

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
        totalAccesses: 1,
        points: 5,
        level: 1,
      })
    } else {
      const hasAccessToday = news.accesses.some((access) => {
        const accessDate = new Date(access.timestamp)
        return (
          accessDate.getFullYear() === today.getFullYear() &&
          accessDate.getMonth() === today.getMonth() &&
          accessDate.getDate() === today.getDate()
        )
      })

      news.accesses.push(newAccess)
      news.lastAccess = now

      if (!hasAccessToday && now.getDay() !== 0) {
        news.totalAccesses = (news.totalAccesses || 0) + 1
        news.points = (news.points || 0) + 5
        news.level = calculateLevelFromPoints(news.points)
      }
    }

    await news.save()

    const totalAccesses = news.totalAccesses
    const nextLevelPoints = news.level * 5 + 5

    response = NextResponse.json(
      {
        message:
          totalAccesses === 1
            ? "Primeiro acesso registrado"
            : `${totalAccesses}º acesso registrado`,
        data: {
          email: news.email,
          totalAccesses,
          lastAccess: news.lastAccess,
          currentAccess: newAccess,
          points: news.points,
          level: news.level,
          pointsToNextLevel: nextLevelPoints - news.points,
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
