import { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { query } from "../../lib/postgres"
import { middleware } from "../../../middleware"
import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import { QueryResult } from "pg"
import { GET, POST } from "../auth/[...nextauth]/route"
import supabase from "@/app/lib/supabase"

jest.mock("next-auth/jwt")
jest.mock("../../lib/postgres")

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
        is_admin: false,
      },
      error: null,
    }),
  },
}))

type MockQuery = jest.MockedFunction<typeof query>
type MockGetToken = jest.MockedFunction<typeof getToken>

async function testAuthentication(email: string) {
  const result = await query("SELECT * FROM users WHERE email = $1", [email])

  if (result.rows.length === 0) {
    throw new Error("Email não encontrado!")
  }

  const user = result.rows[0]
  return {
    id: user.id,
    email: user.email,
    name: user.email.split("@")[0],
    isAdmin: user.is_admin || false,
  }
}

describe("Auth API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Middleware de Autenticação", () => {
    it("deve redirecionar para login se não estiver autenticado", async () => {
      ;(getToken as MockGetToken).mockResolvedValue(null)

      const req = new NextRequest(new URL("http://localhost/dashboard"))
      const response = await middleware(req)

      expect(response?.status).toBe(307)
      expect(response?.headers.get("location")).toContain("/login")
    })

    it("deve permitir acesso ao dashboard se estiver autenticado", async () => {
      ;(getToken as MockGetToken).mockResolvedValue({
        email: "test@example.com",
        isAdmin: false,
      })

      const req = new NextRequest(new URL("http://localhost/dashboard"))
      const response = await middleware(req)

      expect(response?.status).toBe(200)
    })

    it("deve redirecionar admin para /admin se tentar acessar /dashboard", async () => {
      ;(getToken as MockGetToken).mockResolvedValue({
        email: "admin@example.com",
        isAdmin: true,
      })

      const req = new NextRequest(new URL("http://localhost/dashboard"))
      const response = await middleware(req)

      expect(response?.status).toBe(307)
      expect(response?.headers.get("location")).toContain("/admin")
    })

    it("deve redirecionar usuário para /dashboard se tentar acessar /admin", async () => {
      ;(getToken as MockGetToken).mockResolvedValue({
        email: "test@example.com",
        isAdmin: false,
      })

      const req = new NextRequest(new URL("http://localhost/admin"))
      const response = await middleware(req)

      expect(response?.status).toBe(307)
      expect(response?.headers.get("location")).toContain("/dashboard")
    })
  })

  describe("Autenticação de Usuário", () => {
    beforeEach(() => {
      jest.resetAllMocks()
      jest.resetModules()
    })

    it("deve autenticar usuário com email válido", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        is_admin: false,
      }

      ;(query as MockQuery).mockResolvedValueOnce({
        rows: [mockUser],
        command: "SELECT",
        rowCount: 1,
        oid: 0,
        fields: [],
      } as QueryResult)

      const result = await testAuthentication("test@example.com")

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: "test",
        isAdmin: mockUser.is_admin,
      })

      expect(query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE email = $1",
        ["test@example.com"],
      )
    })

    it("deve retornar erro para email inválido", async () => {
      ;(query as MockQuery).mockResolvedValueOnce({
        rows: [],
        command: "SELECT",
        rowCount: 0,
        oid: 0,
        fields: [],
      } as QueryResult)

      await expect(testAuthentication("invalid@example.com")).rejects.toThrow(
        "Email não encontrado!",
      )

      expect(query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE email = $1",
        ["invalid@example.com"],
      )
    })
  })

  it("deve autenticar um usuário existente", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/session", {
      method: "GET",
      headers: {
        cookie: "next-auth.session-token=test-token",
      },
    })

    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty("user")
    expect(data.user).toHaveProperty("email", "test@example.com")
  })

  it("deve retornar erro para usuário não encontrado", async () => {
    // Mock do Supabase para retornar erro
    const mockSupabase = jest.requireMock("@/app/lib/supabase") as jest.Mocked<typeof supabase>
    mockSupabase.default.from().select().eq().single.mockResolvedValueOnce({
      data: null,
      error: { message: "Usuário não encontrado" },
    })

    const req = new NextRequest("http://localhost:3000/api/auth/session", {
      method: "GET",
      headers: {
        cookie: "next-auth.session-token=test-token",
      },
    })

    const response = await GET(req)
    expect(response.status).toBe(401)
  })
})
