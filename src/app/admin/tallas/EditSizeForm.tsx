"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { updateSize } from "./actions"

interface Props {
  size: { id: number; nombre: string }
}

export default function EditSizeForm({ size }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        formData.set("id", String(size.id))
        startTransition(async () => {
          await updateSize(formData)
          router.push("/admin/tallas")
          router.refresh()
        })
      }}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Nombre *</label>
        <input
          name="nombre"
          type="text"
          required
          defaultValue={size.nombre}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md active:scale-[0.97] disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar Cambios"}
        </button>
        <Link
          href="/admin/tallas"
          className="rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-200 active:scale-[0.97]"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
