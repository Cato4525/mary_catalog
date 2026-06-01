import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === "/admin/login") {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get("admin_session")

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  try {
    const data = JSON.parse(atob(sessionCookie.value))
    if (data.email !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  } catch {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
}
