import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

export async function middleware(request) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token
  const isAdmin = token?.isAdmin || false

  const { pathname, searchParams } = request.nextUrl
  const isPublicPath = pathname === "/login"
  const isAdminPath = pathname === "/admin"
  const isDashboardPath = pathname === "/dashboard"

  console.log("Token:", token)
  console.log("Is Admin:", isAdmin)
  console.log("Current Path:", pathname)

  // Webhook redirect
  if (pathname === "/" && searchParams.has("email") && searchParams.has("id")) {
    return NextResponse.redirect(
      new URL(`/api/webhook?${searchParams.toString()}`, request.url),
    )
  }

  // Auth checks
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Admin access
  if (isAuthenticated && isAdmin && isDashboardPath) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  // Non-admin access
  if (isAuthenticated && !isAdmin && isAdminPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Public path redirect
  if (isAuthenticated && isPublicPath) {
    return isAdmin
      ? NextResponse.redirect(new URL("/admin", request.url))
      : NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/login", "/dashboard", "/admin"],
}
