import { NextResponse } from "next/server"
import { query } from "../../lib/postgres"
import { queries } from "../../lib/queries"
import { NextRequest } from "next/server"

interface CleanupResponse {
  message: string
  totalCleaned?: number
  error?: string
}

export async function GET(
  req: NextRequest,
): Promise<NextResponse<CleanupResponse>> {
  try {
    const result = await query(queries.removeDuplicateAccesses)

    return NextResponse.json({
      message: "Limpeza concluída com sucesso",
      totalCleaned: result.rowCount || 0,
    })
  } catch (error) {
    console.error("Erro na limpeza:", error)
    return NextResponse.json(
      {
        message: "Erro ao realizar limpeza",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
