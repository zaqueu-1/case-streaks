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

          const userRecord = await News.findOne({
            email: credentials.email,
          }).lean()

          if (!userRecord) {
            throw new Error(
              "Email não encontrado! Tem certeza que está usando o mesmo e-mail que recebe a newsletter?",
            )
          }

          const user = {
            id: credentials.email,
            email: credentials.email,
            name: credentials.email.split("@")[0],
            isAdmin: userRecord.isAdmin,
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
        session.user.id = token.id
        session.user.isAdmin = token.isAdmin
      }
      return session
    },
  },
  debug: true,
})

export { handler as GET, handler as POST }
