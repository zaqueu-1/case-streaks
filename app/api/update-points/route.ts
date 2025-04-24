import { NextResponse } from "next/server"
import { query } from "@/app/lib/postgres"
import { calculateLevelAndPoints } from "@/app/utils/utils"

interface UpdateResult {
  message?: string
  error?: string
  totalUpdated?: number
  details?: Array<{
    email: string
    uniqueDays: number
    points: number
    level: number
    pointsToNextLevel: number
    currentLevelPoints: number
    totalAccesses: number
    success: boolean
  }>
}

export async function GET(): Promise<NextResponse<UpdateResult>> {
  try {
    // Buscar todos os usuários
    const usersResult = await query("SELECT * FROM users")
    const results = []

    for (const user of usersResult.rows) {
      // Contar dias únicos de acesso (excluindo domingos)
      const uniqueDaysResult = await query(
        `SELECT COUNT(DISTINCT DATE(timestamp)) as unique_days
         FROM accesses
         WHERE user_id = $1
         AND EXTRACT(DOW FROM timestamp) != 0`,
        [user.id],
      )

      const uniqueDays = parseInt(uniqueDaysResult.rows[0].unique_days)
      const points = uniqueDays * 5
      const levelInfo = calculateLevelAndPoints(points)

      // Atualizar pontos e nível do usuário
      const updateResult = await query(
        `UPDATE users
         SET points = $1,
             level = $2,
             total_accesses = (
               SELECT COUNT(*) FROM accesses WHERE user_id = $3
             )
         WHERE id = $3
         RETURNING *`,
        [points, levelInfo.level, user.id],
      )

      const updatedUser = updateResult.rows[0]
      const totalAccesses = await query(
        "SELECT COUNT(*) as count FROM accesses WHERE user_id = $1",
        [user.id],
      ).then((res) => parseInt(res.rows[0].count))

      results.push({
        email: user.email,
        uniqueDays,
        points,
        level: levelInfo.level,
        pointsToNextLevel: levelInfo.pointsToNextLevel,
        currentLevelPoints: levelInfo.currentLevelPoints,
        totalAccesses,
        success:
          updatedUser.points === points &&
          updatedUser.level === levelInfo.level,
      })
    }

    return NextResponse.json({
      message: "Pontos e níveis atualizados com sucesso",
      totalUpdated: results.filter((r) => r.success).length,
      details: results,
    })
  } catch (error) {
    console.error("Erro ao atualizar pontos:", error)
    return NextResponse.json(
      {
        error: "Erro ao atualizar pontos",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
