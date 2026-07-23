export { ACCEPTED, MAX_SIZE, MAX_DIM } from "./image-constants"
import { MAX_SIZE, MAX_DIM } from "./image-constants"

export function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    if (file.size < 1024 * 1024 && file.type !== "image/png") {
      resolve(file)
      return
    }
    const img = document.createElement("img")
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width <= MAX_DIM && height <= MAX_DIM && file.size < MAX_SIZE) {
        resolve(file)
        return
      }
      if (width > MAX_DIM) {
        height = Math.round((height * MAX_DIM) / width)
        width = MAX_DIM
      }
      if (height > MAX_DIM) {
        width = Math.round((width * MAX_DIM) / height)
        height = MAX_DIM
      }
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return }
          const ext = file.name.split(".").pop() || "jpg"
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, `.${ext}`), { type: blob.type }))
        },
        file.type === "image/png" ? "image/png" : "image/webp",
        0.85
      )
    }
    img.onerror = () => reject(new Error("Error al procesar imagen"))
    img.src = url
  })
}
