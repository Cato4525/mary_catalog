"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { createColor } from "../actions"
import HexColorInput from "@/components/HexColorInput"

export default function NuevoColorPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link
        href="/admin/colores"
        className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900 active:scale-[0.97]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a Colores
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Nuevo Color</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          startTransition(async () => {
            await createColor(formData)
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
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            placeholder="Ej: Negro, Azul Marino..."
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Color HEX</label>
          <div className="flex items-center gap-3">
            <input
              name="codigo_hex"
              type="color"
              defaultValue="#808080"
              className="h-10 w-14 cursor-pointer rounded-lg border border-gray-300 p-0.5"
            />
            <HexColorInput defaultValue="#808080" />
          </div>
          <p className="mt-1 text-[10px] text-gray-400">Selecciona o escribe el código HEX del color</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md active:scale-[0.97] disabled:opacity-50"
          >
            {isPending ? "Creando..." : "Crear Color"}
          </button>
          <Link
            href="/admin/colores"
            className="rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-200 active:scale-[0.97]"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
