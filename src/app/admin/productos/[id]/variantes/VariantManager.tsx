"use client"

import type { Color, ProductImage } from "@/lib/types"
import { compressImage, ACCEPTED, MAX_SIZE } from "@/lib/image-utils"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface VariantWithImages {
  id: number
  product_id: number
  color_id: number
  disponible: boolean
  orden: number
  created_at: string
  color: Color | null
  images: ProductImage[]
}

interface Props {
  productId: number
  initialVariants: VariantWithImages[]
  allColors: Color[]
}



export default function VariantManager({ productId, initialVariants, allColors }: Props) {
  const router = useRouter()
  const [variants, setVariants] = useState<VariantWithImages[]>(initialVariants)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [uploading, setUploading] = useState<Record<number, boolean>>({})
  const [error, setError] = useState("")
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({})

  const usedColorIds = new Set(variants.map((v) => v.color_id))
  const availableColors = allColors.filter((c) => !usedColorIds.has(c.id))

  const handleAddVariant = async () => {
    if (!selectedColorId) return
    setAdding(true)
    setError("")

    try {
      const res = await fetch("/api/variantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, color_id: selectedColorId }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Error al agregar variante")
      }

      const newVariant = await res.json()
      const color = allColors.find((c) => c.id === selectedColorId) || null

      setVariants((prev) => [
        ...prev,
        { ...newVariant, color, images: [] },
      ])
      setSelectedColorId(null)
      setShowAddForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error")
    } finally {
      setAdding(false)
    }
  }

  const handleToggleDisponible = async (variantId: number, current: boolean) => {
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

  const handleDeleteVariant = async (variantId: number) => {
    if (!confirm("¿Eliminar este color y todas sus imágenes?")) return

    try {
      await fetch(`/api/variantes/${variantId}`, { method: "DELETE" })
      setVariants((prev) => prev.filter((v) => v.id !== variantId))
    } catch {
      setError("Error al eliminar")
    }
  }

  const handleUploadImages = async (variantId: number, e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleDeleteImage = async (variantId: number, imageId: number) => {
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

  const handleMoveImage = async (variantId: number, imageId: string, direction: -1 | 1) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) return v
        const idx = v.images.findIndex((img) => String(img.id) === imageId)
        if (idx === -1) return v
        const newIdx = idx + direction
        if (newIdx < 0 || newIdx >= v.images.length) return v
        const copy = [...v.images]
        const [moved] = copy.splice(idx, 1)
        copy.splice(newIdx, 0, moved)
        const reordered = copy.map((img, i) => ({ ...img, sort_order: i }))
        return { ...v, images: reordered }
      })
    )
  }

  const handleMoveVariant = async (variantId: number, direction: -1 | 1) => {
    const idx = variants.findIndex((v) => v.id === variantId)
    if (idx === -1) return
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= variants.length) return

    const copy = [...variants]
    const [moved] = copy.splice(idx, 1)
    copy.splice(newIdx, 0, moved)

    const reordered = copy.map((v, i) => ({ ...v, orden: i }))
    setVariants(reordered)

    try {
      await fetch("/api/variantes/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_ids: reordered.map((v) => v.id) }),
      })
    } catch {
      setError("Error al reordenar")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Colores ({variants.length})
        </h2>
        {availableColors.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary-300 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 transition-all hover:bg-primary-100 active:scale-[0.97]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Color
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 shadow-sm">
          <p className="mb-3 text-sm font-medium text-gray-700">Seleccionar color:</p>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => setSelectedColorId(color.id)}
                className={`flex items-center gap-2 rounded-full border-2 px-3 py-2 text-sm font-medium transition-all ${
                  selectedColorId === color.id
                    ? "border-primary-600 bg-primary-100 text-primary-700 shadow-sm"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span
                  className="h-5 w-5 rounded-full border border-gray-300 shadow-inner"
                  style={{ backgroundColor: color.codigo_hex }}
                />
                {color.nombre}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleAddVariant}
              disabled={!selectedColorId || adding}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {adding ? "Agregando..." : "Agregar"}
            </button>
            <button
              type="button"
              onClick={() => { setShowAddForm(false); setSelectedColorId(null) }}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {variants.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-400">
          <svg className="mx-auto mb-3 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <p className="text-lg font-medium">No hay colores</p>
          <p className="text-sm">Agrega un color para comenzar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {variants.map((variant, vi) => (
            <div
              key={variant.id}
              className={`rounded-xl border bg-white p-4 shadow-sm transition-all ${
                variant.disponible ? "border-gray-200" : "border-gray-200 opacity-60"
              }`}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleMoveVariant(variant.id, -1)}
                      disabled={vi === 0}
                      className="rounded p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Mover arriba"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveVariant(variant.id, 1)}
                      disabled={vi === variants.length - 1}
                      className="rounded p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Mover abajo"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {variant.color && (
                    <span
                      className="h-8 w-8 rounded-full border-2 border-gray-300 shadow-inner"
                      style={{ backgroundColor: variant.color.codigo_hex }}
                    />
                  )}
                  <div>
                    <span className="font-medium text-gray-900">
                      {variant.color?.nombre || "Sin color"}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      {variant.images.length} imagen{variant.images.length !== 1 ? "es" : ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleDisponible(variant.id, variant.disponible)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      variant.disponible
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {variant.disponible ? "Activo" : "Inactivo"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteVariant(variant.id)}
                    className="rounded-lg bg-red-50 p-1.5 text-red-500 transition-all hover:bg-red-100"
                    title="Eliminar"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                {variant.images.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-3">
                    {variant.images.map((img, ii) => (
                      <div key={img.id} className="group relative">
                        <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-gray-200 bg-white">
                          <Image
                            src={img.url}
                            alt={`${variant.color?.nombre || ""} - ${ii + 1}`}
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
                              onClick={() => handleMoveImage(variant.id, String(img.id), -1)}
                              className="rounded bg-white/90 p-1 text-gray-700 shadow-sm hover:bg-white"
                              title="Mover izquierda"
                            >
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                          )}
                          {ii < variant.images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(variant.id, String(img.id), 1)}
                              className="rounded bg-white/90 p-1 text-gray-700 shadow-sm hover:bg-white"
                              title="Mover derecha"
                            >
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(variant.id, img.id)}
                            className="rounded bg-red-500/90 p-1 text-white shadow-sm hover:bg-red-600"
                            title="Eliminar"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        {ii === 0 && (
                          <span className="absolute right-0 top-0 rounded-bl-lg bg-primary-600 px-1 py-0.5 text-[9px] font-bold text-white">
                            1°
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
                    onChange={(e) => handleUploadImages(variant.id, e)}
                    className="sr-only"
                  />
                  {uploading[variant.id] ? (
                    <span className="text-primary-600">Subiendo...</span>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Agregar imágenes
                    </>
                  )}
                </label>
                <p className="mt-1 text-[10px] text-gray-400">
                  JPG, PNG, WebP o AVIF · Máx 5 MB · La primera imagen es la principal
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
