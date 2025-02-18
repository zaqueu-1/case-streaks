import { NextResponse } from "next/server"
import connectDB from "../../lib/mongodb"
import { calculateLevelAndPoints } from "../../utils/utils"
import mongoose from "mongoose"

export async function GET() {
  try {
    await connectDB()
    const collection = mongoose.connection.collection("news")
    const allUsers = await collection.find({}).toArray()
    const results = []

    for (const user of allUsers) {
      const uniqueDays = new Set()
      user.accesses.forEach((access) => {
        const date = new Date(access.timestamp)
        const spDate = new Date(
          date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
        )
        if (spDate.getDay() !== 0) {
          // Ignora domingos
          const dateString = `${spDate.getFullYear()}-${spDate.getMonth()}-${spDate.getDate()}`
          uniqueDays.add(dateString)
        }
      })

      const points = uniqueDays.size * 5
      const levelInfo = calculateLevelAndPoints(points)

      const updateResult = await collection.updateOne(
        { _id: user._id },
        {
          $set: {
            points,
            level: levelInfo.level,
            totalAccesses: user.accesses.length,
          },
        },
      )

      const updatedUser = await collection.findOne({ _id: user._id })

      results.push({
        email: user.email,
        uniqueDays: uniqueDays.size,
        points,
        level: levelInfo.level,
        pointsToNextLevel: levelInfo.pointsToNextLevel,
        currentLevelPoints: levelInfo.currentLevelPoints,
        totalAccesses: user.accesses.length,
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
        message: error.message,
      },
      { status: 500 },
    )
  }
}
