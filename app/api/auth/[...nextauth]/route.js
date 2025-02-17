import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import connectDB from "../../../lib/mongodb"
import News from "../../../models/News"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        try {
          await connectDB()

          const userRecord = await News.findOne({ email: credentials.email })

          if (!userRecord) {
            throw new Error(
              "Email não encontrado! Tem certeza que está usando o mesmo e-mail que recebe a newsletter?",
            )
          }

          return {
            id: credentials.email,
            email: credentials.email,
            name: credentials.email.split("@")[0],
          }
        } catch (error) {
          console.error("Erro na autenticação:", error.message)
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
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
})

export { handler as GET, handler as POST }
