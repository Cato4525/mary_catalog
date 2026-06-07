import { cookies } from "next/headers"
import AdminNav from "@/components/AdminNav"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")

  return (
    <div className="pb-16 md:pl-64 md:pb-0">
      <AdminNav hasSession={!!session} />
      <main>{children}</main>
    </div>
  )
}
