import { supabase } from "@/lib/supabase"
import type { Category } from "@/lib/types"
import Link from "next/link"
import CategoryRow from "./CategoryRow"

export default async function CategoriasPage() {
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("nombre")

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
        <Link
          href="/admin/categorias/nueva"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          + Nueva Categoría
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories && categories.length > 0 ? (
              (categories as Category[]).map((cat) => (
                <CategoryRow key={cat.id} category={cat} />
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-gray-400">
                  No hay categorías
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
