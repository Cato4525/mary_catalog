import Link from "next/link"
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
      <Link
        href="/admin/categorias"
        className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900 active:scale-[0.97]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a Categorías
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Editar Categoría</h1>
      <CategoryForm category={category} />
    </div>
  )
}
