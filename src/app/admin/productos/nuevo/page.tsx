import { supabase } from "@/lib/supabase"
import type { Category } from "@/lib/types"
import ProductForm from "../ProductForm"

export default async function NuevoProductoPage() {
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("nombre")

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Nuevo Producto</h1>
      <ProductForm categories={(categories as Category[]) || []} />
    </div>
  )
}
