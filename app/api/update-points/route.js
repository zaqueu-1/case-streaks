import { NextResponse } from "next/server"
import connectDB from "../../lib/mongodb"
import { calculateLevelFromPoints } from "../../utils/utils"
import mongoose from "mongoose"

export async function GET() {
  try {
    const db = await connectDB()
    const collection = mongoose.connection.collection("news")

    const allUsers = await collection.find({}).toArray()
    const results = []

    for (const user of allUsers) {
      const uniqueDays = new Set(
        user.accesses
          .map((access) => {
            const date = new Date(access.timestamp)
            // Ignora domingos no cálculo de pontos
            if (date.getDay() !== 0) {
              return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
            }
            return null
          })
          .filter(Boolean),
      )

      const points = uniqueDays.size * 5
      const level = calculateLevelFromPoints(points)

      const updateResult = await collection.updateOne(
        { _id: user._id },
        { $set: { points, level } },
      )

      if (updateResult.modifiedCount !== 1) {
        console.error(`Falha ao atualizar ${user.email}`)
      }

      const updatedUser = await collection.findOne({ _id: user._id })

      results.push({
        email: user.email,
        uniqueDays: uniqueDays.size,
        points,
        level,
        success: updatedUser.points === points && updatedUser.level === level,
        actualPoints: updatedUser.points,
        actualLevel: updatedUser.level,
      })
    }

    return NextResponse.json({
      message: "Pontos atualizados com sucesso",
      totalUpdated: results.filter((r) => r.success).length,
      details: results,
    })
  } catch (error) {
    console.error("Erro ao atualizar pontos:", error)
    return NextResponse.json(
      {
        error: "Erro ao atualizar pontos",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
