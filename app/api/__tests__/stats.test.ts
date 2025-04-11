import { NextRequest } from "next/server"
import { GET } from "../stats/route"
import supabase from "@/app/lib/supabase"
import { jest, describe, it, expect, beforeEach } from "@jest/globals"

// Mock do Supabase
jest.mock("@/app/lib/supabase", () => ({
  __esModule: true,
  default: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: {
        id: "123",
        email: "test@example.com",
        points: 100,
        level: 2,
        is_admin: false,
        last_access: new Date().toISOString(),
      },
      error: null,
    }),
  },
}))

describe("Stats API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deve retornar estatísticas do usuário", async () => {
    const req = new NextRequest("http://localhost:3000/api/stats?email=test@example.com")
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty("email", "test@example.com")
    expect(data).toHaveProperty("points", 100)
    expect(data).toHaveProperty("level", 2)
  })

  it("deve retornar erro quando o email não for fornecido", async () => {
    const req = new NextRequest("http://localhost:3000/api/stats")
    const response = await GET(req)
    expect(response.status).toBe(400)
  })

  it("deve retornar erro quando o usuário não for encontrado", async () => {
    // Mock do Supabase para retornar erro
    const mockSupabase = jest.requireMock("@/app/lib/supabase") as jest.Mocked<typeof supabase>
    mockSupabase.default.from().select().eq().single.mockResolvedValueOnce({
      data: null,
      error: { message: "Usuário não encontrado" },
    })

    const req = new NextRequest("http://localhost:3000/api/stats?email=notfound@example.com")
    const response = await GET(req)
    expect(response.status).toBe(404)
  })
})
