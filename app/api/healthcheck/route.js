import { NextResponse } from "next/server"
import connectDB from "../../lib/mongodb"
import mongoose from "mongoose"

export async function GET() {
  try {
    await connectDB()
    const isConnected = mongoose.connection.readyState === 1

    return NextResponse.json({
      status: isConnected ? "de pé" : "com problemas",
      timestamp: new Date().toISOString(),
      database: {
        connected: isConnected,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "com problemas",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
