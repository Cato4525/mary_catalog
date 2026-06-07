"use client"

import { useRouter } from "next/navigation"
import { useFormState, useFormStatus } from "react-dom"
import { createCategory, updateCategory } from "./actions"

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md active:scale-[0.97] disabled:opacity-50"
    >
      {pending ? "Guardando..." : editing ? "Guardar Cambios" : "Crear Categoría"}
    </button>
  )
}

interface Props {
  category?: { id: number; nombre: string }
}

export default function CategoryForm({ category }: Props) {
  const router = useRouter()
  const wrappedAction = async (_prev: string | null, formData: FormData) => {
    if (category) {
      formData.set("id", String(category.id))
    }
    try {
      const fn = category ? updateCategory : createCategory
      await fn(formData)
      return null
    } catch (err) {
      return err instanceof Error ? err.message : "Error al guardar"
    }
  }

  const [error, formAction] = useFormState(wrappedAction, null)

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Nombre *</label>
        <input
          name="nombre"
          type="text"
          required
          defaultValue={category?.nombre || ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton editing={!!category} />
        <button
          type="button"
          onClick={() => router.push("/admin/categorias")}
          className="rounded-lg bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-200 active:scale-[0.97]"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
