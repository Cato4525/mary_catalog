"use client"

import type { Color } from "@/lib/types"
import { useState } from "react"

interface Props {
  colors: Color[]
  selectedColorId: number | null
  onSelect: (colorId: number | null) => void
  allowCreate?: boolean
  onCreateColor?: (nombre: string, codigo_hex: string) => void
}

export default function ColorPicker({
  colors,
  selectedColorId,
  onSelect,
  allowCreate = false,
  onCreateColor,
}: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newHex, setNewHex] = useState("#808080")

  const handleCreate = () => {
    if (!newName.trim()) return
    onCreateColor?.(newName.trim(), newHex)
    setNewName("")
    setNewHex("#808080")
    setShowCreate(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {colors.filter((c) => c.activo).map((color) => (
          <button
            key={color.id}
            type="button"
            onClick={() => onSelect(color.id)}
            className={`group flex items-center gap-2 rounded-full border-2 px-3 py-2 text-sm font-medium transition-all ${
              selectedColorId === color.id
                ? "border-primary-600 bg-primary-50 text-primary-700 shadow-sm"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <span
              className="h-5 w-5 rounded-full border border-gray-300 shadow-inner"
              style={{ backgroundColor: color.codigo_hex }}
            />
            <span>{color.nombre}</span>
          </button>
        ))}
      </div>

      {allowCreate && (
        <>
          {!showCreate ? (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear nuevo color
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <input
                type="color"
                value={newHex}
                onChange={(e) => setNewHex(e.target.value)}
                className="h-9 w-9 cursor-pointer rounded border-0 p-0"
              />
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre del color"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                Crear
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setNewName(""); setNewHex("#808080") }}
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200"
              >
                Cancelar
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
