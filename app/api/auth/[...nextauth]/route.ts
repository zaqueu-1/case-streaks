import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { query } from "@/app/lib/postgres"
import { NextAuthOptions } from "next-auth"
import { JWT } from "next-auth/jwt"
import { Session } from "next-auth"

interface CustomUser {
  id: string
  email: string
  name: string
  isAdmin: boolean
}

interface CustomSession extends Session {
  user: {
    id: string
    email: string | null
    name: string | null
    isAdmin: boolean
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        try {
          if (!credentials?.email) {
            throw new Error("Email é obrigatório")
          }

          const result = await query("SELECT * FROM users WHERE email = $1", [
            credentials.email,
          ])

          if (result.rows.length === 0) {
            throw new Error(
              "Email não encontrado! Tem certeza que está usando o mesmo e-mail que recebe a newsletter?",
            )
          }

          const user = result.rows[0]

          return {
            id: user.id,
            email: user.email,
            name: user.email.split("@")[0],
            isAdmin: user.is_admin || false,
          }
        } catch (error) {
          console.error("Erro na autenticação:", error)
          throw error
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }): Promise<JWT & { isAdmin?: boolean }> {
      if (user) {
        token.id = user.id
        token.isAdmin = (user as CustomUser).isAdmin
      }
      return token
    },
    async session({ session, token }): Promise<CustomSession> {
      return {
        ...session,
        user: {
          id: token.id as string,
          email: session.user?.email || null,
          name: session.user?.name || null,
          isAdmin: token.isAdmin as boolean,
        },
      }
    },
  },
  debug: true,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
