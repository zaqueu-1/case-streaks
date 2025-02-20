import { NextResponse } from "next/server"
import { query } from "../../../lib/postgres"
import { queries } from "../../../lib/queries"
import { getToken } from "next-auth/jwt"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req })
    if (!token?.isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const result = await query(queries.getAdminStats)
    const stats = result.rows[0]?.admin_stats || {
      overview: {
        total_users: 0,
        active_users: 0,
        avg_streak: 0,
      },
      engagement: [],
      topUsers: [],
      utmStats: {
        sources: [],
        mediums: [],
        campaigns: [],
        channels: [],
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Erro ao buscar estatísticas administrativas:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    )
  }
}
