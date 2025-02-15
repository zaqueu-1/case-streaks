import { NextResponse } from "next/server"
import connectDB from "@/app/lib/mongodb"
import News from "@/app/models/News"

export async function GET() {
  try {
    await connectDB()

    const allRecords = await News.find().sort({ lastAccess: -1 })

    const emailGroups = {}
    allRecords.forEach((record) => {
      if (!emailGroups[record.email]) {
        emailGroups[record.email] = []
      }
      emailGroups[record.email].push(record)
    })

    const deletePromises = []
    for (const email in emailGroups) {
      const records = emailGroups[email]
      if (records.length > 1) {
        records.sort((a, b) => b.lastAccess - a.lastAccess)

        for (let i = 1; i < records.length; i++) {
          deletePromises.push(News.deleteOne({ _id: records[i]._id }))
        }
      }
    }

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises)
    }

    return NextResponse.json({
      message: "Limpeza concluída",
      deletedCount: deletePromises.length,
    })
  } catch (error) {
    console.error("Erro na limpeza:", error)
    return NextResponse.json(
      { error: "Erro ao limpar registros" },
      { status: 500 },
    )
  }
}
