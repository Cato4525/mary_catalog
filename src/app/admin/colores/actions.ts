"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase"

export async function createColor(formData: FormData) {
  const nombre = (formData.get("nombre") as string)?.trim()
  const codigo_hex = (formData.get("codigo_hex") as string)?.trim() || "#808080"
  if (!nombre) return

  const { error } = await supabaseAdmin.from("colors").insert({ nombre, codigo_hex })
  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/colores")
  redirect("/admin/colores")
}

export async function updateColor(formData: FormData) {
  const id = formData.get("id")
  const nombre = (formData.get("nombre") as string)?.trim()
  const codigo_hex = (formData.get("codigo_hex") as string)?.trim()
  if (!id || !nombre) return

  const update: Record<string, unknown> = { nombre }
  if (codigo_hex) update.codigo_hex = codigo_hex

  const { error } = await supabaseAdmin
    .from("colors")
    .update(update)
    .eq("id", Number(id))
  if (error) throw new Error(error.message)

  revalidatePath("/admin/colores")
  redirect("/admin/colores")
}

export async function toggleColor(formData: FormData) {
  const id = formData.get("id")
  const activo = formData.get("activo") === "true"
  if (!id) return

  const { error } = await supabaseAdmin
    .from("colors")
    .update({ activo: !activo })
    .eq("id", Number(id))
  if (error) throw new Error(error.message)

  revalidatePath("/admin/colores")
}

export async function deleteColor(formData: FormData) {
  const id = formData.get("id")
  if (!id) return

  await supabaseAdmin.from("colors").delete().eq("id", Number(id))
  revalidatePath("/admin/colores")
  redirect("/admin/colores")
}
