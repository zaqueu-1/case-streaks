import { NextResponse } from "next/server"
import supabase from "@/app/lib/supabase"

export async function POST(req: Request) {
  try {
    const { data, error } = await supabase.rpc('remove_duplicate_accesses')

    if (error) {
      console.error("Erro ao limpar duplicatas:", error)
      return NextResponse.json(
        { error: "Erro ao limpar duplicatas" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Duplicatas removidas com sucesso",
      removed: data?.length || 0
    })
  } catch (error) {
    console.error("Erro ao processar limpeza:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
