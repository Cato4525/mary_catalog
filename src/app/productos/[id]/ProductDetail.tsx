"use client"

import { useState } from "react"
import ProductGallery from "./ProductGallery"
import ProductWhatsAppButton from "@/components/ProductWhatsAppButton"
import AddToCartButton from "@/components/AddToCartButton"

const SIZES = ["S", "M", "L", "XL"]

interface Variant {
  id: number
  color_id: number
  colors: { nombre: string; hex: string } | null
  disponible: boolean
  images: { url: string; orden: number }[]
}

interface Props {
  product: any
  variants: Variant[]
  whatsapp?: string
}

export default function ProductDetail({
  product,
  variants,
  whatsapp,
}: Props) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const selectedVariant = variants[selectedVariantIndex] || variants[0]
  const images = (selectedVariant?.images || [])
    .sort((a: any, b: any) => a.orden - b.orden)
    .map((img: any) => img.url)
  const colorName = selectedVariant?.colors?.nombre || ""
  const colorHex = selectedVariant?.colors?.hex || null

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <ProductGallery images={images} productName={product.nombre} />

      <div className="space-y-4">
        <div>
          <div className="flex items-start gap-3">
            {product.codigo && (
              <span className="shrink-0 rounded-lg bg-gray-100 px-2 py-1 font-mono text-xs font-medium text-gray-500">
                {product.codigo}
              </span>
            )}
            <h1 className="break-words text-3xl font-bold text-gray-900">
              {product.nombre}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          {product.categories && (
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
              {product.categories.nombre}
            </span>
          )}
          {product.product_types?.nombre && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {product.product_types.nombre}
            </span>
          )}
        </div>

        {variants.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Color: <span className="font-normal text-gray-500">{colorName}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {variants.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantIndex(i)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                    i === selectedVariantIndex
                      ? "border-primary-600 bg-primary-50 text-primary-700 shadow-sm"
                      : "border-gray-300 bg-white text-gray-700 hover:border-primary-400 hover:bg-primary-50"
                  }`}
                >
                  {v.colors?.hex && (
                    <span
                      className="h-4 w-4 rounded-full border border-gray-300 shadow-inner"
                      style={{ backgroundColor: v.colors.hex }}
                    />
                  )}
                  {v.colors?.nombre}
                  {v.images.length > 0 && (
                    <span className="ml-0.5 text-xs opacity-60">
                      ({v.images.length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {images.length > 1 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{images.length} imágenes</span>
          </div>
        )}

        {product.descripcion && (
          <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
            {product.descripcion}
          </p>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Tallas disponibles
          </label>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            {SIZES.map((size) => (
              <span
                key={size}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium"
              >
                {size}
              </span>
            ))}
          </div>
        </div>

        {selectedVariant && (
          <AddToCartButton
            product={{
              id: product.id,
              variant_id: selectedVariant.id,
              nombre: product.nombre,
              color: colorName,
              categoria: product.categories?.nombre || "",
              imagen_url: images[0] || "",
            }}
          />
        )}

        {whatsapp && selectedVariant && images.length > 0 && (
          <ProductWhatsAppButton
            whatsapp={whatsapp}
            nombre={product.nombre}
            color={colorName}
            imagenUrl={images[0]}
          />
        )}
      </div>
    </div>
  )
}
