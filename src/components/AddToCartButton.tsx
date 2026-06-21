"use client"

import { useCart } from "@/context/CartContext"
import type { CartItem } from "@/context/CartContext"

interface Props {
  product: Pick<CartItem, "id" | "codigo" | "nombre" | "color" | "categoria" | "imagen_url">
  variant?: "icon" | "full"
}

export default function AddToCartButton({ product, variant = "full" }: Props) {
  const { addItem } = useCart()

  const handleClick = () => {
    addItem(product)
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm transition-all hover:bg-primary-700 active:scale-90"
        aria-label={`Agregar ${product.nombre} al carrito`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md active:scale-[0.97]"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
      Agregar al carrito
    </button>
  )
}
