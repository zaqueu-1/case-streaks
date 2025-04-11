import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Verificar se a solicitação é válida
  if (!request.url || !request.nextUrl || !request.nextUrl.origin) {
    console.error("URL inválida na requisição:", request.url)
    return NextResponse.next()
  }

  try {
    const { pathname } = request.nextUrl
    const isRootPath = pathname === "/"

    const token = await getToken({ req: request })
    const isAuthenticated = !!token
    const isAdmin = token?.isAdmin || false

    const isPublicPath = pathname === "/login"
    const isAdminPath = pathname === "/admin"
    const isDashboardPath = pathname === "/dashboard"

    // Garantir que o pathname seja seguro e nunca vazio
    const safePathname = pathname || "/dashboard"
    // Garantir que baseUrl seja válido
    const baseUrl = request.nextUrl.origin || "https://casestreaks.vercel.app"

    if (!isAuthenticated && !isPublicPath) {
      // Criar redirecionamento manualmente em vez de usar new URL
      const redirectUrl = `${baseUrl}/login?callbackUrl=${encodeURIComponent(safePathname)}`
      return NextResponse.redirect(redirectUrl)
    }

    if (isAuthenticated && isPublicPath) {
      // Redirecionar para dashboard ou admin sem usar new URL
      const redirectUrl = `${baseUrl}${isAdmin ? '/admin' : '/dashboard'}`
      return NextResponse.redirect(redirectUrl)
    }

    if (isAuthenticated && isAdmin && isDashboardPath) {
      // Redirecionar para admin sem usar new URL
      return NextResponse.redirect(`${baseUrl}/admin`)
    }

    if (isAuthenticated && !isAdmin && isAdminPath) {
      // Redirecionar para dashboard sem usar new URL
      return NextResponse.redirect(`${baseUrl}/dashboard`)
    }

    if (isRootPath) {
      // Redirecionar para dashboard ou admin sem usar new URL
      const redirectUrl = `${baseUrl}${isAdmin ? '/admin' : '/dashboard'}`
      return NextResponse.redirect(redirectUrl)
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
