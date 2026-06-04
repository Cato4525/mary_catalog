"use client"

import type { StoreSettings } from "@/lib/types"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Props {
  settings: StoreSettings | null
}

export default function SettingsForm({ settings }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState(settings?.logo_url || "")
  const [removeLogo, setRemoveLogo] = useState(false)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
      setRemoveLogo(false)
    }
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview("")
    setRemoveLogo(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess(false)

    const form = e.currentTarget
    const data: Record<string, string> = {
      store_name: (form.store_name as HTMLInputElement).value,
      store_description: (form.store_description as HTMLTextAreaElement).value,
      contact_email: (form.contact_email as HTMLInputElement).value,
      contact_phone: (form.contact_phone as HTMLInputElement).value,
      address: (form.address as HTMLTextAreaElement).value,
      logo_url: removeLogo ? "" : settings?.logo_url || "",
    }

    try {
      if (logoFile) {
        const formData = new FormData()
        formData.append("files", logoFile)
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        if (!uploadRes.ok) throw new Error("Error al subir logo")
        const { urls } = await uploadRes.json()
        data.logo_url = urls[0]
      }

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error("Error al guardar")

      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Nombre de la tienda</label>
        <input
          name="store_name"
          type="text"
          required
          defaultValue={settings?.store_name || ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          name="store_description"
          rows={3}
          defaultValue={settings?.store_description || ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Logo</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          className="w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
        />
        {logoPreview && (
          <div className="mt-3 flex items-start gap-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200">
              <Image
                src={logoPreview}
                alt="Logo preview"
                fill
                className="object-contain"
                sizes="80px"
                unoptimized
              />
            </div>
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="mt-1 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              Eliminar logo
            </button>
          </div>
        )}
      </div>

      <hr className="border-gray-200" />

      <h2 className="text-lg font-semibold text-gray-900">Información de contacto</h2>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
        <input
          name="contact_email"
          type="email"
          defaultValue={settings?.contact_email || ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
        <input
          name="contact_phone"
          type="text"
          defaultValue={settings?.contact_phone || ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Dirección</label>
        <textarea
          name="address"
          rows={2}
          defaultValue={settings?.address || ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">Ajustes guardados correctamente</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar Cambios"}
      </button>
    </form>
  )
}
