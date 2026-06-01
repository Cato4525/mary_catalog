import { supabaseAdmin } from "./supabase"

const BUCKET = "product-images"
const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]

export class UploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "UploadError"
  }
}

export function validateFiles(files: File[]): void {
  for (const f of files) {
    if (!ALLOWED_TYPES.includes(f.type)) {
      throw new UploadError(`Formato no soportado: ${f.type}. Usa JPG, PNG, WebP o AVIF.`)
    }
    if (f.size > MAX_SIZE) {
      throw new UploadError(`Archivo muy pesado: ${f.name} (máx 5 MB).`)
    }
  }
}

function generateStoragePath(ext: string): string {
  const timestamp = Date.now()
  const unique = crypto.randomUUID().slice(0, 8)
  return `${timestamp}-${unique}.${ext}`
}

function extractExtension(file: File): string {
  const nameParts = file.name.split(".")
  const ext = nameParts.length > 1 ? nameParts.pop()!.toLowerCase() : "jpg"
  const mimeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  }
  return mimeMap[file.type] || ext
}

export async function uploadToStorage(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const ext = extractExtension(file)
  const path = generateStoragePath(ext)

  const buffer = await file.arrayBuffer()

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
      cacheControl: "3600",
    })

  if (error) {
    throw new UploadError(`Error al subir ${file.name}: ${error.message}`)
  }

  onProgress?.(100)

  const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path)
  return urlData.publicUrl
}

export async function uploadMultipleToStorage(
  files: File[],
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  validateFiles(files)

  const results: string[] = []
  const total = files.length

  for (let i = 0; i < total; i++) {
    const url = await uploadToStorage(files[i])
    results.push(url)
    onProgress?.(i + 1, total)
  }

  return results
}

export function getStoragePathFromUrl(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl)
    const pathParts = url.pathname.split("/")
    const bucketIndex = pathParts.findIndex((p) => p === BUCKET)
    if (bucketIndex === -1 || bucketIndex + 1 >= pathParts.length) return null
    return pathParts.slice(bucketIndex + 1).join("/")
  } catch {
    return null
  }
}

export async function deleteFromStorage(urls: string[]): Promise<void> {
  const paths = urls
    .map((u) => getStoragePathFromUrl(u))
    .filter((p): p is string => p !== null)

  if (paths.length === 0) return

  const { error } = await supabaseAdmin.storage.from(BUCKET).remove(paths)
  if (error) {
    console.error("Error deleting files from storage:", error.message)
  }
}
