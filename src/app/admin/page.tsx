import Link from "next/link"
import { supabase } from "@/lib/supabase"

const MODULES = [
  {
    href: "/admin/productos",
    title: "Productos",
    desc: "Gestionar catálogo de productos",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: "/admin/categorias",
    title: "Categorías",
    desc: "Administrar categorías de productos",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    href: "/admin/ajustes",
    title: "Ajustes",
    desc: "Configuración general de la tienda",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

function BarChart({ data, label }: { data: { label: string; value: number }[]; label: string }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const w = 36
  const gap = 8
  const chartW = data.length * (w + gap) - gap
  const chartH = 160
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="mb-4 text-sm font-medium text-gray-500">{label}</p>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ maxHeight: chartH }}>
        {data.map((d, i) => {
          const barH = max > 0 ? (d.value / max) * (chartH - 24) : 0
          const x = i * (w + gap)
          const y = chartH - 4 - barH
          return (
            <g key={d.label}>
              <rect x={x} y={y} width={w} height={barH} rx={4} className="fill-primary-500 transition-all hover:fill-primary-600" />
              <text x={x + w / 2} y={chartH - 4} textAnchor="middle" className="fill-gray-400 text-[10px]">{d.label}</text>
              {d.value > 0 && (
                <text x={x + w / 2} y={y - 6} textAnchor="middle" className="fill-gray-600 text-[11px] font-medium">{d.value}</text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default async function AdminDashboardPage() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfWeek = new Date(now.getTime() - now.getDay() * 86400000).toISOString()

  const [totalRes, monthRes, weekRes, allProducts] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth),
    supabase.from("products").select("*", { count: "exact", head: true }).gte("created_at", startOfWeek),
    supabase.from("products").select("created_at"),
  ])

  const stats = [
    { label: "Total productos", value: totalRes.count ?? 0, color: "text-primary-600" },
    { label: "Este mes", value: monthRes.count ?? 0, color: "text-green-600" },
    { label: "Esta semana", value: weekRes.count ?? 0, color: "text-amber-600" },
  ]

  const products = (allProducts.data ?? []).map((p) => p.created_at ? new Date(p.created_at) : null).filter(Boolean) as Date[]

  const monthLabels: { label: string; value: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = m.toLocaleDateString("es", { month: "short" })
    const count = products.filter((d) => d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear()).length
    monthLabels.push({ label, value: count })
  }

  const weekLabels: { label: string; value: number }[] = []
  for (let i = 3; i >= 0; i--) {
    const start = new Date(now.getTime() - (now.getDay() + i * 7) * 86400000)
    const end = new Date(start.getTime() + 7 * 86400000)
    const count = products.filter((d) => d >= start && d < end).length
    const label = `S${String(now.getDay() === 0 && i === 0 ? now.getDay() + 1 : now.getDay() === 0 ? i + 1 : i + 1)}`
    weekLabels.push({ label, value: count })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Panel de Administración</h1>
      <p className="mb-8 text-gray-500">Resumen del catálogo</p>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-10 grid gap-6 sm:grid-cols-2">
        <BarChart data={monthLabels} label="Productos registrados por mes" />
        <BarChart data={weekLabels} label="Productos registrados por semana" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group flex items-center gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-primary-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
              {mod.icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700">
                {mod.title}
              </h2>
              <p className="text-sm text-gray-500">{mod.desc}</p>
            </div>
            <svg className="ml-auto h-5 w-5 text-gray-300 transition-colors group-hover:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}
