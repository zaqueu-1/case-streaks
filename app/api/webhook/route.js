import { NextResponse } from "next/server"
import connectDB from "@/app/lib/mongodb"
import News from "@/app/models/News"
import { verifyWebhook } from "@/app/lib/webhookMiddleware"

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

      if (!hasAccessToday) {
        news.totalAccesses = (news.totalAccesses || 0) + 1
      }
    }

    await news.save()

    const totalAccesses = news.totalAccesses

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
