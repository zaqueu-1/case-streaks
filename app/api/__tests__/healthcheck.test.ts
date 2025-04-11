import { NextRequest } from "next/server"
import { GET } from "../healthcheck/route"
import supabase from "@/app/lib/supabase"
import { jest, describe, it, expect, beforeEach } from "@jest/globals"

// Mock do Supabase
jest.mock("@/app/lib/supabase", () => ({
  __esModule: true,
  default: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    count: jest.fn().mockReturnThis(),
    head: jest.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
  },
}))

describe("Healthcheck API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deve retornar status healthy quando tudo estiver funcionando", async () => {
    const req = new NextRequest("http://localhost:3000/api/healthcheck")
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe("healthy")
    expect(data.database.status).toBe("connected")
  })

  it("deve retornar status unhealthy quando houver erro no banco", async () => {
    // Mock do Supabase para retornar erro
    const mockSupabase = jest.requireMock("@/app/lib/supabase") as jest.Mocked<typeof supabase>
    mockSupabase.default.from().select().count().head.mockResolvedValueOnce({
      data: null,
      error: { message: "Erro de conexão" },
    })

    const req = new NextRequest("http://localhost:3000/api/healthcheck")
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.status).toBe("unhealthy")
  })
})
