import { NextResponse } from "next/server"
import supabase from "@/app/lib/supabase"
import { getToken } from "next-auth/jwt"
import { NextRequest } from "next/server"

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req })
    if (!token?.isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar estatísticas usando o Supabase
    const { data: stats, error } = await supabase.rpc('get_admin_stats')

    if (error) {
      console.error("Erro ao buscar estatísticas administrativas:", error)
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 },
      )
    }

    return NextResponse.json(stats || {
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
    })
  } catch (error) {
    console.error("Erro ao buscar estatísticas administrativas:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    )
  }
}
