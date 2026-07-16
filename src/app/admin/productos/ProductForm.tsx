"use client"

import type { Category, ProductType, Color, Product, ProductVariant, ProductImage } from "@/lib/types"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import ColorPicker from "@/components/ColorPicker"

interface Props {
  product?: Product & {
    variants?: (ProductVariant & { images?: ProductImage[] })[]
  }
  categories: Category[]
  productTypes: ProductType[]
  colors: Color[]
}

const MAX_DIM = 1920
const MAX_SIZE = 5 * 1024 * 1024
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"]

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
          if (!blob) {
            resolve(file)
            return
          }
          const ext = file.name.split(".").pop() || "jpg"
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, `.${ext}`), {
            type: blob.type,
          }))
        },
        file.type === "image/png" ? "image/png" : "image/webp",
        0.85
      )
    }
    img.onerror = () => reject(new Error("Error al procesar imagen"))
    img.src = url
  })
}

interface ImageItem {
  id: string
  url: string
  file?: File
  existing?: boolean
}

interface VariantItem {
  id: string
  variantId?: number
  colorId: number | null
  images: ImageItem[]
  deleted?: boolean
}

let variantCounter = 0

export default function ProductForm({ product, categories, productTypes, colors }: Props) {
  const router = useRouter()
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [allColors, setAllColors] = useState<Color[]>(colors)

  const [variants, setVariants] = useState<VariantItem[]>(() => {
    if (product?.variants && product.variants.length > 0) {
      return product.variants.map((v) => ({
        id: `existing-${v.id}`,
        variantId: v.id,
        colorId: v.color_id,
        images: (v.images || [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((img) => ({
            id: img.url,
            url: img.url,
            existing: true,
          })),
      }))
    }
    return [{ id: `new-${++variantCounter}`, colorId: null, images: [] }]
  })

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { id: `new-${++variantCounter}`, colorId: null, images: [] },
    ])
  }

  const removeVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id))
  }

  const updateVariantColor = (id: string, colorId: number | null) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, colorId } : v))
    )
  }

  const handleCreateColor = (nombre: string, codigo_hex: string) => {
    const newColor: Color = {
      id: Date.now(),
      nombre,
      codigo_hex,
      activo: true,
      created_at: new Date().toISOString(),
    }
    setAllColors((prev) => [...prev, newColor])
  }

  const handleSelectFiles = async (variantId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newItems: ImageItem[] = []
    for (const file of Array.from(files)) {
      if (!ACCEPTED.includes(file.type)) {
        setError(`Formato no soportado: ${file.type}`)
        continue
      }
      if (file.size > MAX_SIZE) {
        setError(`Archivo muy pesado: ${file.name} (máx 5 MB)`)
        continue
      }
      const compressed = await compressImage(file)
      newItems.push({
        id: URL.createObjectURL(compressed),
        url: URL.createObjectURL(compressed),
        file: compressed,
      })
    }

    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId ? { ...v, images: [...v.images, ...newItems] } : v
      )
    )
    setError("")
    e.target.value = ""
  }

  const removeImage = (variantId: string, imageId: string) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) return v
        const item = v.images.find((i) => i.id === imageId)
        if (item && !item.existing) {
          URL.revokeObjectURL(item.url)
        }
        return { ...v, images: v.images.filter((i) => i.id !== imageId) }
      })
    )
  }

  const moveImage = (variantId: string, imageId: string, direction: -1 | 1) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) return v
        const idx = v.images.findIndex((i) => i.id === imageId)
        if (idx === -1) return v
        const newIdx = idx + direction
        if (newIdx < 0 || newIdx >= v.images.length) return v
        const copy = [...v.images]
        const [moved] = copy.splice(idx, 1)
        copy.splice(newIdx, 0, moved)
        return { ...v, images: copy }
      })
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
    fd.set("descripcion", (form.descripcion as HTMLTextAreaElement).value)
    const catId = (form.categoria_id as HTMLSelectElement).value
    if (catId) fd.set("categoria_id", catId)
    const typeId = (form.tipo_id as HTMLSelectElement).value
    if (typeId) fd.set("tipo_id", typeId)
    fd.set("disponible", (form.disponible as HTMLSelectElement).value)

    const activeVariants = variants.filter((v) => !v.deleted && v.colorId)

    if (activeVariants.length === 0) {
      setError("Debe agregar al menos un color")
      setSaving(false)
      return
    }

    if (product) {
      const deletedIds = variants
        .filter((v) => v.variantId && (v.deleted || !v.colorId))
        .map((v) => v.variantId!)
      fd.set("deleted_variant_ids", JSON.stringify(deletedIds))

      const variantsPayload = activeVariants.map((v) => ({
        id: v.variantId,
        color_id: v.colorId,
        keepImages: v.images.filter((i) => i.existing).map((i) => i.url),
        sortOrder: v.images.map((i) => (i.existing ? i.url : "new")),
      }))
      fd.set("variants_data", JSON.stringify(variantsPayload))

      activeVariants.forEach((v, i) => {
        const newFiles = v.images
          .filter((img) => !img.existing && img.file)
          .map((img) => img.file!)
        if (newFiles.length > 0) {
          for (const file of newFiles) {
            fd.append(`variant_images_${i}`, file)
          }
        }
      })
    } else {
      const variantsPayload = activeVariants.map((v) => ({ color_id: v.colorId }))
      fd.set("variants_data", JSON.stringify(variantsPayload))

      activeVariants.forEach((v, i) => {
        const files = v.images.filter((img) => img.file).map((img) => img.file!)
        for (const file of files) {
          fd.append(`variant_images_${i}`, file)
        }
      })
    }

    try {
      const method = product ? "PATCH" : "POST"
      const url = product ? `/api/productos/${product.id}` : "/api/productos"
      const res = await fetch(url, { method, body: fd })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.error || "Error al guardar")
      }

      router.replace("/admin/productos")
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
            Nombre *
          </label>
          <input
            name="nombre"
            type="text"
            required
            defaultValue={product?.nombre || ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            placeholder="Ej: Legging Deportivo"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Código
          </label>
          <input
            name="codigo"
            type="text"
            defaultValue={product?.codigo || ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            placeholder="Ej: ML-001"
          />
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

        {product && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              name="disponible"
              defaultValue={product.disponible ? "true" : "false"}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option value="true">Disponible</option>
              <option value="false">No disponible</option>
            </select>
          </div>
        )}
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

      <div className="border-t border-gray-200 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Colores</h3>
            <p className="text-xs text-gray-500">
              Cada color puede tener hasta 10 imágenes
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary-300 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 transition-all hover:bg-primary-100 active:scale-[0.97]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Color
          </button>
        </div>

        <div className="space-y-4">
          {variants.map((variant, vi) => (
            <div
              key={variant.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Color {vi + 1}
                  </label>
                  <ColorPicker
                    colors={allColors}
                    selectedColorId={variant.colorId}
                    onSelect={(colorId) => updateVariantColor(variant.id, colorId)}
                    allowCreate
                    onCreateColor={handleCreateColor}
                  />
                </div>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(variant.id)}
                    className="mt-5 rounded-lg bg-red-50 p-2 text-red-600 transition-all hover:bg-red-100 active:scale-[0.9]"
                    title="Eliminar color"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-gray-600">
                  Imágenes del color
                </label>

                {variant.images.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-3">
                    {variant.images.map((item, ii) => (
                      <div key={item.id} className="group relative">
                        <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-gray-200 bg-white">
                          <Image
                            src={item.url}
                            alt={`Color ${vi + 1} - ${ii + 1}`}
                            fill
                            className="object-cover"
                            sizes="96px"
                            unoptimized
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-lg bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          {ii > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(variant.id, item.id, -1)}
                              className="rounded bg-white/90 p-1.5 text-gray-700 shadow-sm transition-all hover:bg-white active:scale-[0.9]"
                              title="Mover izquierda"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                          )}
                          {ii < variant.images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImage(variant.id, item.id, 1)}
                              className="rounded bg-white/90 p-1.5 text-gray-700 shadow-sm transition-all hover:bg-white active:scale-[0.9]"
                              title="Mover derecha"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(variant.id, item.id)}
                            className="rounded bg-red-500/90 p-1.5 text-white shadow-sm transition-all hover:bg-red-600 active:scale-[0.9]"
                            title="Eliminar"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        {ii === 0 && (
                          <span className="absolute right-0 top-0 rounded-bl-lg bg-primary-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                            1°
                          </span>
                        )}
                        {item.existing && (
                          <span className="absolute left-0 top-0 rounded-br-lg bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                            OK
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <label className="relative inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-2.5 text-xs text-gray-500 shadow-sm transition-all hover:border-primary-400 hover:text-primary-600 active:scale-[0.98]">
                  <input
                    ref={(el) => { fileRefs.current[variant.id] = el }}
                    type="file"
                    multiple
                    accept={ACCEPTED.join(",")}
                    onChange={(e) => handleSelectFiles(variant.id, e)}
                    className="sr-only"
                  />
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {variant.images.length > 0 ? "Agregar más" : "Seleccionar imágenes"}
                  {variant.images.length > 0 && (
                    <span className="text-gray-400">({variant.images.length}/10)</span>
                  )}
                </label>
                <p className="mt-1 text-[10px] text-gray-400">
                  JPG, PNG, WebP o AVIF · Máx 5 MB · La primera imagen es la principal
                </p>
              </div>
            </div>
          ))}
        </div>
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
