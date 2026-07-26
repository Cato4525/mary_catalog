import Link from "next/link"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import EditColorForm from "../EditColorForm"

export default async function EditarColorPage({ params }: { params: { id: string } }) {
  const { data: color } = await supabase
    .from("colors")
    .select("*")
    .eq("id", Number(params.id))
    .single()

  if (!color) notFound()

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link
        href="/admin/colores"
        className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900 active:scale-[0.97]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a Colores
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Editar Color</h1>
      <EditColorForm color={color} />
    </div>
  )
}
