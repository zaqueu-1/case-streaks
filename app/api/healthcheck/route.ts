import { NextRequest, NextResponse } from "next/server"
import supabase from "@/app/lib/supabase"

export async function GET(req: NextRequest) {
  const start = Date.now()
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      throw error;
    }
    
    const dbLatency = Date.now() - start
    const memoryUsage = process.memoryUsage()

    return NextResponse.json({
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: {
        status: "connected",
        latency: `${dbLatency}ms`,
      },
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      },
    })
  } catch (error) {
    console.error("Erro no healthcheck:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
