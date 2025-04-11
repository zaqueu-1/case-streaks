import { NextRequest } from "next/server"
import { GET } from "../cleanup/route"
import { query } from "../../lib/postgres"
import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import { QueryResult } from "pg"

jest.mock("../../lib/postgres")

type MockQuery = jest.MockedFunction<typeof query>

describe("Cleanup API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deve retornar sucesso quando a limpeza for concluída", async () => {
    ;(query as MockQuery).mockResolvedValue({
      rows: [{ id: 1 }, { id: 2 }],
      command: "DELETE",
      rowCount: 2,
      oid: 0,
      fields: [],
    } as QueryResult)

    const req = new NextRequest(new URL("http://localhost/api/cleanup"))
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toMatchObject({
      message: "Limpeza concluída com sucesso",
      totalCleaned: 2,
    })
  })

  it("deve retornar sucesso mesmo quando não houver duplicatas", async () => {
    ;(query as MockQuery).mockResolvedValue({
      rows: [],
      command: "DELETE",
      rowCount: 0,
      oid: 0,
      fields: [],
    } as QueryResult)

    const req = new NextRequest(new URL("http://localhost/api/cleanup"))
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toMatchObject({
      message: "Limpeza concluída com sucesso",
      totalCleaned: 0,
    })
  })

  it("deve retornar erro 500 quando houver falha na limpeza", async () => {
    ;(query as MockQuery).mockRejectedValue(
      new Error("Erro ao limpar duplicatas"),
    )

    const req = new NextRequest(new URL("http://localhost/api/cleanup"))
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toMatchObject({
      message: "Erro ao realizar limpeza",
      error: "Erro ao limpar duplicatas",
    })
  })
})
