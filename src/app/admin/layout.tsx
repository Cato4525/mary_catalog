import { cookies } from "next/headers"
import AdminNav from "@/components/AdminNav"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")

  return (
    <div className="pt-12 pb-16 lg:pt-0 lg:pl-64 lg:pb-0">
      <AdminNav hasSession={!!session} />
      <main>{children}</main>
    </div>
  )
}
