export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 h-8 w-48 animate-pulse rounded bg-gray-200" />
      <div className="space-y-3">
        <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
      </div>
    </div>
  )
}
