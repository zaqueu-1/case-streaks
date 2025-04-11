import { NextRequest } from "next/server"
import { POST } from "../cleanup/route"
import supabase from "@/app/lib/supabase"
import { jest, describe, it, expect, beforeEach } from "@jest/globals"

// Mock do Supabase
jest.mock("@/app/lib/supabase", () => ({
  __esModule: true,
  default: {
    rpc: jest.fn().mockResolvedValue({
      data: [{ id: 1 }, { id: 2 }],
      error: null,
    }),
  },
}))

describe("Cleanup API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deve remover duplicatas com sucesso", async () => {
    const req = new NextRequest("http://localhost:3000/api/cleanup", {
      method: "POST",
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe("Duplicatas removidas com sucesso")
    expect(data.removed).toBe(2)
  })

  it("deve retornar erro quando a limpeza falha", async () => {
    // Mock do Supabase para retornar erro
    const mockSupabase = jest.requireMock("@/app/lib/supabase") as jest.Mocked<typeof supabase>
    mockSupabase.default.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: "Erro ao limpar duplicatas" },
    })

    const req = new NextRequest("http://localhost:3000/api/cleanup", {
      method: "POST",
    })

    const response = await POST(req)
    expect(response.status).toBe(500)
  })
})
