"use client"

import { useRouter } from "next/navigation"
import { useRef, useState, useTransition, type FormEvent, type ReactNode } from "react"

interface Props {
  action: (formData: FormData) => Promise<{ error?: string } | void>
  redirectTo: string
  children: ReactNode | ((ctx: { isPending: boolean }) => ReactNode)
  className?: string
}

export default function ServerActionForm({ action, redirectTo, children, className }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(formRef.current!)
    startTransition(async () => {
      await action(formData)
      router.push(redirectTo)
      router.refresh()
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={className}>
      {typeof children === "function" ? children({ isPending }) : children}
    </form>
  )
}
