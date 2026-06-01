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
