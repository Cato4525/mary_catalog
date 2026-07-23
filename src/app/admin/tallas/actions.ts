"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase"

export async function createSize(formData: FormData) {
  const nombre = (formData.get("nombre") as string)?.trim()
  if (!nombre) return

  const { error } = await supabaseAdmin.from("sizes").insert({ nombre })
  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/tallas")
  redirect("/admin/tallas")
}

export async function updateSize(formData: FormData) {
  const id = formData.get("id")
  const nombre = (formData.get("nombre") as string)?.trim()
  if (!id || !nombre) return

  const { error } = await supabaseAdmin
    .from("sizes")
    .update({ nombre })
    .eq("id", Number(id))
  if (error) throw new Error(error.message)

  revalidatePath("/admin/tallas")
  redirect("/admin/tallas")
}

export async function toggleSize(formData: FormData) {
  const id = formData.get("id")
  const activo = formData.get("activo") === "true"
  if (!id) return

  const { error } = await supabaseAdmin
    .from("sizes")
    .update({ activo: !activo })
    .eq("id", Number(id))
  if (error) throw new Error(error.message)

  revalidatePath("/admin/tallas")
}

export async function deleteSize(formData: FormData) {
  const id = formData.get("id")
  if (!id) return

  await supabaseAdmin.from("sizes").delete().eq("id", Number(id))
  revalidatePath("/admin/tallas")
  redirect("/admin/tallas")
}
