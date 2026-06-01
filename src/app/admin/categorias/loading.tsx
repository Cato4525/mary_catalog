export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-10 w-36 animate-pulse rounded-lg bg-gray-200" />
      </div>
      <div className="rounded-xl border border-gray-200">
        <div className="space-y-2 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-gray-50" />
          ))}
        </div>
      </div>
    </div>
  )
}
