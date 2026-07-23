import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { toggleColor, deleteColor } from "./actions"
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton"

export const dynamic = "force-dynamic"

export default async function AdminColoresPage() {
  const { data: colors } = await supabase
    .from("colors")
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
        <h1 className="text-2xl font-bold text-gray-900">Administrar Colores</h1>
        <Link
          href="/admin/colores/nueva"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md active:scale-[0.97]"
        >
          + Nuevo Color
        </Link>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Color</th>
              <th className="px-4 py-3 font-medium">Hex</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Creado</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(colors || []).length > 0 ? (
              (colors || []).map((color) => (
                <tr key={color.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-8 w-8 shrink-0 rounded-full border-2 border-gray-300 shadow-inner"
                        style={{ backgroundColor: color.codigo_hex }}
                      />
                      <span className="font-medium text-gray-900">{color.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{color.codigo_hex}</td>
                  <td className="px-4 py-3">
                    <form action={toggleColor}>
                      <input type="hidden" name="id" value={color.id} />
                      <input type="hidden" name="activo" value={String(color.activo)} />
                      <button
                        type="submit"
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          color.activo
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {color.activo ? "Activo" : "Inactivo"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(color.created_at).toLocaleDateString("es")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/colores/${color.id}`}
                        className="rounded-lg bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-200 active:scale-[0.97]"
                      >
                        Editar
                      </Link>
                      <form action={async (formData) => {
                        "use server"
                        await deleteColor(formData)
                      }}>
                        <input type="hidden" name="id" value={color.id} />
                        <ConfirmDeleteButton
                          message="¿Eliminar este color?"
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
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  No hay colores
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden">
        {(colors || []).length > 0 ? (
          (colors || []).map((color) => (
            <div key={color.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="h-8 w-8 rounded-full border-2 border-gray-300 shadow-inner"
                    style={{ backgroundColor: color.codigo_hex }}
                  />
                  <div>
                    <span className="font-medium text-gray-900">{color.nombre}</span>
                    <span className="ml-2 font-mono text-xs text-gray-400">{color.codigo_hex}</span>
                  </div>
                </div>
                <form action={toggleColor}>
                  <input type="hidden" name="id" value={color.id} />
                  <input type="hidden" name="activo" value={String(color.activo)} />
                  <button
                    type="submit"
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      color.activo
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {color.activo ? "Activo" : "Inactivo"}
                  </button>
                </form>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/colores/${color.id}`}
                  className="flex-1 rounded-lg bg-gray-100 py-2.5 text-center text-sm font-medium text-gray-600 transition-all hover:bg-gray-200 active:scale-[0.97]"
                >
                  Editar
                </Link>
                <form action={async (formData) => {
                  "use server"
                  await deleteColor(formData)
                }} className="flex-1">
                  <input type="hidden" name="id" value={color.id} />
                  <ConfirmDeleteButton
                    message="¿Eliminar este color?"
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
            No hay colores
          </div>
        )}
      </div>
    </div>
  )
}
