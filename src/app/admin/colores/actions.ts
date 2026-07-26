"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase"

export async function createColor(formData: FormData) {
  const nombre = (formData.get("nombre") as string)?.trim()
  const codigo_hex = (formData.get("codigo_hex") as string)?.trim() || "#808080"
  if (!nombre) return { error: "Nombre requerido" }

  const { data: existing } = await supabaseAdmin
    .from("colors")
    .select("id")
    .ilike("nombre", nombre)
    .maybeSingle()

  if (existing) return { error: "Ya existe un color con ese nombre" }

  await supabaseAdmin.from("colors").insert({ nombre, codigo_hex })
  revalidatePath("/admin/colores")
}

export async function updateColor(formData: FormData) {
  const id = formData.get("id")
  const nombre = (formData.get("nombre") as string)?.trim()
  const codigo_hex = (formData.get("codigo_hex") as string)?.trim()
  if (!id || !nombre) return { error: "Datos incompletos" }

  const { data: existing } = await supabaseAdmin
    .from("colors")
    .select("id")
    .ilike("nombre", nombre)
    .neq("id", Number(id))
    .maybeSingle()

  if (existing) return { error: "Ya existe un color con ese nombre" }

  const update: Record<string, unknown> = { nombre }
  if (codigo_hex) update.codigo_hex = codigo_hex

  await supabaseAdmin
    .from("colors")
    .update(update)
    .eq("id", Number(id))

  revalidatePath("/admin/colores")
}

export async function toggleColor(formData: FormData) {
  const id = formData.get("id")
  const activo = formData.get("activo") === "true"
  if (!id) return

  await supabaseAdmin
    .from("colors")
    .update({ activo: !activo })
    .eq("id", Number(id))

  revalidatePath("/admin/colores")
}

export async function deleteColor(formData: FormData) {
  const id = formData.get("id")
  if (!id) return

  await supabaseAdmin.from("colors").delete().eq("id", Number(id))
  revalidatePath("/admin/colores")
}
