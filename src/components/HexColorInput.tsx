"use client"

interface Props {
  name?: string
  defaultValue?: string
}

export default function HexColorInput({ name = "codigo_hex_text", defaultValue = "#808080" }: Props) {
  return (
    <input
      name={name}
      type="text"
      defaultValue={defaultValue}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
      placeholder="#000000"
      onChange={(e) => {
        const form = e.target.closest("form")!
        const colorInput = form.elements.namedItem("codigo_hex") as HTMLInputElement
        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
          colorInput.value = e.target.value
        }
      }}
    />
  )
}
