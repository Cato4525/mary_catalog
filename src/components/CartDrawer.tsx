"use client"

import { useCart } from "@/context/CartContext"
import { useSettings } from "@/hooks/useSettings"
import Image from "next/image"

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' fill='%23f3f4f6'%3E%3Crect width='400' height='400'/%3E%3C/svg%3E"

interface Props {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, removeItem, updateCantidad, clearCart, totalItems } = useCart()
  const settings = useSettings()
  const whatsapp = settings?.whatsapp || ""

  const whatsappMessage = (() => {
    if (items.length === 0) return ""
    const parts = items.map(
      (item, idx) =>
        `*Producto ${idx + 1}*\nCódigo: ${item.codigo}\nNombre: ${item.nombre}\nColor: ${item.color}\nCategoría: ${item.categoria}\nCantidad: ${item.cantidad}\nImagen: ${item.imagen_url}`
    )
    const total = items.reduce((s, i) => s + i.cantidad, 0)
    return encodeURIComponent(
      `🛍️ *Nuevo Pedido - Mary Leggings*\n\n${parts.join("\n\n")}\n\nTotal: ${total} producto(s)`
    )
  })()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Carrito ({totalItems})
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Cerrar carrito"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-gray-400">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <p className="text-sm font-medium">Tu carrito está vacío</p>
            <p className="text-xs">Agrega productos desde el catálogo</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={item.imagen_url || PLACEHOLDER}
                        alt={item.nombre}
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized={!!item.imagen_url}
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-primary-500">
                          {item.codigo}
                        </p>
                        <p className="truncate text-sm font-medium text-gray-900">
                          {item.nombre}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.color} · {item.categoria}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateCantidad(item.id, item.cantidad - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 text-sm text-gray-600 transition-colors hover:bg-gray-100 active:scale-95"
                            aria-label="Reducir cantidad"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="flex h-7 w-8 items-center justify-center text-sm font-medium text-gray-900">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => updateCantidad(item.id, item.cantidad + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 text-sm text-gray-600 transition-colors hover:bg-gray-100 active:scale-95"
                            aria-label="Aumentar cantidad"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="rounded-md p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          aria-label="Eliminar producto"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 px-4 py-4">
              {whatsapp ? (
                <a
                  href={`https://wa.me/${whatsapp}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-[0.97]"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Enviar pedido por WhatsApp
                </a>
              ) : (
                <p className="text-center text-sm text-gray-400">
                  Configura un número de WhatsApp en Ajustes
                </p>
              )}
              <button
                onClick={clearCart}
                className="mt-2 w-full rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-100 active:scale-[0.97]"
              >
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
