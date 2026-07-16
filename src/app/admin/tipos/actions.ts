"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase"

export async function createTipo(formData: FormData) {
  const nombre = (formData.get("nombre") as string)?.trim()
  if (!nombre) return

  const { error } = await supabaseAdmin.from("product_types").insert({ nombre })
  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/tipos")
  redirect("/admin/tipos")
}

export async function updateTipo(formData: FormData) {
  const id = formData.get("id")
  const nombre = (formData.get("nombre") as string)?.trim()
  if (!id || !nombre) return

  const { error } = await supabaseAdmin
    .from("product_types")
    .update({ nombre })
    .eq("id", Number(id))
  if (error) throw new Error(error.message)

  revalidatePath("/admin/tipos")
  redirect("/admin/tipos")
}

export async function deleteTipo(formData: FormData) {
  const id = formData.get("id")
  if (!id) return

  await supabaseAdmin.from("product_types").delete().eq("id", Number(id))
  revalidatePath("/admin/tipos")
  redirect("/admin/tipos")
}
