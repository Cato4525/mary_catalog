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

    let nextNum = 1
    for (const row of data || []) {
      const match = String(row.codigo).match(/-(\d+)$/)
      if (match) {
        nextNum = Math.max(nextNum, parseInt(match[1], 10) + 1)
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
