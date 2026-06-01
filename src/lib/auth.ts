import { cookies } from "next/headers"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@maryleggings.com"

export function getSession() {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get("admin_session")
  if (!sessionCookie) return null

  try {
    const data = JSON.parse(atob(sessionCookie.value))
    if (data.email === ADMIN_EMAIL) {
      return data
    }
  } catch {
    return null
  }
  return null
}
