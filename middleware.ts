import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Verificação de segurança inicial
  if (!request.nextUrl) {
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

    // Usar URL base segura para redirecionamentos
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin || "https://casestreaks.vercel.app"

    if (!isAuthenticated && !isPublicPath) {
      return NextResponse.redirect(`${baseUrl}/login${pathname !== "/" ? `?callbackUrl=${encodeURIComponent(pathname)}` : ""}`)
    }

    if (isAuthenticated && isPublicPath) {
      return NextResponse.redirect(`${baseUrl}${isAdmin ? '/admin' : '/dashboard'}`)
    }

    if (isAuthenticated && isAdmin && isDashboardPath) {
      return NextResponse.redirect(`${baseUrl}/admin`)
    }

    if (isAuthenticated && !isAdmin && isAdminPath) {
      return NextResponse.redirect(`${baseUrl}/dashboard`)
    }

    // Não redirecionamos a página inicial aqui para evitar conflitos com SSG
    // O redirecionamento da página inicial é feito diretamente no componente com script

    return NextResponse.next()
  } catch (error) {
    console.error("Erro no middleware:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/", "/login", "/dashboard", "/admin"],
}
