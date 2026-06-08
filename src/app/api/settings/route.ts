import { getSession } from "@/lib/auth"
import { supabase, supabaseAdmin } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function GET() {
  console.log("[settings] GET /api/settings called")
  try {
    const { data } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .single()

    console.log("[settings] GET success:", data?.id)
    return NextResponse.json(data || {})
  } catch (err) {
    console.error("[settings] GET error:", err)
    return NextResponse.json({ error: "Error al obtener ajustes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { store_name, store_description, contact_email, contact_phone, address, logo_url, whatsapp } = body

    const { data, error } = await supabaseAdmin
      .from("store_settings")
      .update({
        store_name: store_name || "",
        store_description: store_description || "",
        contact_email: contact_email || "",
        contact_phone: contact_phone || "",
        address: address || "",
        logo_url: logo_url || "",
        whatsapp: whatsapp || "",
      })
      .eq("id", 1)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidatePath("/")
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    )
  }
}
