"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase"

export async function createCategory(formData: FormData) {
  const nombre = formData.get("nombre") as string
  if (!nombre?.trim()) return

  const { error } = await supabaseAdmin
    .from("categories")
    .insert({ nombre: nombre.trim() })

  if (error) throw new Error(error.message)

  revalidatePath("/admin/categorias")
  redirect("/admin/categorias")
}

export async function updateCategory(formData: FormData) {
  const id = Number(formData.get("id"))
  const nombre = formData.get("nombre") as string
  if (!id || !nombre?.trim()) return

  const { error } = await supabaseAdmin
    .from("categories")
    .update({ nombre: nombre.trim() })
    .eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath("/admin/categorias")
  redirect("/admin/categorias")
}

export async function deleteCategory(formData: FormData) {
  const id = formData.get("id")
  if (!id) return

  await supabaseAdmin.from("categories").delete().eq("id", Number(id))

  revalidatePath("/admin/categorias")
  redirect("/admin/categorias")
}
