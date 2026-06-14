import { Mail, Calendar, HashIcon } from "lucide-react"
import Link from "next/link"
import { api } from "~/trpc/server";
import { getSession } from "~/server/better-auth/server";
import { EventsSection } from "~/components/dashboard/events-section";

export default async function DashboardPage(props: {
  searchParams: Promise<{ connected?: string; error?: string }>
}) {
  const searchParams = await props.searchParams;
  const session = await getSession();

  const connectedPlugins = await api.corsair.getConnectedPlugins();
  const connectedNames = new Set(connectedPlugins);

  if (connectedNames.size === 0) {
    return <ConnectPrompt searchParams={searchParams} />;
  }

  const important = await api.corsair.listImportantMessages();

  return <DashboardShell searchParams={searchParams} important={important} userName={session?.user?.name ?? null} />;
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
  searchParams,
  important,
  userName,
}: {
  searchParams: { connected?: string; error?: string };
  important: { id?: string; subject: string; from: string; snippet?: string }[];
  userName: string | null;
}) {
  return (
    <>
      <header className="flex h-8 shrink-0" />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1400px] space-y-8 p-6 md:p-10">
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

          <div>
            <h1 className="text-2xl font-semibold text-[#e3e2e7]">
              Hey, {userName ?? "there"}
            </h1>
            <p className="mt-1 text-sm text-[#8d90a2]">Here's your overview</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">

            <section className="rounded-xl border border-[#434656]/10 bg-[#1a1b1f] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HashIcon className="size-4 text-[#b6c4ff]" />
                  <h2 className="text-lg font-semibold text-[#e3e2e7]">Important & Unread</h2>
                </div>
                <Link href="/email" className="text-sm text-[#b6c4ff] hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {important.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#8d90a2]">No important unread emails</p>
                ) : (
                  important.map((msg) => (
                    <Link
                      key={msg.id}
                      href="/email"
                      className="flex items-start gap-3 rounded-lg border border-[#434656]/10 bg-[#121317] px-4 py-3 transition-colors hover:border-[#b6c4ff]/20"
                    >
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#b6c4ff]/10">
                        <HashIcon className="size-3.5 fill-[#b6c4ff] text-[#b6c4ff]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#e3e2e7]">{msg.from}</p>
                        <p className="truncate text-sm font-semibold text-[#c3c5d9]">{msg.subject}</p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-[#8d90a2]">{msg.snippet}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            <EventsSection />

            <section className="rounded-xl border border-dashed border-[#434656]/20 bg-[#1a1b1f]/50 p-6">
              <p className="py-16 text-center text-sm text-[#8d90a2]">Coming soon</p>
            </section>

          </div>
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
