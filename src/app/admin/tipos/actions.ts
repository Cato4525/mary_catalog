"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase"

export async function createTipo(formData: FormData) {
  const nombre = (formData.get("nombre") as string)?.trim()
  if (!nombre) return { error: "Nombre requerido" }

  const { data: existing } = await supabaseAdmin
    .from("product_types")
    .select("id")
    .ilike("nombre", nombre)
    .maybeSingle()

  if (existing) return { error: "Ya existe un tipo con ese nombre" }

  await supabaseAdmin.from("product_types").insert({ nombre })
  revalidatePath("/admin/tipos")
}

export async function updateTipo(formData: FormData) {
  const id = formData.get("id")
  const nombre = (formData.get("nombre") as string)?.trim()
  if (!id || !nombre) return { error: "Datos incompletos" }

  const { data: existing } = await supabaseAdmin
    .from("product_types")
    .select("id")
    .ilike("nombre", nombre)
    .neq("id", Number(id))
    .maybeSingle()

  if (existing) return { error: "Ya existe un tipo con ese nombre" }

  await supabaseAdmin
    .from("product_types")
    .update({ nombre })
    .eq("id", Number(id))

  revalidatePath("/admin/tipos")
}

export async function deleteTipo(formData: FormData) {
  const id = formData.get("id")
  if (!id) return

  await supabaseAdmin.from("product_types").delete().eq("id", Number(id))
  revalidatePath("/admin/tipos")
}
