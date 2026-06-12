import { eq } from "drizzle-orm";
import { Mail, Calendar, CheckCircle2 } from "lucide-react"
import { db } from "~/server/db";
import { corsairAccounts, corsairIntegrations } from "~/server/db/schema";
import { getSession } from "~/server/better-auth/server";

export default async function DashboardPage(props: {
  searchParams: Promise<{ connected?: string; error?: string }>
}) {
  const searchParams = await props.searchParams;
  const session = await getSession();
  const userId = session?.user?.id;

  const connectedPlugins = userId
    ? await db
        .select({ name: corsairIntegrations.name })
        .from(corsairAccounts)
        .innerJoin(
          corsairIntegrations,
          eq(corsairAccounts.integrationId, corsairIntegrations.id),
        )
        .where(eq(corsairAccounts.tenantId, userId))
    : [];

  const connectedNames = new Set(connectedPlugins.map((p) => p.name));

  if (connectedNames.size === 0) {
    return <ConnectPrompt searchParams={searchParams} />;
  }

  return <DashboardShell connectedNames={connectedNames} searchParams={searchParams} />;
}

async function ConnectPrompt({
  searchParams,
}: {
  searchParams: { connected?: string; error?: string };
}) {
  return (
    <div className="flex flex-1 items-center justify-center bg-[#121317]">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="rounded-2xl border border-[#434656]/20 bg-[#1a1b1f] p-6">
            <Mail className="size-16 text-[#b6c4ff]" />
          </div>
        </div>

        <h1 className="mb-3 text-[28px] font-semibold leading-9 tracking-tight text-[#e3e2e7]">
          Grant Access
        </h1>
        <p className="mb-8 text-[#c3c5d9]">
          Triage needs access to your Gmail and Calendar to analyze your
          communications and optimize your workflow.
        </p>

        <a
          href="/api/connect-all"
          className="mx-auto flex w-fit items-center gap-3 rounded-xl border border-[#434656]/10 bg-[#1e1f23] px-6 py-4 transition-colors hover:border-[#b6c4ff]/30"
        >
          <div className="flex -space-x-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#292a2e] ring-2 ring-[#1a1b1f]">
              <Mail className="size-5 text-[#b6c4ff]" />
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#292a2e] ring-2 ring-[#1a1b1f]">
              <Calendar className="size-5 text-[#b6c4ff]" />
            </div>
          </div>
          <div className="text-left">
            <p className="text-sm text-[#c3c5d9]">
              Grant access to Gmail and Calendar
            </p>
          </div>
          <ChevronRightIcon />
        </a>

        <p className="text-xs text-[#8d90a2] mt-3">
          Your data is encrypted end-to-end. You can revoke access at any time.
        </p>

        {searchParams?.error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-4">
            <p className="text-sm font-medium text-red-400">
              Connection failed: {searchParams.error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

async function DashboardShell({
  connectedNames,
  searchParams,
}: {
  connectedNames: Set<string>;
  searchParams: { connected?: string; error?: string };
}) {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#434656]/10 bg-[#121317]/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {connectedNames.has("gmail") && (
            <span className="flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 font-mono text-[11px] text-green-400">
              <CheckCircle2 size={12} />
              Gmail
            </span>
          )}
          {connectedNames.has("googlecalendar") && (
            <span className="flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 font-mono text-[11px] text-green-400">
              <CheckCircle2 size={12} />
              Calendar
            </span>
          )}
          {!connectedNames.has("gmail") && (
            <a
          href="/api/connect-all"
              className="flex items-center gap-1.5 rounded-full border border-[#434656]/20 px-3 py-1 font-mono text-[11px] text-[#c3c5d9] transition-colors hover:border-[#b6c4ff]/30 hover:text-[#b6c4ff]"
            >
              + Gmail
            </a>
          )}
          {!connectedNames.has("googlecalendar") && (
            <a
              href="/api/connect?plugin=googlecalendar"
              className="flex items-center gap-1.5 rounded-full border border-[#434656]/20 px-3 py-1 font-mono text-[11px] text-[#c3c5d9] transition-colors hover:border-[#b6c4ff]/30 hover:text-[#b6c4ff]"
            >
              + Calendar
            </a>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1200px] space-y-10 p-6 md:p-10">
          {searchParams?.connected && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-6 py-4">
              <p className="text-sm font-medium text-green-400">
                Successfully connected <strong>{searchParams.connected}</strong>!
              </p>
            </div>
          )}
          {searchParams?.error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-4">
              <p className="text-sm font-medium text-red-400">
                Connection failed: {searchParams.error}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="size-5 text-[#8d90a2] transition-colors group-hover:text-[#b6c4ff]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
