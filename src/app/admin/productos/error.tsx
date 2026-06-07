"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h2 className="mb-2 text-xl font-bold text-gray-900">Error al cargar productos</h2>
      <p className="mb-6 text-sm text-gray-500">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md active:scale-[0.97]"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
