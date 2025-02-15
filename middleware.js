import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

export async function middleware(request) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  const { pathname, searchParams } = request.nextUrl
  const isPublicPath = pathname === "/login"

  if (pathname === "/" && searchParams.has("email") && searchParams.has("id")) {
    return NextResponse.redirect(
      new URL(`/api/webhook?${searchParams.toString()}`, request.url),
    )
  }

  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/login", "/dashboard"],
}
