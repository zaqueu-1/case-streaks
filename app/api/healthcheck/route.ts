import { NextResponse } from "next/server"
import connectDB from "../../lib/mongodb"

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
    await connectDB()

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
