import { NextResponse } from "next/server"
import connectDB from "../../lib/mongodb"
import News from "../../models/News"

interface CleanupResponse {
  message: string
  totalCleaned?: number
  error?: string
}

export async function GET(
  req: Request,
): Promise<NextResponse<CleanupResponse>> {
  try {
    await connectDB()

    const users = await News.find({}).lean()
    let totalCleaned = 0

    for (const user of users) {
      const uniqueAccesses = user.accesses.filter(
        (access, index, self) =>
          index ===
          self.findIndex(
            (a) =>
              a.id === access.id &&
              new Date(a.timestamp).toISOString() ===
                new Date(access.timestamp).toISOString(),
          ),
      )

      if (uniqueAccesses.length !== user.accesses.length) {
        await News.updateOne(
          { _id: user._id },
          { $set: { accesses: uniqueAccesses } },
        )
        totalCleaned++
      }
    }

    return NextResponse.json({
      message: "Limpeza concluída com sucesso",
      totalCleaned,
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
