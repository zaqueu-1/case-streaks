import { NextResponse } from "next/server"
import { withTransaction, query } from "@/app/lib/postgres"
import { queries } from "@/app/lib/queries"
import { verifyWebhook } from "@/app/lib/webhookMiddleware"
import { calculateLevelAndPoints } from "@/app/utils/utils"

interface WebhookResponse {
  message: string
  data?: {
    email: string
    totalAccesses: number
    lastAccess: Date
    currentAccess: {
      id: string
      timestamp: Date
      utmSource?: string
      utmMedium?: string
      utmCampaign?: string
      utmChannel?: string
    }
    points: number
    level: number
    pointsToNextLevel: number
    currentLevelPoints: number
  }
  error?: string
  retryable?: boolean
  isDuplicate?: boolean
  duplicatesRemoved?: number
}

export async function GET(
  req: Request,
): Promise<NextResponse<WebhookResponse>> {
  let response: NextResponse<WebhookResponse> | null = null

  try {
    console.log("Recebendo webhook:", new URL(req.url).searchParams.toString())
    const verificationResult = await verifyWebhook(req)

    // Se for uma duplicata, retorna 200 com flag de duplicata
    if (verificationResult.isDuplicate) {
      console.log("Acesso duplicado detectado:", verificationResult)
      const timestamp =
        verificationResult.lastAccessData?.timestamp || new Date()
      return NextResponse.json(
        {
          message: "Acesso já registrado recentemente",
          isDuplicate: true,
          data: {
            email: verificationResult.lastAccessData?.email || "",
            totalAccesses: await query(
              "SELECT COUNT(*) as count FROM accesses WHERE user_id = (SELECT id FROM users WHERE email = $1)",
              [verificationResult.lastAccessData?.email],
            ).then((res) => parseInt(res.rows[0].count)),
            lastAccess: timestamp,
            currentAccess: {
              id: verificationResult.lastAccessData?.postId || "",
              timestamp: timestamp,
              utmSource: undefined,
              utmMedium: undefined,
              utmCampaign: undefined,
              utmChannel: undefined,
            },
            points: 0,
            level: 0,
            pointsToNextLevel: 0,
            currentLevelPoints: 0,
          },
        },
        { status: 200 },
      )
    }

    console.log("Webhook verificado com sucesso")

    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")
    const id = searchParams.get("id")
    const utmSource = searchParams.get("utm_source")
    const utmMedium = searchParams.get("utm_medium")
    const utmCampaign = searchParams.get("utm_campaign")
    const utmChannel = searchParams.get("utm_channel")

    if (!email || !id) {
      console.warn("Parâmetros inválidos:", { email, id })
      return NextResponse.json(
        {
          message: "Parâmetros inválidos",
          error: "Email e ID são obrigatórios",
        },
        { status: 400 },
      )
    }

    const normalizedId = id.startsWith("post_") ? id : `post_${id}`
    const now = new Date()
    const spNow = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
    )

    console.log("Processando acesso:", {
      email,
      postId: normalizedId,
      timestamp: spNow,
    })

    // Usar transação para garantir consistência
    const result = await withTransaction(async (client) => {
      // Buscar ou criar usuário
      let userResult = await client.query(
        "SELECT * FROM users WHERE email = $1",
        [email],
      )

      let userId
      if (userResult.rows.length === 0) {
        // Criar novo usuário
        const newUserResult = await client.query(
          `INSERT INTO users (email, last_access, created_at, points, level)
           VALUES ($1, $2, $2, $3, 1)
           RETURNING *`,
          [email, now, spNow.getDay() !== 0 ? 5 : 0],
        )
        userId = newUserResult.rows[0].id
      } else {
        userId = userResult.rows[0].id
      }

      // Registrar novo acesso
      const newAccess = await client.query(queries.registerAccess, [
        userId,
        normalizedId,
        now,
        utmSource || null,
        utmMedium || null,
        utmCampaign || null,
        utmChannel || null,
      ])

      // Atualizar pontos se não houver acesso hoje e não for domingo
      const todayStart = new Date(spNow)
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date(spNow)
      todayEnd.setHours(23, 59, 59, 999)

      const todayAccessResult = await client.query(
        `SELECT COUNT(*) as count
         FROM accesses
         WHERE user_id = $1
         AND timestamp BETWEEN $2 AND $3
         AND id != $4`,
        [userId, todayStart, todayEnd, newAccess.rows[0].id],
      )

      const hasAccessToday = todayAccessResult.rows[0].count > 0

      if (!hasAccessToday && spNow.getDay() !== 0) {
        const uniqueDaysResult = await client.query(
          `SELECT COUNT(DISTINCT DATE(timestamp)) as unique_days
           FROM accesses
           WHERE user_id = $1
           AND EXTRACT(DOW FROM timestamp) != 0`,
          [userId],
        )

        const points = uniqueDaysResult.rows[0].unique_days * 5
        const levelInfo = calculateLevelAndPoints(points)

        await client.query(
          `UPDATE users
           SET points = $1, level = $2, last_access = $3, total_accesses = (
             SELECT COUNT(*) FROM accesses WHERE user_id = $4
           )
           WHERE id = $4`,
          [points, levelInfo.level, now, userId],
        )

        return {
          points,
          level: levelInfo.level,
          pointsToNextLevel: levelInfo.pointsToNextLevel,
          currentLevelPoints: levelInfo.currentLevelPoints,
          access: newAccess.rows[0],
        }
      }

      // Atualizar último acesso e total de acessos
      await client.query(
        `UPDATE users
         SET last_access = $1, total_accesses = (
           SELECT COUNT(*) FROM accesses WHERE user_id = $2
         )
         WHERE id = $2`,
        [now, userId],
      )

      const currentUser = await client.query(
        "SELECT * FROM users WHERE id = $1",
        [userId],
      )

      const levelInfo = calculateLevelAndPoints(currentUser.rows[0].points)

      return {
        points: currentUser.rows[0].points,
        level: currentUser.rows[0].level,
        pointsToNextLevel: levelInfo.pointsToNextLevel,
        currentLevelPoints: levelInfo.currentLevelPoints,
        access: newAccess.rows[0],
      }
    })

    // Após registrar o acesso, executa a limpeza de duplicatas
    console.log("Executando limpeza de duplicatas...")
    const cleanupResult = await query(queries.removeDuplicateAccesses)
    console.log("Duplicatas removidas:", cleanupResult.rows.length)

    response = NextResponse.json({
      message: "Acesso registrado com sucesso",
      duplicatesRemoved: cleanupResult.rows.length,
      data: {
        email,
        totalAccesses: await query(
          "SELECT COUNT(*) as count FROM accesses WHERE user_id = (SELECT id FROM users WHERE email = $1)",
          [email],
        ).then((res) => parseInt(res.rows[0].count)),
        lastAccess: now,
        currentAccess: {
          id: result.access.post_id,
          timestamp: result.access.timestamp,
          utmSource: result.access.utm_source,
          utmMedium: result.access.utm_medium,
          utmCampaign: result.access.utm_campaign,
          utmChannel: result.access.utm_channel,
        },
        points: result.points,
        level: result.level,
        pointsToNextLevel: result.pointsToNextLevel,
        currentLevelPoints: result.currentLevelPoints,
      },
    })
  } catch (error) {
    console.error("Erro ao processar webhook:", error)

    // Se for um erro de duplicata, retorna 200 com flag de duplicata
    if (
      error instanceof Error &&
      error.message.includes("segundos entre os acessos")
    ) {
      return NextResponse.json(
        {
          message: error.message,
          isDuplicate: true,
        },
        { status: 200 },
      )
    }

    // Para outros erros, mantém o comportamento atual
    const statusCode =
      error instanceof Error && error.message.includes("tentativas") ? 429 : 500

    response = NextResponse.json(
      {
        error: "Erro ao processar webhook",
        message: error instanceof Error ? error.message : "Erro desconhecido",
        retryable: statusCode === 500,
      },
      { status: statusCode },
    )
  }

  return response
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
  })
}
