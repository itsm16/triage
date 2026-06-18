import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { eq, and, isNotNull } from "drizzle-orm"

import { db } from "~/server/db"
import { corsairAccounts } from "~/server/db/schema"
import { Sidebar } from "~/components/sidebar"
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar"
import { ComposePanel } from "~/components/compose-panel"
import { EmailPreviewPanel } from "~/components/email-preview-panel"
import { Loader } from "~/components/loader"
import { getSession } from "~/server/better-auth/server"
import { CorsairGuard } from "~/components/corsair-guard"
import { Toaster } from "~/components/ui/sonner"
import { WebhookToaster } from "~/components/webhook-toaster"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session?.user) {
    redirect("/sign-in")
  }

  const corsairSetup = await db
    .select({ id: corsairAccounts.id })
    .from(corsairAccounts)
    .where(
      and(
        eq(corsairAccounts.tenantId, session.user.id),
        isNotNull(corsairAccounts.integrationId),
      ),
    )
    .limit(1)

  const corsairSetupComplete = corsairSetup.length > 0

  const headersList = await headers()
  const pathname = headersList.get("x-invoke-path") ?? ""

  if (!corsairSetupComplete && pathname !== "" && pathname !== "/dashboard") {
    redirect("/dashboard")
  }

  return (
    <CorsairGuard corsairSetupComplete={corsairSetupComplete}>
      <SidebarProvider>
        <Sidebar session={session} />
        <SidebarInset className="overflow-hidden bg-[#121317]">
          <Loader />
          <Toaster position="top-right"/>
          <WebhookToaster/>
          {children}
        </SidebarInset>
      </SidebarProvider>
      <ComposePanel />
      <EmailPreviewPanel />
    </CorsairGuard>
  )
}
