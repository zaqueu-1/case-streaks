import { NextResponse } from "next/server"
import { query } from "@/app/lib/postgres"

interface HealthCheckResponse {
  status: string
  timestamp: string
  database: {
    connected: boolean
    error?: string
  }
}

export async function GET(
  req: Request,
): Promise<NextResponse<HealthCheckResponse>> {
  try {
    // Testa a conexão com o banco
    await query("SELECT 1")

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
      },
    })
  } catch (error) {
    console.error("Erro no healthcheck:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        },
      },
      { status: 500 },
    )
  }
}
