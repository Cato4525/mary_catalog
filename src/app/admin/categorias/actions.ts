"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase"

export async function createCategory(formData: FormData) {
  const nombre = (formData.get("nombre") as string)?.trim()
  if (!nombre) return { error: "Nombre requerido" }

  const { data: existing } = await supabaseAdmin
    .from("categories")
    .select("id")
    .ilike("nombre", nombre)
    .maybeSingle()

  if (existing) return { error: "Ya existe una categoría con ese nombre" }

  await supabaseAdmin.from("categories").insert({ nombre })
  revalidatePath("/admin/categorias")
}

export async function updateCategory(formData: FormData) {
  const id = Number(formData.get("id"))
  const nombre = (formData.get("nombre") as string)?.trim()
  if (!id || !nombre) return { error: "Datos incompletos" }

  const { data: existing } = await supabaseAdmin
    .from("categories")
    .select("id")
    .ilike("nombre", nombre)
    .neq("id", id)
    .maybeSingle()

  if (existing) return { error: "Ya existe una categoría con ese nombre" }

  await supabaseAdmin
    .from("categories")
    .update({ nombre })
    .eq("id", id)

  revalidatePath("/admin/categorias")
}

export async function deleteCategory(formData: FormData) {
  const id = formData.get("id")
  if (!id) return

  await supabaseAdmin.from("categories").delete().eq("id", Number(id))
  revalidatePath("/admin/categorias")
}
