import Link from "next/link"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { updateTipo } from "../actions"

export default async function EditarTipoPage({ params }: { params: { id: string } }) {
  const { data: type } = await supabase
    .from("product_types")
    .select("*")
    .eq("id", Number(params.id))
    .single()

  if (!type) notFound()

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link
        href="/admin/tipos"
        className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900 active:scale-[0.97]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a Tipos
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Editar Tipo</h1>
      <form
        action={updateTipo}
        className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="id" value={type.id} />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nombre *</label>
          <input
            name="nombre"
            type="text"
            required
            defaultValue={type.nombre}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md active:scale-[0.97]"
          >
            Guardar Cambios
          </button>
          <Link
            href="/admin/tipos"
            className="rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-200 active:scale-[0.97]"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
