"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase"

export async function createSize(formData: FormData) {
  const nombre = (formData.get("nombre") as string)?.trim()
  if (!nombre) return { error: "Nombre requerido" }

  const { data: existing } = await supabaseAdmin
    .from("sizes")
    .select("id")
    .ilike("nombre", nombre)
    .maybeSingle()

  if (existing) return { error: "Ya existe una talla con ese nombre" }

  await supabaseAdmin.from("sizes").insert({ nombre })
  revalidatePath("/admin/tallas")
}

export async function updateSize(formData: FormData) {
  const id = formData.get("id")
  const nombre = (formData.get("nombre") as string)?.trim()
  if (!id || !nombre) return { error: "Datos incompletos" }

  const { data: existing } = await supabaseAdmin
    .from("sizes")
    .select("id")
    .ilike("nombre", nombre)
    .neq("id", Number(id))
    .maybeSingle()

  if (existing) return { error: "Ya existe una talla con ese nombre" }

  await supabaseAdmin
    .from("sizes")
    .update({ nombre })
    .eq("id", Number(id))

  revalidatePath("/admin/tallas")
}

export async function toggleSize(formData: FormData) {
  const id = formData.get("id")
  const activo = formData.get("activo") === "true"
  if (!id) return

  await supabaseAdmin
    .from("sizes")
    .update({ activo: !activo })
    .eq("id", Number(id))

  revalidatePath("/admin/tallas")
}

export async function deleteSize(formData: FormData) {
  const id = formData.get("id")
  if (!id) return

  await supabaseAdmin.from("sizes").delete().eq("id", Number(id))
  revalidatePath("/admin/tallas")
}
