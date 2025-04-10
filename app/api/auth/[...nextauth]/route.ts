import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import supabase from "@/app/lib/supabase"
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

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        try {
          console.log("Iniciando autenticação para:", credentials?.email);
          console.log("URL do Supabase:", process.env.NEXT_PUBLIC_SUPABASE_URL);
          
          if (!credentials?.email) {
            console.error("Email não fornecido");
            throw new Error("Email é obrigatório")
          }

          try {
            const { data: testData, error: testError } = await supabase
              .from('users')
              .select('*', { count: 'exact', head: true })
            
            if (testError) {
              console.error("Erro ao testar conexão com o Supabase:", testError);
              throw testError;
            }
            
            console.log("Conexão com o Supabase OK, resultado:", testData);
          } catch (dbError) {
            console.error("Erro ao testar conexão com o Supabase:", dbError);
            throw new Error("Erro de conexão com o banco de dados. Tente novamente mais tarde.");
          }

          // Buscar usuário pelo email
          console.log("Buscando usuário com email:", credentials.email);
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single();

          if (error) {
            console.error("Erro ao buscar usuário:", error);
            throw new Error("Erro ao buscar usuário. Tente novamente mais tarde.");
          }

          console.log("Resultado da consulta:", data ? "Usuário encontrado" : "Usuário não encontrado");

          if (!data) {
            console.error("Email não encontrado:", credentials.email);
            throw new Error(
              "Email não encontrado! Tem certeza que está usando o mesmo e-mail que recebe a newsletter?",
            )
          }

          console.log("Usuário autenticado com sucesso:", data.email);

          return {
            id: data.id,
            email: data.email,
            name: data.email.split("@")[0],
            isAdmin: data.is_admin || false,
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
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
