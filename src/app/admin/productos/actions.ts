"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase"
import { deleteFromStorage } from "@/lib/upload"

export async function deleteProduct(formData: FormData) {
  const id = formData.get("id")
  if (!id) return

  const { data: images } = await supabaseAdmin
    .from("product_images")
    .select("url")
    .eq("product_id", Number(id))

  if (images && images.length > 0) {
    await deleteFromStorage(images.map((img) => img.url))
  }

  await supabaseAdmin.from("products").delete().eq("id", Number(id))

  revalidatePath("/admin/productos")
  redirect("/admin/productos")
}

export async function toggleDisponible(formData: FormData) {
  const id = formData.get("id")
  const disponible = formData.get("disponible") === "true"
  if (!id) return

  const update: Record<string, any> = { disponible }
  if (disponible) {
    update.fecha_activacion = new Date().toISOString()
  }

  await supabaseAdmin.from("products").update(update).eq("id", Number(id))

  revalidatePath("/admin/productos")
  revalidatePath("/")
}

export async function checkExpiredProducts() {
  const quinceDias = new Date()
  quinceDias.setDate(quinceDias.getDate() - 15)

  const { data: expired } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("disponible", true)
    .lt("fecha_activacion", quinceDias.toISOString())

  if (expired && expired.length > 0) {
    const ids = expired.map((p) => p.id)
    await supabaseAdmin
      .from("products")
      .update({ disponible: false })
      .in("id", ids)
  }

  return expired?.length || 0
}
