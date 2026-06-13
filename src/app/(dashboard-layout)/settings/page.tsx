import { Mail, Calendar, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { api } from "~/trpc/server";

export default async function SettingsPage() {
  const connectedPlugins = await api.corsair.getConnectedPlugins();
  const connectedNames = new Set(connectedPlugins);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-4 border-b border-[#434656]/10 bg-[#121317]/80 px-4 backdrop-blur-md">
        <Link href="/dashboard" className="text-[#c3c5d9] transition-colors hover:text-[#b6c4ff]">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-lg font-semibold text-[#e3e2e7]">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl space-y-8 p-6 md:p-10">
          <section>
            <h2 className="mb-4 text-base font-semibold text-[#e3e2e7]">Connected Services</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-[#434656]/10 bg-[#1a1b1f] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[#292a2e]">
                    <Mail className="size-5 text-[#b6c4ff]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#e3e2e7]">Gmail</p>
                    <p className="text-xs text-[#8d90a2]">Access your inbox</p>
                  </div>
                </div>
                {connectedNames.has("gmail") ? (
                  <span className="flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 font-mono text-[11px] text-green-400">
                    <CheckCircle2 size={12} />
                    Connected
                  </span>
                ) : (
                  <a
                    href="/api/connect?plugin=gmail"
                    className="rounded-lg bg-[#0055ff] px-4 py-2 text-sm font-medium text-[#e3e6ff] transition-opacity hover:opacity-90"
                  >
                    Connect
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#434656]/10 bg-[#1a1b1f] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[#292a2e]">
                    <Calendar className="size-5 text-[#b6c4ff]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#e3e2e7]">Google Calendar</p>
                    <p className="text-xs text-[#8d90a2]">Manage your schedule</p>
                  </div>
                </div>
                {connectedNames.has("googlecalendar") ? (
                  <span className="flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 font-mono text-[11px] text-green-400">
                    <CheckCircle2 size={12} />
                    Connected
                  </span>
                ) : (
                  <a
                    href="/api/connect?plugin=googlecalendar"
                    className="rounded-lg bg-[#0055ff] px-4 py-2 text-sm font-medium text-[#e3e6ff] transition-opacity hover:opacity-90"
                  >
                    Connect
                  </a>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
