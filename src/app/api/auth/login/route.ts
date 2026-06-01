import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { email, password } = await request.json()

  const adminEmail = process.env.ADMIN_EMAIL || "admin@maryleggings.com"
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123"

  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
  }

  const cookieStore = cookies()
  const session = btoa(JSON.stringify({ email, time: Date.now() }))
  cookieStore.set("admin_session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  })

  return NextResponse.json({ ok: true })
}
