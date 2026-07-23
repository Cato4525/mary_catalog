"use client"

import type { Category, ProductType, Product, Color, Size, ProductVariant, ProductImage } from "@/lib/types"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface VariantWithImages extends ProductVariant {
  color?: Color | null
  images?: ProductImage[]
}

interface Props {
  product?: Product
  categories: Category[]
  productTypes: ProductType[]
  allColors: Color[]
  allSizes: Size[]
  productSizes?: number[]
  productVariants?: VariantWithImages[]
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"]
const MAX_SIZE = 5 * 1024 * 1024
const MAX_DIM = 1920

function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    if (file.size < 1024 * 1024 && file.type !== "image/png") {
      resolve(file)
      return
    }
    const img = document.createElement("img")
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width <= MAX_DIM && height <= MAX_DIM && file.size < MAX_SIZE) {
        resolve(file)
        return
      }
      if (width > MAX_DIM) {
        height = Math.round((height * MAX_DIM) / width)
        width = MAX_DIM
      }
      if (height > MAX_DIM) {
        width = Math.round((width * MAX_DIM) / height)
        height = MAX_DIM
      }
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return }
          const ext = file.name.split(".").pop() || "jpg"
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, `.${ext}`), { type: blob.type }))
        },
        file.type === "image/png" ? "image/png" : "image/webp",
        0.85
      )
    }
    img.onerror = () => reject(new Error("Error al procesar imagen"))
    img.src = url
  })
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

interface ColorSelection {
  colorId: number
  files: File[]
  previews: string[]
}

