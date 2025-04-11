import { NextRequest } from "next/server"
import { GET, POST } from "../update-points/route"
import supabase from "@/app/lib/supabase"
import { jest, describe, it, expect, beforeEach } from "@jest/globals"

// Mock do Supabase
jest.mock("@/app/lib/supabase", () => ({
  __esModule: true,
  default: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: {
        id: "123",
        email: "test@example.com",
        points: 100,
        level: 2,
      },
      error: null,
    }),
  },
}))

describe("Update Points API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deve atualizar pontos de um usuário específico", async () => {
    const req = new NextRequest("http://localhost:3000/api/update-points", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        points: 150,
      }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty("email", "test@example.com")
    expect(data).toHaveProperty("points", 100)
    expect(data).toHaveProperty("level", 2)
  })

  it("deve retornar erro quando o email não for fornecido", async () => {
    const req = new NextRequest("http://localhost:3000/api/update-points", {
      method: "POST",
      body: JSON.stringify({
        points: 150,
      }),
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  it("deve retornar erro quando os pontos não forem fornecidos", async () => {
    const req = new NextRequest("http://localhost:3000/api/update-points", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
      }),
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  it("deve retornar erro quando o usuário não for encontrado", async () => {
    // Mock do Supabase para retornar erro
    const mockSupabase = jest.requireMock("@/app/lib/supabase") as jest.Mocked<typeof supabase>
    mockSupabase.default.from().select().eq().single.mockResolvedValueOnce({
      data: null,
      error: { message: "Usuário não encontrado" },
    })

    const req = new NextRequest("http://localhost:3000/api/update-points", {
      method: "POST",
      body: JSON.stringify({
        email: "notfound@example.com",
        points: 150,
      }),
    })

    const response = await POST(req)
    expect(response.status).toBe(500)
  })
})
