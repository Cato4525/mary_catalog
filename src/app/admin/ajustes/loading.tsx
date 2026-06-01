export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 h-8 w-48 animate-pulse rounded bg-gray-200" />
      <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="mb-1 h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
