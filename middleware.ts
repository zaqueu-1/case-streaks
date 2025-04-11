import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const isWebhookRequest = searchParams.has("email") && searchParams.has("id")
  const isWebhookPath = pathname === "/api/webhook"
  const isRootPath = pathname === "/"

  // Se for uma requisição de webhook na raiz, redireciona para /api/webhook
  if (isRootPath && isWebhookRequest) {
    console.log(
      "Redirecionando webhook da raiz para /api/webhook:",
      searchParams.toString(),
    )
    const url = request.nextUrl.clone()
    url.pathname = "/api/webhook"
    return NextResponse.rewrite(url)
  }

  // Se for uma requisição normal na raiz ou outras rotas protegidas
  const token = await getToken({ req: request })
  const isAuthenticated = !!token
  const isAdmin = token?.isAdmin || false

  const isPublicPath = pathname === "/login"
  const isAdminPath = pathname === "/admin"
  const isDashboardPath = pathname === "/dashboard"

  // Garantir que o pathname seja uma string válida
  const safePathname = pathname || "/"

  if (!isAuthenticated && !isPublicPath && !isWebhookPath) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", safePathname)
    return NextResponse.redirect(url)
  }

  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(
      new URL(isAdmin ? "/admin" : "/dashboard", request.url),
    )
  }

  if (isAuthenticated && isAdmin && isDashboardPath) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  if (isAuthenticated && !isAdmin && isAdminPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (isRootPath && !isWebhookRequest) {
    return NextResponse.redirect(
      new URL(isAdmin ? "/admin" : "/dashboard", request.url),
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/login", "/dashboard", "/admin", "/api/webhook"],
}
