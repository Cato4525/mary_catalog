import Link from "next/link"
import { supabase } from "@/lib/supabase"
import type { StoreSettings } from "@/lib/types"
import SettingsForm from "./SettingsForm"

export default async function AjustesPage() {
  const { data } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900 active:scale-[0.97]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver al Panel
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Ajustes de la Tienda</h1>
      <SettingsForm settings={data as StoreSettings | null} />
    </div>
  )
}
