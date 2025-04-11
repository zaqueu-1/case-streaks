import { NextRequest } from "next/server"
import { GET } from "../admin/stats/route"
import supabase from "@/app/lib/supabase"

// Mock do Supabase
jest.mock("@/app/lib/supabase", () => ({
  __esModule: true,
  default: {
    rpc: jest.fn().mockResolvedValue({
      data: {
        overview: {
          total_users: 10,
          active_users: 5,
          avg_streak: 3,
        },
        engagement: [
          { date: "2024-02-20", users: 3 },
          { date: "2024-02-21", users: 5 },
        ],
        topUsers: [
          { email: "user1@example.com", streak: 10, points: 100, level: 5 },
          { email: "user2@example.com", streak: 8, points: 80, level: 4 },
        ],
        utmStats: {
          sources: { facebook: 10, twitter: 5 },
          mediums: { social: 15 },
          campaigns: { summer: 8 },
          channels: { web: 12, mobile: 3 },
        },
      },
      error: null,
    }),
  },
}))

describe("Admin Stats API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deve retornar estatísticas administrativas", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/stats", {
      headers: {
        cookie: "next-auth.session-token=test-token",
      },
    })

    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.overview).toHaveProperty("total_users", 10)
    expect(data.overview).toHaveProperty("active_users", 5)
    expect(data.overview).toHaveProperty("avg_streak", 3)
    expect(data.engagement).toHaveLength(2)
    expect(data.topUsers).toHaveLength(2)
    expect(data.utmStats).toHaveProperty("sources")
    expect(data.utmStats).toHaveProperty("mediums")
    expect(data.utmStats).toHaveProperty("campaigns")
    expect(data.utmStats).toHaveProperty("channels")
  })

  it("deve retornar erro quando não for admin", async () => {
    // Mock do token para retornar usuário não admin
    jest.spyOn(require("next-auth/jwt"), "getToken").mockResolvedValue({
      isAdmin: false,
    })

    const req = new NextRequest("http://localhost:3000/api/admin/stats", {
      headers: {
        cookie: "next-auth.session-token=test-token",
      },
    })

    const response = await GET(req)
    expect(response.status).toBe(401)
  })

  it("deve retornar erro quando houver falha na consulta", async () => {
    // Mock do Supabase para retornar erro
    const mockSupabase = jest.requireMock("@/app/lib/supabase") as jest.Mocked<typeof supabase>
    mockSupabase.default.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: "Erro ao buscar estatísticas" },
    })

    const req = new NextRequest("http://localhost:3000/api/admin/stats", {
      headers: {
        cookie: "next-auth.session-token=test-token",
      },
    })

    const response = await GET(req)
    expect(response.status).toBe(500)
  })
})
