"use client"

import { deleteProduct } from "@/app/admin/productos/actions"

export default function DeleteProductButton({ productId }: { productId: number }) {
  const handleDelete = async () => {
    if (!confirm("¿Eliminar este producto?")) return
    const formData = new FormData()
    formData.set("id", String(productId))
    await deleteProduct(formData)
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
    >
      Eliminar
    </button>
  )
}
