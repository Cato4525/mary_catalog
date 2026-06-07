import { supabase } from "@/lib/supabase"
import type { Category } from "@/lib/types"
import Link from "next/link"
import CategoryRow from "./CategoryRow"
import CategoryCard from "./CategoryCard"

export default async function CategoriasPage() {
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("nombre")

  const cats = (categories as Category[]) || []

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900 active:scale-[0.97]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver al Panel
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
        <Link
          href="/admin/categorias/nueva"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md active:scale-[0.97]"
        >
          + Nueva Categoría
        </Link>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cats.length > 0 ? (
              cats.map((cat) => (
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

      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden">
        {cats.length > 0 ? (
          cats.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="mb-3 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg font-medium">No hay categorías</p>
            <p className="text-sm">Crea tu primera categoría para comenzar</p>
          </div>
        )}
      </div>
    </div>
  )
}
