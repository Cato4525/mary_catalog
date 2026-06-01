import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  const { email, password } = await request.json()

  const adminEmail = process.env.ADMIN_EMAIL

  if (!adminEmail) {
    return NextResponse.json(
      { error: "ADMIN_EMAIL no configurado" },
      { status: 500 }
    )
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (error) {
    console.error("Supabase login error:", error)

    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    )
  }

  if (!data.user) {
    return NextResponse.json(
      { error: "Usuario no encontrado" },
      { status: 401 }
    )
  }

  if (data.user.email !== adminEmail) {
    return NextResponse.json(
      { error: "Acceso denegado" },
      { status: 403 }
    )
  }

  const cookieStore = await cookies()

  const session = btoa(
    JSON.stringify({
      email: data.user.email,
      time: Date.now(),
    })
  )

  cookieStore.set("admin_session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  })

  return NextResponse.json({ ok: true })
}
