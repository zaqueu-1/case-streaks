import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isRootPath = pathname === "/"

  const token = await getToken({ req: request })
  const isAuthenticated = !!token
  const isAdmin = token?.isAdmin || false

  const isPublicPath = pathname === "/login"
  const isAdminPath = pathname === "/admin"
  const isDashboardPath = pathname === "/dashboard"

  const safePathname = pathname || "/"

  if (!isAuthenticated && !isPublicPath) {
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

  if (isRootPath) {
    return NextResponse.redirect(
      new URL(isAdmin ? "/admin" : "/dashboard", request.url),
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/login", "/dashboard", "/admin"],
}
