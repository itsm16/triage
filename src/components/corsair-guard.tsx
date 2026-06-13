"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export function CorsairGuard({
  children,
  corsairSetupComplete,
}: {
  children: React.ReactNode
  corsairSetupComplete: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!corsairSetupComplete && pathname !== "/dashboard") {
      router.replace("/dashboard")
    }
  }, [corsairSetupComplete, pathname, router])

  return <>{children}</>
}
