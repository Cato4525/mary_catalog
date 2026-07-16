"use client"

import type { Category, ProductType, Product } from "@/lib/types"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  product?: Product
  categories: Category[]
  productTypes: ProductType[]
}

function generateSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export default function ProductForm({ product, categories, productTypes }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [slug, setSlug] = useState(product?.slug || "")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    const form = e.currentTarget
    const fd = new FormData()
    fd.set("nombre", (form.nombre as HTMLInputElement).value)
    fd.set("codigo", (form.codigo as HTMLInputElement).value)
    fd.set("slug", slug)
    fd.set("descripcion", (form.descripcion as HTMLTextAreaElement).value)
    const catId = (form.categoria_id as HTMLSelectElement).value
    if (catId) fd.set("categoria_id", catId)
    const typeId = (form.tipo_id as HTMLSelectElement).value
    if (typeId) fd.set("tipo_id", typeId)
    fd.set("disponible", (form.disponible as HTMLSelectElement).value)
    fd.set("destacado", (form.destacado as HTMLSelectElement).value)

    try {
      const method = product ? "PATCH" : "POST"
      const url = product ? `/api/productos/${product.id}` : "/api/productos"
      const res = await fetch(url, { method, body: fd })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.error || "Error al guardar")
      }

      const data = await res.json()
      const productId = data.id || product?.id

      if (!product && productId) {
        router.replace(`/admin/productos/${productId}/variantes`)
      } else {
        router.replace("/admin/productos")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Código *
          </label>
          <input
            name="codigo"
            type="text"
            required
            defaultValue={product?.codigo || ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            placeholder="Ej: ML-001"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Nombre *
          </label>
          <input
            name="nombre"
            type="text"
            required
            defaultValue={product?.nombre || ""}
            onChange={(e) => {
              if (!product) setSlug(generateSlug(e.target.value))
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            placeholder="Ej: Legging Deportivo"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Slug (URL)
          </label>
          <input
            name="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            placeholder="legging-deportivo"
          />
          <p className="mt-1 text-[10px] text-gray-400">
            Se genera automáticamente desde el nombre
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Categoría
          </label>
          <select
            name="categoria_id"
            defaultValue={product?.categoria_id || ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          >
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Tipo
          </label>
          <select
            name="tipo_id"
            defaultValue={product?.tipo_id || ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          >
            <option value="">Sin tipo</option>
            {productTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Disponible
          </label>
          <select
            name="disponible"
            defaultValue={product?.disponible ? "true" : "false"}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          >
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Destacado
          </label>
          <select
            name="destacado"
            defaultValue={product?.destacado ? "true" : "false"}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          >
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          name="descripcion"
          rows={3}
          defaultValue={product?.descripcion || ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          placeholder="Detalles del producto, materiales, cuidados..."
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 pt-5">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Guardando..." : product ? "Guardar Cambios" : "Crear Producto"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/productos")}
          className="rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-200 active:scale-[0.97]"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
