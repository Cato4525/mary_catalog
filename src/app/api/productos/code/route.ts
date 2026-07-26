import { supabaseAdmin } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const prefix = searchParams.get("prefix")?.toUpperCase() || ""

    if (!prefix) {
      return NextResponse.json({ error: "prefix es requerido" }, { status: 400 })
    }

    const { data } = await supabaseAdmin
      .from("products")
      .select("codigo")
      .like("codigo", `${prefix}-%`)
      .order("codigo", { ascending: false })

    let nextNum = 1
    if (data && data.length > 0) {
      const lastCode = data[0].codigo
      const match = lastCode.match(/-(\d+)$/)
      if (match) {
        nextNum = parseInt(match[1], 10) + 1
      }
    }

    const code = `${prefix}-${String(nextNum).padStart(3, "0")}`
    return NextResponse.json({ code })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    )
  }
}
