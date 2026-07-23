import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { toggleSize, deleteSize } from "./actions"
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton"

export const dynamic = "force-dynamic"

export default async function AdminTallasPage() {
  const { data: sizes } = await supabase
    .from("sizes")
    .select("*")
    .order("nombre")

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
        <h1 className="text-2xl font-bold text-gray-900">Administrar Tallas</h1>
        <Link
          href="/admin/tallas/nueva"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md active:scale-[0.97]"
        >
          + Nueva Talla
        </Link>
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Creado</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(sizes || []).length > 0 ? (
              (sizes || []).map((size) => (
                <tr key={size.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{size.nombre}</td>
                  <td className="px-4 py-3">
                    <form action={toggleSize}>
                      <input type="hidden" name="id" value={size.id} />
                      <input type="hidden" name="activo" value={String(size.activo)} />
                      <button
                        type="submit"
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          size.activo
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {size.activo ? "Activa" : "Inactiva"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(size.created_at).toLocaleDateString("es")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/tallas/${size.id}`}
                        className="rounded-lg bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-200 active:scale-[0.97]"
                      >
                        Editar
                      </Link>
                      <form action={async (formData) => {
                        "use server"
                        await deleteSize(formData)
                      }}>
                        <input type="hidden" name="id" value={size.id} />
                        <ConfirmDeleteButton
                          message="¿Eliminar esta talla?"
                          className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-100 active:scale-[0.97]"
                        >
                          Eliminar
                        </ConfirmDeleteButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                  No hay tallas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 sm:hidden">
        {(sizes || []).length > 0 ? (
          (sizes || []).map((size) => (
            <div key={size.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-medium text-gray-900">{size.nombre}</span>
                <form action={toggleSize}>
                  <input type="hidden" name="id" value={size.id} />
                  <input type="hidden" name="activo" value={String(size.activo)} />
                  <button
                    type="submit"
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      size.activo
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {size.activo ? "Activa" : "Inactiva"}
                  </button>
                </form>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/tallas/${size.id}`}
                  className="flex-1 rounded-lg bg-gray-100 py-2.5 text-center text-sm font-medium text-gray-600 transition-all hover:bg-gray-200 active:scale-[0.97]"
                >
                  Editar
                </Link>
                <form action={async (formData) => {
                  "use server"
                  await deleteSize(formData)
                }} className="flex-1">
                  <input type="hidden" name="id" value={size.id} />
                  <ConfirmDeleteButton
                    message="¿Eliminar esta talla?"
                    className="w-full rounded-lg bg-red-50 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-100 active:scale-[0.97]"
                  >
                    Eliminar
                  </ConfirmDeleteButton>
                </form>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-400">
            No hay tallas
          </div>
        )}
      </div>
    </div>
  )
}
