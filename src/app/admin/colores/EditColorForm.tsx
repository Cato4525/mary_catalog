"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { updateColor } from "../actions"
import HexColorInput from "@/components/HexColorInput"

interface Props {
  color: { id: number; nombre: string; codigo_hex: string }
}

export default function EditColorForm({ color }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        formData.set("id", String(color.id))
        startTransition(async () => {
          await updateColor(formData)
          router.push("/admin/colores")
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
          defaultValue={color.nombre}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Color HEX</label>
        <div className="flex items-center gap-3">
          <input
            name="codigo_hex"
            type="color"
            defaultValue={color.codigo_hex}
            className="h-10 w-14 cursor-pointer rounded-lg border border-gray-300 p-0.5"
          />
          <HexColorInput defaultValue={color.codigo_hex} />
        </div>
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
          href="/admin/colores"
          className="rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-200 active:scale-[0.97]"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
