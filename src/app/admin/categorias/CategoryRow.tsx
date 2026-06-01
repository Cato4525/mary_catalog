"use client"

import Link from "next/link"
import { deleteCategory } from "./actions"

interface Props {
  category: { id: number; nombre: string }
}

export default function CategoryRow({ category }: Props) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-gray-500">{category.id}</td>
      <td className="px-4 py-3 font-medium text-gray-900">{category.nombre}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/categorias/${category.id}`}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Editar
          </Link>
          <form action={deleteCategory} method="POST" className="inline">
            <input type="hidden" name="id" value={category.id} />
            <button
              type="submit"
              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
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
      </td>
    </tr>
  )
}
