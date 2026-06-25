"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toggleDisponible } from "@/app/admin/productos/actions"

export default function ToggleDisponibleButton({
  productId,
  disponible,
}: {
  productId: number
  disponible: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    const formData = new FormData()
    formData.set("id", String(productId))
    formData.set("disponible", String(!disponible))
    try {
      await toggleDisponible(formData)
      router.refresh()
    } catch {
      alert("Error al cambiar disponibilidad")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all active:scale-[0.97] disabled:opacity-50 ${
        disponible
          ? "bg-green-50 text-green-700 hover:bg-green-100"
          : "bg-red-50 text-red-600 hover:bg-red-100"
      }`}
    >
      {loading ? (
        <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {disponible ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          )}
        </svg>
      )}
      {disponible ? "Activo" : "Inactivo"}
    </button>
  )
}
