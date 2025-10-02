import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthenticated = !!getSessionCookie(request)

  // Skip static & API
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next()
  }

  // Auth routes
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/select-organization")
  const isOrgProtected = /^\/org\/[^\/]+\/(dashboard|members|settings|tickets)/.test(pathname)
  const isGeneralProtected = pathname.startsWith("/organizations")

  if (isAuthenticated) {
    if (isAuthRoute || pathname === "/") {
      return NextResponse.redirect(new URL("/select-organization", request.url))
    }
    return NextResponse.next()
  }

  if (isOrgProtected) {
    const orgSlug = pathname.split("/")[2]
    return NextResponse.redirect(new URL(`/org/${orgSlug}/login`, request.url))
  }

  if (isGeneralProtected || pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
}
