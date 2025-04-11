import { NextResponse } from "next/server"
import { query } from "@/app/lib/postgres"
import { queries } from "@/app/lib/queries"
import { StatsResponse } from "@/app/types/news"
import { NextRequest } from "next/server"
import { calculateLevelAndPoints } from "@/app/utils/utils"

export async function GET(
  req: NextRequest,
): Promise<NextResponse<StatsResponse | { error: string }>> {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { error: "Email não fornecido" },
        { status: 400 },
      )
    }

    const userStatsResult = await query(queries.getUserStats, [email])

    if (userStatsResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      )
    }

    const userData = userStatsResult.rows[0]

    try {
      const currentStreakResult = await query(queries.getCurrentStreak, [
        userData.id,
      ])
      const longestStreakResult = await query(queries.getLongestStreak, [
        userData.id,
      ])

      const currentStreak = currentStreakResult.rows[0]?.current_streak || 0
      const longestStreak = longestStreakResult.rows[0]?.longest_streak || 0

      const utmStatsResult = await query(queries.getUtmStats, [userData.id])
      const utmStats = utmStatsResult.rows[0]?.utm_stats || {
        sources: {},
        mediums: {},
        campaigns: {},
        channels: {},
      }

      const levelInfo = calculateLevelAndPoints(userData.points)

      return NextResponse.json({
        email: userData.email,
        totalAccesses: userData.total_accesses,
        firstAccess: userData.first_access,
        lastAccess: userData.last_access,
        currentStreak: currentStreak,
        longestStreak: longestStreak,
        points: userData.points,
        level: userData.level,
        pointsToNextLevel: levelInfo.pointsToNextLevel,
        currentLevelPoints: levelInfo.currentLevelPoints,
        utmStats,
        recentAccesses: userData.recent_accesses || [],
      })
    } catch (streakError) {
      console.error("Erro ao calcular streak:", streakError)
      throw streakError
    }
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    if (error instanceof Error) {
      console.error("Detalhes do erro:", {
        message: error.message,
        stack: error.stack,
      })
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    )
  }
}
