import { NextResponse } from "next/server"
import { uploadMultipleToStorage, validateFiles } from "@/lib/upload"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No se recibieron archivos" }, { status: 400 })
    }

    validateFiles(files)

    const urls = await uploadMultipleToStorage(files)

    return NextResponse.json({ urls })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al subir imágenes"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
