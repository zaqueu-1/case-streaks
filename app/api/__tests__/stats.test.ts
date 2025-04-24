import { NextRequest } from "next/server"
import { GET } from "@/app/api/stats/route"
import { query } from "@/app/lib/postgres"
import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import { QueryResult } from "pg"

jest.mock("@/app/lib/postgres")

type MockQuery = jest.MockedFunction<typeof query>

describe("User Stats API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deve retornar 400 se o email não for fornecido", async () => {
    const req = new NextRequest(new URL("http://localhost/api/stats"))
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: "Email não fornecido" })
  })

  it("deve retornar 404 se o usuário não for encontrado", async () => {
    ;(query as MockQuery).mockResolvedValue({
      rows: [],
      command: "",
      rowCount: 0,
      oid: 0,
      fields: [],
    } as QueryResult)

    const req = new NextRequest(
      new URL("http://localhost/api/stats?email=test@example.com"),
    )
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: "Usuário não encontrado" })
  })

  it("deve retornar estatísticas do usuário com sucesso", async () => {
    const mockUserData = {
      id: "123",
      email: "test@example.com",
      total_accesses: 10,
      first_access: "2024-02-20",
      last_access: "2024-02-21",
      points: 50,
      level: 5,
      recent_accesses: [],
    }

    const mockStreakData = {
      rows: [{ current_streak: 3 }],
      command: "",
      rowCount: 1,
      oid: 0,
      fields: [],
    } as QueryResult

    const mockLongestStreakData = {
      rows: [{ longest_streak: 5 }],
      command: "",
      rowCount: 1,
      oid: 0,
      fields: [],
    } as QueryResult

    const mockUtmStats = {
      rows: [
        {
          utm_stats: {
            sources: {},
            mediums: {},
            campaigns: {},
            channels: {},
          },
        },
      ],
      command: "",
      rowCount: 1,
      oid: 0,
      fields: [],
    } as QueryResult

    ;(query as MockQuery)
      .mockResolvedValueOnce({
        rows: [mockUserData],
        command: "",
        rowCount: 1,
        oid: 0,
        fields: [],
      } as QueryResult)
      .mockResolvedValueOnce(mockStreakData)
      .mockResolvedValueOnce(mockLongestStreakData)
      .mockResolvedValueOnce(mockUtmStats)

    const req = new NextRequest(
      new URL("http://localhost/api/stats?email=test@example.com"),
    )
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toMatchObject({
      email: mockUserData.email,
      totalAccesses: mockUserData.total_accesses,
      firstAccess: mockUserData.first_access,
      lastAccess: mockUserData.last_access,
      currentStreak: 3,
      longestStreak: 5,
      points: mockUserData.points,
      level: mockUserData.level,
    })
  })

  it("deve retornar 500 em caso de erro", async () => {
    ;(query as MockQuery).mockRejectedValue(new Error("Erro de banco de dados"))

    const req = new NextRequest(
      new URL("http://localhost/api/stats?email=test@example.com"),
    )
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: "Erro interno do servidor" })
  })
})
