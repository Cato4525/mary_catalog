"use client"

import { useState, useCallback } from "react"
import Image from "next/image"

interface Props {
  images: string[]
  productName: string
}

function downloadImage(url: string, filename: string) {
  fetch(url)
    .then((res) => res.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    })
    .catch(() => {})
}

function getFilename(url: string, index: number): string {
  try {
    const pathname = new URL(url).pathname
    const parts = pathname.split("/")
    return parts[parts.length - 1] || `imagen-${index + 1}.jpg`
  } catch {
    return `imagen-${index + 1}.jpg`
  }
}

export default function ProductGallery({ images, productName }: Props) {
  const [selected, setSelected] = useState(0)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = useCallback(() => {
    if (downloading) return
    setDownloading(true)
    const url = images[selected]
    const filename = getFilename(url, selected)
    downloadImage(url, filename)
    setTimeout(() => setDownloading(false), 1000)
  }, [images, selected, downloading])

  if (images.length === 0) {
    return (
      <div className="aspect-[4/5] rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        Sin imagen disponible
      </div>
    )
  }

  const prev = () => setSelected((s) => (s === 0 ? images.length - 1 : s - 1))
  const next = () => setSelected((s) => (s === images.length - 1 ? 0 : s + 1))

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-100 group">
        <Image
          src={images[selected]}
          alt={`${productName} - Imagen ${selected + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized
        />

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="absolute right-3 top-3 rounded-full bg-white/80 p-2.5 text-gray-700 shadow transition-colors hover:bg-white disabled:opacity-50"
          aria-label="Descargar imagen"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow transition-opacity hover:bg-white md:opacity-0 md:group-hover:opacity-100"
              aria-label="Imagen anterior"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow transition-opacity hover:bg-white md:opacity-0 md:group-hover:opacity-100"
              aria-label="Imagen siguiente"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-sm">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`flex items-center justify-center rounded-full transition-all ${
                    i === selected ? "h-3 w-6 bg-white" : "h-3 w-3 bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Imagen ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === selected ? "border-primary-500 ring-2 ring-primary-100" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Image
                src={img}
                alt={`${productName} - miniatura ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