export default function ProductForm({ product, categories, productTypes, allColors, allSizes, productSizes = [], productVariants = [] }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [slug, setSlug] = useState(product?.slug || "")
  const [selectedSizes, setSelectedSizes] = useState<number[]>(productSizes)
  const [colorSelections, setColorSelections] = useState<ColorSelection[]>([])
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  const usedColorIds = new Set(
    product ? productVariants.map((v) => v.color_id) : colorSelections.map((cs) => cs.colorId)
  )
  const availableColors = allColors.filter((c) => c.activo && !usedColorIds.has(c.id))

  const addColorSelection = (colorId: number) => {
    setColorSelections((prev) => [...prev, { colorId, files: [], previews: [] }])
  }

  const removeColorSelection = (colorId: number) => {
    setColorSelections((prev) => {
      const cs = prev.find((c) => c.colorId === colorId)
      if (cs) {
        cs.previews.forEach((p) => URL.revokeObjectURL(p))
      }
      return prev.filter((c) => c.colorId !== colorId)
    })
  }

  const handleColorFiles = async (colorId: number, fileList: FileList | null) => {
    if (!fileList) return
    const newFiles: File[] = []
    const newPreviews: string[] = []

    for (const file of Array.from(fileList)) {
      if (!ACCEPTED.includes(file.type)) {
        setError(`Formato no soportado: ${file.type}`)
        continue
      }
      if (file.size > MAX_SIZE) {
        setError(`Archivo muy pesado: ${file.name} (máx 5 MB)`)
        continue
      }
      const compressed = await compressImage(file)
      newFiles.push(compressed)
      newPreviews.push(URL.createObjectURL(compressed))
    }

    setColorSelections((prev) =>
      prev.map((cs) =>
        cs.colorId === colorId
          ? { ...cs, files: [...cs.files, ...newFiles], previews: [...cs.previews, ...newPreviews] }
          : cs
      )
    )
  }

  const removeColorFile = (colorId: number, fileIndex: number) => {
    setColorSelections((prev) =>
      prev.map((cs) => {
        if (cs.colorId !== colorId) return cs
        URL.revokeObjectURL(cs.previews[fileIndex])
        return {
          ...cs,
          files: cs.files.filter((_, i) => i !== fileIndex),
          previews: cs.previews.filter((_, i) => i !== fileIndex),
        }
      })
    )
  }

  const toggleSize = (sizeId: number) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeId) ? prev.filter((id) => id !== sizeId) : [...prev, sizeId]
    )
  }

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

    if (selectedSizes.length > 0) {
      fd.set("size_ids", JSON.stringify(selectedSizes))
    }

    if (!product && colorSelections.length > 0) {
      const colorEntries = colorSelections.map((cs) => {
        cs.files.forEach((file, idx) => {
          fd.set(`color_file_${cs.colorId}_${idx}`, file)
        })
        return { color_id: cs.colorId, files_index: cs.files.map((_, i) => i) }
      })
      fd.set("colors", JSON.stringify(colorEntries))
    }

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
          <label className="mb-1 block text-sm font-medium text-gray-700">Código *</label>
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
          <label className="mb-1 block text-sm font-medium text-gray-700">Nombre *</label>
          <input
            name="nombre"
            type="text"
            required
            defaultValue={product?.nombre || ""}
            onChange={(e) => { if (!product) setSlug(generateSlug(e.target.value)) }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            placeholder="Ej: Legging Deportivo"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Slug (URL)</label>
          <input
            name="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            placeholder="legging-deportivo"
          />
          <p className="mt-1 text-[10px] text-gray-400">Se genera automáticamente desde el nombre</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Categoría</label>
          <select
            name="categoria_id"
            defaultValue={product?.categoria_id || ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          >
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tipo</label>
          <select
            name="tipo_id"
            defaultValue={product?.tipo_id || ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          >
            <option value="">Sin tipo</option>
            {productTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Disponible</label>
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
          <label className="mb-1 block text-sm font-medium text-gray-700">Destacado</label>
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
        <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          name="descripcion"
          rows={3}
          defaultValue={product?.descripcion || ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          placeholder="Detalles del producto, materiales, cuidados..."
        />
      </div>

      {!product && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="mb-2 text-sm font-medium text-blue-800">Colores e Imágenes</p>
          <p className="mb-3 text-xs text-blue-600">
            Selecciona los colores disponibles y sube las fotos para cada uno.
          </p>
          {availableColors.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {availableColors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => addColorSelection(color.id)}
                  className="flex items-center gap-2 rounded-full border-2 border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:border-primary-400 hover:bg-primary-50 active:scale-[0.97]"
                >
                  <span
                    className="h-5 w-5 rounded-full border border-gray-300 shadow-inner"
                    style={{ backgroundColor: color.codigo_hex }}
                  />
                  + {color.nombre}
                </button>
              ))}
            </div>
          )}

          {colorSelections.length === 0 && (
            <p className="text-xs text-gray-400">No has seleccionado ningún color aún</p>
          )}

          <div className="space-y-4">
            {colorSelections.map((cs) => {
              const color = allColors.find((c) => c.id === cs.colorId)
              return (
                <div key={cs.colorId} className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-6 w-6 rounded-full border border-gray-300 shadow-inner"
                        style={{ backgroundColor: color?.codigo_hex }}
                      />
                      <span className="text-sm font-medium text-gray-900">{color?.nombre}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeColorSelection(cs.colorId)}
                      className="rounded-lg p-1.5 text-red-500 transition-all hover:bg-red-50"
                      title="Quitar color"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {cs.previews.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {cs.previews.map((preview, idx) => (
                        <div key={idx} className="group relative">
                          <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
                            <Image src={preview} alt="" fill className="object-cover" sizes="80px" unoptimized />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeColorFile(cs.colorId, idx)}
                            className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          {idx === 0 && (
                            <span className="absolute right-0 bottom-0 rounded-tl-lg bg-primary-600 px-1 py-0.5 text-[9px] font-bold text-white">
                              1°
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="relative inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 shadow-sm transition-all hover:border-primary-400 hover:text-primary-600 active:scale-[0.98]">
                    <input
                      ref={(el) => { fileInputRefs.current[cs.colorId] = el }}
                      type="file"
                      multiple
                      accept={ACCEPTED.join(",")}
                      onChange={(e) => handleColorFiles(cs.colorId, e.target.files)}
                      className="sr-only"
                    />
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar fotos
                  </label>
                  <p className="mt-1 text-[10px] text-gray-400">JPG, PNG, WebP · Máx 5 MB</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {allSizes.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Tallas disponibles</label>
          <div className="flex flex-wrap gap-2">
            {allSizes.filter((s) => s.activo).map((size) => (
              <button
                key={size.id}
                type="button"
                onClick={() => toggleSize(size.id)}
                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                  selectedSizes.includes(size.id)
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {size.nombre}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[10px] text-gray-400">
            Selecciona las tallas que ofrece este producto
          </p>
        </div>
      )}

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
