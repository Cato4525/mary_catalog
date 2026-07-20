import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productIds = searchParams.get("ids")?.split(",").map(Number).filter(Boolean)

    if (!productIds || productIds.length === 0) {
      return NextResponse.json({})
    }

    const { data } = await supabase
      .from("product_likes")
      .select("product_id")
      .in("product_id", productIds)

    const counts: Record<number, number> = {}
    for (const id of productIds) counts[id] = 0
    for (const row of data || []) {
      counts[row.product_id] = (counts[row.product_id] || 0) + 1
    }

    return NextResponse.json(counts)
  } catch {
    return NextResponse.json({})
  }
}

export async function POST(request: Request) {
  try {
    const { product_id, visitor_id } = await request.json()

    if (!product_id || !visitor_id) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from("product_likes")
      .select("id")
      .eq("product_id", product_id)
      .eq("visitor_id", visitor_id)
      .single()

    if (existing) {
      await supabase.from("product_likes").delete().eq("id", existing.id)
    } else {
      await supabase.from("product_likes").insert({ product_id, visitor_id })
    }

    const { count } = await supabase
      .from("product_likes")
      .select("*", { count: "exact", head: true })
      .eq("product_id", product_id)

    return NextResponse.json({ liked: !existing, count: count || 0 })
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}
