import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Verificar se temos uma URL válida
  if (!request.nextUrl) {
    return NextResponse.next()
  }

  try {
    const { pathname } = request.nextUrl
    
    // Pular o middleware para a página raiz durante a pré-renderização
    // A página raiz lidará com o redirecionamento do lado do cliente
    if (pathname === "/" && process.env.NODE_ENV === "production" && !request.headers.get("user-agent")) {
      return NextResponse.next()
    }

    const token = await getToken({ req: request })
    const isAuthenticated = !!token
    const isAdmin = token?.isAdmin || false

    const isPublicPath = pathname === "/login"
    const isAdminPath = pathname === "/admin"
    const isDashboardPath = pathname === "/dashboard"

    // Verificar se estamos em produção ou não
    const baseUrl = request.nextUrl.origin

    if (!isAuthenticated && !isPublicPath) {
      return NextResponse.redirect(new URL(`/login${pathname !== "/" ? `?callbackUrl=${encodeURIComponent(pathname)}` : ""}`, baseUrl))
    }

    if (isAuthenticated && isPublicPath) {
      return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/dashboard', baseUrl))
    }

    if (isAuthenticated && isAdmin && isDashboardPath) {
      return NextResponse.redirect(new URL('/admin', baseUrl))
    }

    if (isAuthenticated && !isAdmin && isAdminPath) {
      return NextResponse.redirect(new URL('/dashboard', baseUrl))
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
