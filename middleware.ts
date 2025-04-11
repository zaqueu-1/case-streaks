import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname
    const token = await getToken({ req: request })
    const isAuthenticated = !!token
    const isAdmin = token?.isAdmin || false

    const isPublicPath = pathname === "/login"
    const isAdminPath = pathname === "/admin"
    const isDashboardPath = pathname === "/dashboard"

    // Origem para URLs redirecionadas
    const origin = request.nextUrl.origin
    
    // Se não estiver autenticado e tentar acessar rota protegida
    if (!isAuthenticated && !isPublicPath) {
      const url = new URL('/login', origin)
      if (pathname !== "/") {
        url.searchParams.set('callbackUrl', pathname)
      }
      return NextResponse.redirect(url)
    }

    // Se estiver autenticado e tentar acessar a página de login
    if (isAuthenticated && isPublicPath) {
      return NextResponse.redirect(
        new URL(isAdmin ? '/admin' : '/dashboard', origin)
      )
    }

    // Administrador tentando acessar dashboard
    if (isAuthenticated && isAdmin && isDashboardPath) {
      return NextResponse.redirect(new URL('/admin', origin))
    }

    // Usuário normal tentando acessar area administrativa
    if (isAuthenticated && !isAdmin && isAdminPath) {
      return NextResponse.redirect(new URL('/dashboard', origin))
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Erro no middleware:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/", "/login", "/dashboard", "/admin"],
}
