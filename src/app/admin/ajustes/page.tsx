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
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Ajustes de la Tienda</h1>
      <SettingsForm settings={data as StoreSettings | null} />
    </div>
  )
}
