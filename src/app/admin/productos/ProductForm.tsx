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

  const isEdit = !!product

  const [variants, setVariants] = useState<VariantWithImages[]>(productVariants)
  const [colors, setColors] = useState<Color[]>(allColors)
  const [sizes, setSizes] = useState<Size[]>(allSizes)
  const [uploading, setUploading] = useState<Record<number, boolean>>({})

  const [showNewColor, setShowNewColor] = useState(false)
  const [newColorName, setNewColorName] = useState("")
  const [newColorHex, setNewColorHex] = useState("#808080")
  const [creatingColor, setCreatingColor] = useState(false)

  const [showNewSize, setShowNewSize] = useState(false)
  const [newSizeName, setNewSizeName] = useState("")
  const [creatingSize, setCreatingSize] = useState(false)

  const usedColorIds = new Set(
    isEdit ? variants.map((v) => v.color_id) : colorSelections.map((cs) => cs.colorId)
  )
  const availableColors = colors.filter((c) => c.activo && !usedColorIds.has(c.id))

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

  const handleCreateColor = async () => {
    if (!newColorName.trim()) return
    setCreatingColor(true)
    setError("")

    try {
      const res = await fetch("/api/colores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: newColorName.trim(), codigo_hex: newColorHex }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Error al crear color")
      }

      const newColor = await res.json()
      setColors((prev) => [...prev, newColor])
      setNewColorName("")
      setNewColorHex("#808080")
      setShowNewColor(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear color")
    } finally {
      setCreatingColor(false)
    }
  }

  const handleCreateSize = async () => {
    if (!newSizeName.trim()) return
    setCreatingSize(true)
    setError("")

    try {
      const res = await fetch("/api/tallas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: newSizeName.trim() }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Error al crear talla")
      }

      const newSize = await res.json()
      setSizes((prev) => [...prev, newSize])
      setSelectedSizes((prev) => [...prev, newSize.id])
      setNewSizeName("")
      setShowNewSize(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear talla")
    } finally {
      setCreatingSize(false)
    }
  }

  const handleDeleteSize = async (sizeId: number) => {
    if (!confirm("¿Eliminar esta talla?")) return

    try {
      await fetch(`/api/tallas?id=${sizeId}`, { method: "DELETE" })
      setSizes((prev) => prev.filter((s) => s.id !== sizeId))
      setSelectedSizes((prev) => prev.filter((id) => id !== sizeId))
    } catch {
      setError("Error al eliminar talla")
    }
  }

  const handleToggleSizeActive = async (sizeId: number, current: boolean) => {
    try {
      await fetch("/api/tallas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sizeId, activo: !current }),
      })
      setSizes((prev) =>
        prev.map((s) => (s.id === sizeId ? { ...s, activo: !s.activo } : s))
      )
    } catch {
      setError("Error al actualizar talla")
    }
  }

  const handleAddEditVariant = async (colorId: number) => {
    if (!product) return
    setError("")

    try {
      const res = await fetch("/api/variantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, color_id: colorId }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Error al agregar variante")
      }

      const newVariant = await res.json()
      const color = colors.find((c) => c.id === colorId) || null

      setVariants((prev) => [
        ...prev,
        { ...newVariant, color, images: [] },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error")
    }
  }

  const handleDeleteEditVariant = async (variantId: number) => {
    if (!confirm("¿Eliminar este color y todas sus imágenes?")) return

    try {
      await fetch(`/api/variantes/${variantId}`, { method: "DELETE" })
      setVariants((prev) => prev.filter((v) => v.id !== variantId))
    } catch {
      setError("Error al eliminar")
    }
  }

  const handleToggleEditVariant = async (variantId: number, current: boolean) => {
    try {
      await fetch(`/api/variantes/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disponible: !current }),
      })
      setVariants((prev) =>
        prev.map((v) => (v.id === variantId ? { ...v, disponible: !v.disponible } : v))
      )
    } catch {
      setError("Error al actualizar")
    }
  }

  const handleUploadEditImages = async (variantId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading((prev) => ({ ...prev, [variantId]: true }))
    setError("")

    try {
      const fd = new FormData()
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
        fd.append("files", compressed)
      }

      const res = await fetch(`/api/variantes/${variantId}/images`, {
        method: "POST",
        body: fd,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Error al subir imágenes")
      }

      const { urls } = await res.json()

      const newImages = urls.map((url: string, i: number) => ({
        id: Date.now() + i,
        variant_id: variantId,
        url,
        sort_order: (variants.find((v) => v.id === variantId)?.images.length || 0) + i,
        created_at: new Date().toISOString(),
      }))

      setVariants((prev) =>
        prev.map((v) =>
          v.id === variantId ? { ...v, images: [...v.images, ...newImages] } : v
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir")
    } finally {
      setUploading((prev) => ({ ...prev, [variantId]: false }))
      e.target.value = ""
    }
  }

  const handleDeleteEditImage = async (variantId: number, imageId: number) => {
    if (!confirm("¿Eliminar esta imagen?")) return

    try {
      await fetch(`/api/variantes/${variantId}/images?imageId=${imageId}`, {
        method: "DELETE",
      })
      setVariants((prev) =>
        prev.map((v) =>
          v.id === variantId
            ? { ...v, images: v.images.filter((img) => img.id !== imageId) }
            : v
        )
      )
    } catch {
      setError("Error al eliminar imagen")
    }
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

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-blue-800">
            Colores e Imágenes ({isEdit ? variants.length : colorSelections.length})
          </p>
          <button
            type="button"
            onClick={() => setShowNewColor(!showNewColor)}
            className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 transition-all hover:bg-blue-200"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo color
          </button>
        </div>

        {showNewColor && (
          <div className="mb-3 flex flex-wrap items-end gap-2 rounded-lg border border-blue-200 bg-white p-3">
            <div>
              <label className="mb-1 block text-[10px] font-medium text-gray-500">Nombre</label>
              <input
                type="text"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-primary-400 focus:outline-none"
                placeholder="Ej: Turquesa"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium text-gray-500">Color</label>
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="h-8 w-10 cursor-pointer rounded-lg border border-gray-300"
              />
            </div>
            <button
              type="button"
              onClick={handleCreateColor}
              disabled={!newColorName.trim() || creatingColor}
              className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {creatingColor ? "Creando..." : "Crear"}
            </button>
            <button
              type="button"
              onClick={() => { setShowNewColor(false); setNewColorName(""); setNewColorHex("#808080") }}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200"
            >
              Cancelar
            </button>
          </div>
        )}

        {availableColors.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {availableColors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => isEdit ? handleAddEditVariant(color.id) : addColorSelection(color.id)}
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

        {!isEdit && colorSelections.length === 0 && (
          <p className="text-xs text-gray-400">No has seleccionado ningún color aún</p>
        )}
        {isEdit && variants.length === 0 && (
          <p className="text-xs text-gray-400">No hay colores asignados aún</p>
        )}

        {!isEdit ? (
          <div className="space-y-4">
            {colorSelections.map((cs) => {
              const color = colors.find((c) => c.id === cs.colorId)
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
        ) : (
          <div className="space-y-4">
            {variants.map((variant, vi) => (
              <div
                key={variant.id}
                className={`rounded-lg border bg-white p-3 transition-all ${
                  variant.disponible ? "border-gray-200" : "border-gray-200 opacity-60"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-6 w-6 rounded-full border border-gray-300 shadow-inner"
                      style={{ backgroundColor: variant.color?.codigo_hex }}
                    />
                    <span className="text-sm font-medium text-gray-900">{variant.color?.nombre}</span>
                    <span className="text-xs text-gray-400">
                      {variant.images.length} imagen{variant.images.length !== 1 ? "es" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleEditVariant(variant.id, variant.disponible)}
                      className={`rounded-lg px-2 py-1 text-xs font-medium transition-all ${
                        variant.disponible
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {variant.disponible ? "Activo" : "Inactivo"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEditVariant(variant.id)}
                      className="rounded-lg bg-red-50 p-1.5 text-red-500 transition-all hover:bg-red-100"
                      title="Eliminar color"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {variant.images.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {variant.images.map((img, ii) => (
                      <div key={img.id} className="group relative">
                        <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
                          <Image
                            src={img.url}
                            alt={`${variant.color?.nombre || ""} - ${ii + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                            unoptimized
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteEditImage(variant.id, img.id)}
                          className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        {ii === 0 && (
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
                    ref={(el) => { fileInputRefs.current[variant.id] = el }}
                    type="file"
                    multiple
                    accept={ACCEPTED.join(",")}
                    onChange={(e) => handleUploadEditImages(variant.id, e)}
                    className="sr-only"
                  />
                  {uploading[variant.id] ? (
                    <span className="text-primary-600">Subiendo...</span>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Agregar fotos
                    </>
                  )}
                </label>
                <p className="mt-1 text-[10px] text-gray-400">JPG, PNG, WebP · Máx 5 MB</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Tallas disponibles</label>
          <button
            type="button"
            onClick={() => setShowNewSize(!showNewSize)}
            className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 transition-all hover:bg-gray-200"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva talla
          </button>
        </div>

        {showNewSize && (
          <div className="mb-3 flex items-end gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div>
              <label className="mb-1 block text-[10px] font-medium text-gray-500">Nombre</label>
              <input
                type="text"
                value={newSizeName}
                onChange={(e) => setNewSizeName(e.target.value)}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-primary-400 focus:outline-none"
                placeholder="Ej: XXL"
              />
            </div>
            <button
              type="button"
              onClick={handleCreateSize}
              disabled={!newSizeName.trim() || creatingSize}
              className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {creatingSize ? "Creando..." : "Crear"}
            </button>
            <button
              type="button"
              onClick={() => { setShowNewSize(false); setNewSizeName("") }}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200"
            >
              Cancelar
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <div key={size.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => toggleSize(size.id)}
                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                  selectedSizes.includes(size.id)
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : size.activo
                      ? "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      : "border-gray-200 bg-gray-50 text-gray-400 line-through"
                }`}
              >
                {size.nombre}
              </button>
              <button
                type="button"
                onClick={() => handleToggleSizeActive(size.id, size.activo)}
                className={`rounded-md p-1 text-xs transition-all ${
                  size.activo
                    ? "text-green-600 hover:bg-green-50"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
                title={size.activo ? "Desactivar" : "Activar"}
              >
                {size.activo ? "●" : "○"}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSize(size.id)}
                className="rounded-md p-1 text-xs text-red-400 transition-all hover:bg-red-50 hover:text-red-600"
                title="Eliminar"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <p className="mt-1 text-[10px] text-gray-400">
          Selecciona las tallas que ofrece este producto
        </p>
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
