import { NextRequest } from "next/server"
import { GET } from "../webhook/route"
import { query, withTransaction } from "../../lib/postgres"
import { verifyWebhook } from "../../lib/webhookMiddleware"
import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import { QueryResult, PoolClient } from "pg"

jest.mock("../../lib/postgres")
jest.mock("../../lib/webhookMiddleware")

type MockQuery = jest.MockedFunction<typeof query>
type MockVerifyWebhook = jest.MockedFunction<typeof verifyWebhook>

describe("Webhook API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(query as MockQuery).mockClear()
    ;(withTransaction as jest.Mock).mockImplementation((callback) =>
        // @ts-ignore
      callback({ query: jest.fn() }),
    )
  })

  it("deve retornar 400 se os parâmetros forem inválidos", async () => {
    const req = new NextRequest(
      new URL("http://localhost/api/webhook?email=test@example.com"),
    )

    ;(verifyWebhook as MockVerifyWebhook).mockResolvedValue({
      isDuplicate: false,
    })

    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({
      message: "Parâmetros inválidos",
      error: "Email e ID são obrigatórios",
    })
  })

  it("deve retornar 200 se for um acesso duplicado", async () => {
    const mockTimestamp = new Date("2025-02-21T08:41:59.806Z")
    const mockLastAccess = {
      email: "test@example.com",
      timestamp: mockTimestamp,
      postId: "post_123",
    }

    ;(verifyWebhook as MockVerifyWebhook).mockResolvedValue({
      isDuplicate: true,
      lastAccessData: mockLastAccess,
    })
    ;(query as MockQuery).mockResolvedValue({
      rows: [{ count: "5" }],
      command: "",
      rowCount: 1,
      oid: 0,
      fields: [],
    } as QueryResult)

    const req = new NextRequest(
      new URL(
        "http://localhost/api/webhook?email=test@example.com&id=post_123",
      ),
    )
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toMatchObject({
      message: "Acesso já registrado recentemente",
      isDuplicate: true,
      data: {
        email: mockLastAccess.email,
        currentAccess: {
          id: mockLastAccess.postId,
          timestamp: mockTimestamp.toISOString(),
        },
      },
    })
  })

  it("deve registrar um novo acesso com sucesso", async () => {
    const mockTimestamp = new Date("2025-02-21T08:41:59.806Z")
    const mockUserData = {
      id: "123",
      email: "test@example.com",
      points: 50,
      level: 6,
    }

    const mockAccess = {
      id: "access_123",
      user_id: "123",
      post_id: "post_123",
      timestamp: mockTimestamp,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_channel: null,
    }

    ;(verifyWebhook as MockVerifyWebhook).mockResolvedValue({
      isDuplicate: false,
    })

    const mockClientQuery = jest
      .fn()
      // @ts-ignore
      .mockResolvedValueOnce({
        rows: [mockUserData],
        command: "",
        rowCount: 1,
        oid: 0,
        fields: [],
      } as QueryResult)
      // @ts-ignore
      .mockResolvedValueOnce({
        rows: [mockAccess],
        command: "",
        rowCount: 1,
        oid: 0,
        fields: [],
      } as QueryResult)
      // @ts-ignore
      .mockResolvedValueOnce({
        rows: [{ count: "0" }],
        command: "",
        rowCount: 1,
        oid: 0,
        fields: [],
      } as QueryResult)
      // @ts-ignore
      .mockResolvedValueOnce({
        rows: [{ unique_days: 10 }],
        command: "",
        rowCount: 1,
        oid: 0,
        fields: [],
      } as QueryResult)
      // @ts-ignore
      .mockResolvedValueOnce({
        rows: [{ ...mockUserData, points: 50, level: 6, total_accesses: 5 }],
        command: "",
        rowCount: 1,
        oid: 0,
        fields: [],
      } as QueryResult)

    ;(withTransaction as jest.Mock).mockImplementationOnce((callback) => {
      const mockClient = { query: mockClientQuery } as unknown as PoolClient
      // @ts-ignore
      return callback(mockClient)
    })

    ;(query as MockQuery)
      .mockResolvedValueOnce({
        rows: [],
        command: "",
        rowCount: 0,
        oid: 0,
        fields: [],
      } as QueryResult)
      .mockResolvedValueOnce({
        rows: [{ count: "5" }],
        command: "",
        rowCount: 1,
        oid: 0,
        fields: [],
      } as QueryResult)

    const req = new NextRequest(
      new URL(
        "http://localhost/api/webhook?email=test@example.com&id=post_123",
      ),
    )
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toMatchObject({
      message: "Acesso registrado com sucesso",
      data: {
        email: mockUserData.email,
        totalAccesses: 5,
        currentAccess: {
          id: mockAccess.post_id,
          timestamp: mockTimestamp.toISOString(),
        },
        points: mockUserData.points,
        level: mockUserData.level,
      },
    })
  })

  it("deve retornar 500 em caso de erro", async () => {
    ;(verifyWebhook as MockVerifyWebhook).mockRejectedValue(
      new Error("Erro ao processar webhook"),
    )

    const req = new NextRequest(
      new URL(
        "http://localhost/api/webhook?email=test@example.com&id=post_123",
      ),
    )
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toMatchObject({
      error: "Erro ao processar webhook",
      message: "Erro ao processar webhook",
      retryable: true,
    })
  })

  it("deve retornar 429 em caso de muitas tentativas", async () => {
    ;(verifyWebhook as MockVerifyWebhook).mockRejectedValue(
      new Error("tentativas"),
    )

    const req = new NextRequest(
      new URL(
        "http://localhost/api/webhook?email=test@example.com&id=post_123",
      ),
    )
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data).toMatchObject({
      error: "Erro ao processar webhook",
      message: "tentativas",
      retryable: false,
    })
  })
})
