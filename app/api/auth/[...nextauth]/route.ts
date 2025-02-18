import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import connectDB from "../../../lib/mongodb"
import News from "../../../models/News"
import { NextAuthOptions } from "next-auth"

interface Credentials {
  email: string
}

interface User {
  id: string
  email: string
  name: string
  isAdmin: boolean
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email) {
            throw new Error("Email é obrigatório")
          }

          await connectDB()

          const userRecord = await News.findOne({
            email: credentials.email,
          }).lean()

          if (!userRecord) {
            throw new Error(
              "Email não encontrado! Tem certeza que está usando o mesmo e-mail que recebe a newsletter?",
            )
          }

          const user: User = {
            id: credentials.email,
            email: credentials.email,
            name: credentials.email.split("@")[0],
            isAdmin: userRecord.isAdmin || false,
          }
          return user
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    },
  },
  debug: true,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
