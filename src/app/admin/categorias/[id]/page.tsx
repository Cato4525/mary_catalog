import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import CategoryForm from "../CategoryForm"

export default async function EditarCategoriaPage({
  params,
}: {
  params: { id: string }
}) {
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", Number(params.id))
    .single()

  if (!category) notFound()

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Editar Categoría</h1>
      <CategoryForm category={category} />
    </div>
  )
}
