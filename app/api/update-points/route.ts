import { NextResponse } from "next/server"
import supabase from "@/app/lib/supabase"
import { calculateLevelAndPoints } from "@/app/utils/utils"
import { NextRequest } from "next/server"

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

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

export async function GET(req: NextRequest): Promise<NextResponse<UpdateResult>> {
  try {
    // Buscar todos os usuários
    const { data, error } = await supabase
      .from('users')
      .select()

    if (error) {
      console.error("Erro ao buscar usuários:", error)
      return NextResponse.json(
        { error: "Erro ao buscar usuários" },
        { status: 500 }
      )
    }

    const results = []

    for (const user of data) {
      // Contar dias únicos de acesso (excluindo domingos)
      const { data: uniqueDaysResult, error: uniqueDaysError } = await supabase
        .from('accesses')
        .select('DISTINCT DATE(timestamp)')
        .eq('user_id', user.id)
        .eq('EXTRACT(DOW FROM timestamp)', '0')

      if (uniqueDaysError) {
        console.error("Erro ao buscar dias únicos de acesso:", uniqueDaysError)
        continue
      }

      const uniqueDays = uniqueDaysResult.length
      const points = uniqueDays * 5
      const levelInfo = calculateLevelAndPoints(points)

      // Atualizar pontos e nível do usuário
      const { data: updateResult, error: updateError } = await supabase
        .from('users')
        .update({
          points: points,
          level: levelInfo.level,
          total_accesses: supabase
            .from('accesses')
            .select('COUNT(*)')
            .eq('user_id', user.id)
        })
        .eq('id', user.id)
        .select('*')
        .single()

      if (updateError) {
        console.error("Erro ao atualizar pontos:", updateError)
        continue
      }

      const updatedUser = updateResult
      const totalAccesses = parseInt(updateResult.total_accesses)

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

export async function POST(req: Request) {
  try {
    const { email, points } = await req.json()

    if (!email || typeof points !== 'number') {
      return NextResponse.json(
        { error: "Email e pontos são obrigatórios" },
        { status: 400 }
      )
    }

    const { level } = calculateLevelAndPoints(points)

    const { data, error } = await supabase
      .from('users')
      .update({ points, level })
      .eq('email', email)
      .select()
      .single()

    if (error) {
      console.error("Erro ao atualizar pontos:", error)
      return NextResponse.json(
        { error: "Erro ao atualizar pontos" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Erro ao processar atualização de pontos:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
