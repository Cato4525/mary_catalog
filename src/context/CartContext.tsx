"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export interface CartItem {
  id: number
  codigo: string
  nombre: string
  color: string
  categoria: string
  imagen_url: string
  cantidad: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "cantidad">) => void
  removeItem: (id: number) => void
  updateCantidad: (id: number, cantidad: number) => void
  clearCart: () => void
  totalItems: number
}

const CartContext = createContext<CartContextType | null>(null)

const STORAGE_KEY = "mary-cart"

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    setItems(loadCart())
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items])

  const addItem = useCallback((item: Omit<CartItem, "cantidad">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      }
      return [...prev, { ...item, cantidad: 1 }]
    })
  }, [])

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateCantidad = useCallback((id: number, cantidad: number) => {
    if (cantidad < 1) return
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, cantidad } : i)))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateCantidad, clearCart, totalItems }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
