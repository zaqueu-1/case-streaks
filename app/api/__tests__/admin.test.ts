import { NextRequest } from "next/server"
import { GET } from "../admin/stats/route"
import { getToken } from "next-auth/jwt"
import { query } from "../../lib/postgres"
import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import { QueryResult } from "pg"

jest.mock("next-auth/jwt")
jest.mock("../../lib/postgres")

type MockGetToken = jest.MockedFunction<typeof getToken>
type MockQuery = jest.MockedFunction<typeof query>

describe("Admin Stats API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deve retornar 401 se o usuário não for admin", async () => {
    ;(getToken as MockGetToken).mockResolvedValue({ isAdmin: false })

    const req = new NextRequest(new URL("http://localhost/api/admin/stats"))
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: "Não autorizado" })
  })

  it("deve retornar estatísticas se o usuário for admin", async () => {
    const mockStats = {
      overview: {
        total_users: 10,
        active_users: 5,
        avg_streak: 3,
      },
      engagement: [],
      topUsers: [],
      utmStats: {
        sources: [],
        mediums: [],
        campaigns: [],
        channels: [],
      },
    }

    ;(getToken as MockGetToken).mockResolvedValue({ isAdmin: true })
    ;(query as MockQuery).mockResolvedValue({
      rows: [{ admin_stats: mockStats }],
      command: "",
      rowCount: 1,
      oid: 0,
      fields: [],
    } as QueryResult)

    const req = new NextRequest(new URL("http://localhost/api/admin/stats"))
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockStats)
  })

  it("deve retornar 500 em caso de erro", async () => {
    ;(getToken as MockGetToken).mockResolvedValue({ isAdmin: true })
    ;(query as MockQuery).mockRejectedValue(new Error("Erro de banco de dados"))

    const req = new NextRequest(new URL("http://localhost/api/admin/stats"))
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: "Erro interno do servidor" })
  })
})
