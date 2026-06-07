"use client"

import Link from "next/link"
import { deleteCategory } from "./actions"

interface Props {
  category: { id: number; nombre: string }
}

export default function CategoryCard({ category }: Props) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400">#{category.id}</p>
        <p className="truncate font-medium text-gray-900">{category.nombre}</p>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <Link
          href={`/admin/categorias/${category.id}`}
          className="rounded-lg bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-200 active:scale-[0.97]"
        >
          Editar
        </Link>
        <form action={deleteCategory} method="POST" className="inline">
          <input type="hidden" name="id" value={category.id} />
          <button
            type="submit"
            className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-100 active:scale-[0.97]"
            onClick={(e) => {
              if (!confirm("¿Eliminar esta categoría?")) {
                e.preventDefault()
              }
            }}
          >
            Eliminar
          </button>
        </form>
      </div>
    </div>
  )
}
