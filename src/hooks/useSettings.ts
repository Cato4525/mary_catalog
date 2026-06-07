"use client"

import { useEffect, useState } from "react"
import type { StoreSettings } from "@/lib/types"

export function useSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null)

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {})
  }, [])

  return settings
}
