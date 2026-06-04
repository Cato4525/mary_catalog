"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteProduct } from "@/app/admin/productos/actions"

export default function DeleteProductButton({ productId }: { productId: number }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este producto?")) return
    setDeleting(true)
    const formData = new FormData()
    formData.set("id", String(productId))
    try {
      await deleteProduct(formData)
      router.refresh()
    } catch {
      alert("Error al eliminar el producto")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      type="button"
      disabled={deleting}
      onClick={handleDelete}
      className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {deleting ? "Eliminando..." : "Eliminar"}
    </button>
  )
}
