import { NextRequest } from "next/server"
import { GET } from "../update-points/route"
import { query } from "../../lib/postgres"
import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import { QueryResult } from "pg"

jest.mock("../../lib/postgres")

type MockQuery = jest.MockedFunction<typeof query>

describe("Update Points API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deve atualizar pontos e níveis com sucesso", async () => {
    const mockUsers = [
      { id: "1", email: "user1@test.com", points: 0, level: 1 },
      { id: "2", email: "user2@test.com", points: 0, level: 1 },
    ]

    ;(query as MockQuery)
      .mockResolvedValueOnce({
        rows: mockUsers,
        command: "",
        rowCount: 2,
        oid: 0,
        fields: [],
      } as QueryResult)
      .mockResolvedValueOnce({
        rows: [{ unique_days: 5 }],
        command: "",
        rowCount: 1,
        oid: 0,
        fields: [],
      } as QueryResult)
      .mockResolvedValueOnce({
        rows: [{ ...mockUsers[0], points: 25, level: 3 }],
        command: "",
        rowCount: 1,
        oid: 0,
        fields: [],
      } as QueryResult)
      .mockResolvedValueOnce({
        rows: [{ count: "10" }],
        command: "",
        rowCount: 1,
        oid: 0,
        fields: [],
      } as QueryResult)
      .mockResolvedValueOnce({
        rows: [{ unique_days: 3 }],
        command: "",
        rowCount: 1,
        oid: 0,
        fields: [],
      } as QueryResult)
      .mockResolvedValueOnce({
        rows: [{ ...mockUsers[1], points: 15, level: 2 }],
        command: "",
        rowCount: 1,
        oid: 0,
        fields: [],
      } as QueryResult)
      .mockResolvedValueOnce({
        rows: [{ count: "6" }],
        command: "",
        rowCount: 1,
        oid: 0,
        fields: [],
      } as QueryResult)

    const req = new NextRequest(new URL("http://localhost/api/update-points"))
    //@ts-ignore
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toMatchObject({
      message: "Pontos e níveis atualizados com sucesso",
      totalUpdated: 2,
      details: expect.arrayContaining([
        expect.objectContaining({
          email: "user1@test.com",
          uniqueDays: 5,
          points: 25,
          level: 3,
          success: true,
        }),
        expect.objectContaining({
          email: "user2@test.com",
          uniqueDays: 3,
          points: 15,
          level: 2,
          success: true,
        }),
      ]),
    })
  })

  it("deve retornar erro 500 quando houver falha na atualização", async () => {
    ;(query as MockQuery).mockRejectedValue(
      new Error("Erro ao atualizar pontos"),
    )

    const req = new NextRequest(new URL("http://localhost/api/update-points"))
    //@ts-ignore
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toMatchObject({
      error: "Erro ao atualizar pontos",
      message: "Erro ao atualizar pontos",
    })
  })
})
