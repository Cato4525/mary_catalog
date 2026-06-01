import { supabase } from "@/lib/supabase"
import { supabaseAdmin } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function GET() {
  const { data } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single()

  return NextResponse.json(data || {})
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { store_name, store_description, contact_email, contact_phone, address, logo_url } = body

    const { data, error } = await supabaseAdmin
      .from("store_settings")
      .update({
        store_name: store_name || "",
        store_description: store_description || "",
        contact_email: contact_email || "",
        contact_phone: contact_phone || "",
        address: address || "",
        logo_url: logo_url || "",
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
