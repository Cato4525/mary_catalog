"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase"
import { deleteFromStorage } from "@/lib/upload"

export async function deleteProduct(formData: FormData) {
  const id = formData.get("id")
  if (!id) return

  const { data: variants } = await supabaseAdmin
    .from("product_variants")
    .select("id")
    .eq("product_id", Number(id))

  if (variants && variants.length > 0) {
    const variantIds = variants.map((v) => v.id)
    const { data: images } = await supabaseAdmin
      .from("product_images")
      .select("url")
      .in("variant_id", variantIds)

    if (images && images.length > 0) {
      await deleteFromStorage(images.map((img) => img.url))
    }
  }

  await supabaseAdmin.from("products").delete().eq("id", Number(id))

  revalidatePath("/admin/productos")
  redirect("/admin/productos")
}

export async function toggleDisponible(formData: FormData) {
  const id = formData.get("id")
  const disponible = formData.get("disponible") === "true"
  if (!id) return

  await supabaseAdmin
    .from("products")
    .update({ disponible })
    .eq("id", Number(id))

  revalidatePath("/admin/productos")
  revalidatePath("/")
}

export async function checkExpiredProducts() {
  return 0
}
