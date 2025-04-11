import { NextRequest } from "next/server"
import { GET } from "../healthcheck/route"
import { query } from "../../lib/postgres"
import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import { QueryResult } from "pg"

jest.mock("../../lib/postgres")

type MockQuery = jest.MockedFunction<typeof query>

describe("Healthcheck API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deve retornar status healthy quando o banco estiver conectado", async () => {
    ;(query as MockQuery).mockResolvedValue({
      rows: [{ "?column?": 1 }],
      command: "",
      rowCount: 1,
      oid: 0,
      fields: [],
    } as QueryResult)

    const req = new NextRequest(new URL("http://localhost/api/healthcheck"))
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toMatchObject({
      status: "healthy",
      database: {
        connected: true,
      },
    })
    expect(data.timestamp).toBeDefined()
  })

  it("deve retornar status unhealthy quando houver erro no banco", async () => {
    ;(query as MockQuery).mockRejectedValue(new Error("Erro de conexão"))

    const req = new NextRequest(new URL("http://localhost/api/healthcheck"))
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toMatchObject({
      status: "unhealthy",
      database: {
        connected: false,
        error: "Erro de conexão",
      },
    })
    expect(data.timestamp).toBeDefined()
  })
})
