"use client"

import type { Category, Product } from "@/lib/types"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Props {
  product?: Product
  categories: Category[]
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

export default function ProductForm({ product, categories }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const existingUrls = (product?.images?.map((img) => img.url)) || []
  const [images, setImages] = useState<ImageItem[]>(
    existingUrls.map((url) => ({ id: url, url, existing: true }))
  )

  const handleSelectFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setImages((prev) => [...prev, ...newItems])
    setError("")
    e.target.value = ""
  }

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item && !item.existing) {
        URL.revokeObjectURL(item.url)
      }
      return prev.filter((i) => i.id !== id)
    })
  }

  const moveImage = (id: string, direction: -1 | 1) => {
    setImages((prev) => {
      const idx = prev.findIndex((i) => i.id === id)
      if (idx === -1) return prev
      const newIdx = idx + direction
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const copy = [...prev]
      const [moved] = copy.splice(idx, 1)
      copy.splice(newIdx, 0, moved)
      return copy
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    const form = e.currentTarget
    const fd = new FormData()
    fd.set("codigo", (form.codigo as HTMLInputElement).value)
    fd.set("nombre", (form.nombre as HTMLInputElement).value)
    fd.set("color", (form.color as HTMLInputElement).value)
    fd.set("descripcion", (form.descripcion as HTMLTextAreaElement).value)
    const catId = (form.categoria_id as HTMLSelectElement).value
    if (catId) fd.set("categoria_id", catId)

    if (product) {
      const keep = images.filter((i) => i.existing).map((i) => i.url)
      fd.set("keepImages", JSON.stringify(keep))
      for (const item of images) {
        if (!item.existing && item.file) {
          fd.append("newImages", item.file)
        }
      }
    } else {
      for (const item of images) {
        if (item.file) {
          fd.append("images", item.file)
        }
      }
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

  const hasImages = images.length > 0

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
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
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Color
          </label>
          <input
            name="color"
            type="text"
            defaultValue={product?.color || ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
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

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Imágenes {!product && <span className="text-gray-400">* (opcional)</span>}
        </label>

        {hasImages && (
          <div className="mb-3 flex flex-wrap gap-3">
            {images.map((item, i) => (
              <div key={item.id} className="group relative">
                <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-gray-200">
                  <Image
                    src={item.url}
                    alt={`Imagen ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                    unoptimized
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center gap-0.5 rounded-lg bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(item.id, -1)}
                      className="rounded bg-white/90 p-1 text-gray-700 hover:bg-white"
                      title="Mover izquierda"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  {i < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(item.id, 1)}
                      className="rounded bg-white/90 p-1 text-gray-700 hover:bg-white"
                      title="Mover derecha"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(item.id)}
                    className="rounded bg-red-500/90 p-1 text-white hover:bg-red-600"
                    title="Eliminar"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {i === 0 && (
                  <span className="absolute -right-2 -top-2 rounded-full bg-primary-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                    1°
                  </span>
                )}
                {item.existing && (
                  <span className="absolute -left-2 -top-2 rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                    OK
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <label className="relative inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 transition-colors hover:border-primary-400 hover:text-primary-600">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept={ACCEPTED.join(",")}
            onChange={handleSelectFiles}
            className="sr-only"
          />
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {hasImages ? "Agregar más imágenes" : "Seleccionar imágenes"}
        </label>
        <p className="mt-1 text-xs text-gray-400">
          JPG, PNG, WebP o AVIF · Máx 5 MB cada una · Se optimizarán automáticamente · La primera imagen es la principal
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? "Guardando..." : product ? "Guardar Cambios" : "Crear Producto"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/productos")}
          className="rounded-lg bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
