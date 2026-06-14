import {
  Calendar,
  Check,
  CheckCheck,
  Filter,
  Mail,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { DropletField } from "~/components/droplet-field"
import { TypingText } from "~/components/typing-text"

export default function Home() {
  return (
    <>
      <nav className="fixed top-4 left-1/2 z-50 w-[90%] max-w-5xl -translate-x-1/2 rounded-full bg-black/30 px-6 py-2.5 backdrop-blur-sm transition-all duration-300 border border-[#b6c4ff]/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded bg-[#0055ff]">
                <Zap className="text-[#e3e6ff]" size={16} />
              </div>
              <span className="font-mono text-xs font-medium uppercase tracking-[0.05em] text-white cursor-pointer">
                Triage
              </span>
            </div>
            <div className="hidden gap-6 md:flex">
              {["Features"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="font-mono text-xs font-medium uppercase tracking-[0.05em] text-[#c3c5d9] transition-colors hover:text-[#b6c4ff]"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/sign-in">
              <Button
                variant="ghost"
                className="hidden font-mono text-xs font-medium uppercase tracking-[0.05em] bg-[#0055ff] text-[#e3e2e7] hover:border hover:border-white/30 hover:bg-[#0044cc] md:block"
              >
                Sign In
              </Button>
            </a>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 md:px-10">
          <DropletField />

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#b6c4ff]/20 bg-[#b6c4ff]/5 px-3 py-1 hover:scale-110 transition-transform duration-300">
              <Zap className="size-3.5 fill-[#b6c4ff] text-[#b6c4ff]" />
              <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[#b6c4ff] cursor-pointer">
                Your inbox. Under command.
              </span>
            </div>

            <h1 className="gradient-text mb-6 text-[clamp(40px,8vw,72px)] font-bold leading-[1.1] tracking-tighter">
              Your communication, automated.
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#c3c5d9] md:text-xl">
              AI-native control system for professionals who live in
              their inbox and calendar. Command your workflow with precision.
            </p>

            {/* <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button className="w-full rounded-xl bg-[#0055ff] px-8 py-6 text-base font-bold text-[#002780] shadow-lg shadow-[#0055ff]/20 transition-transform hover:-translate-y-0.5 sm:w-auto">
                Secure Early Access
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-xl border-[#434656] px-8 py-6 text-base font-bold hover:bg-white/5 sm:w-auto"
              >
                Watch the Concept
              </Button>
            </div> */}
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="mx-auto max-w-[1200px] px-4 py-32 md:px-10">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-[32px] font-semibold leading-10 tracking-tight md:text-5xl">
              Engineered for Operators
            </h2>
            <p className="text-lg text-[#c3c5d9]">
              Three pillars of the Triage high-performance architecture.
            </p>
          </div>

          <div className="grid h-auto grid-cols-1 gap-6 md:h-[600px] md:grid-cols-12">
            {/* Feature 1: Zero-Touch Triage */}
            <div className="glass-card group relative flex flex-col justify-between overflow-hidden rounded-2xl p-8 md:col-span-7">
              <div className="relative z-10">
                <div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-[#b6c4ff]/10">
                  <Filter className="size-6 text-[#b6c4ff]" />
                </div>
                <h3 className="mb-3 text-[32px] font-semibold leading-10 tracking-tight">
                  Zero-Touch Triage
                </h3>
                <p className="max-w-md text-sm leading-5 text-[#c3c5d9]">
                  Our neural engine categorizes, prioritizes, and drafts
                  responses before you even open the app. Spend your time on
                  decision, not detection.
                </p>
              </div>
              <div className="relative mt-8 h-48 rounded-lg border border-[#434656]/30 bg-[#121317]/40 p-4">
                <div className="mb-4 flex animate-pulse items-center gap-4 rounded-lg bg-white/5 p-3">
                  <div className="size-8 rounded-full bg-[#b6c4ff]/20" />
                  <div className="h-3 flex-1 rounded bg-white/10" />
                </div>
                <div className="flex items-center gap-4 rounded-lg border border-[#b6c4ff]/20 bg-[#b6c4ff]/10 p-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#b6c4ff]">
                    <Check className="size-4 text-white" />
                  </div>
                  <div className="h-3 flex-1 rounded bg-[#b6c4ff]/20" />
                </div>
              </div>
            </div>

            {/* Feature 2: NL Commands */}
            <div className="glass-card group flex flex-col rounded-2xl p-8 md:col-span-5">
              <div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-[#b6c4ff]/10">
                <Terminal className="size-6 text-[#b6c4ff]" />
              </div>
              <h3 className="mb-3 text-[32px] font-semibold leading-10 tracking-tight">
                NL Commands
              </h3>
              <p className="mb-auto text-sm leading-5 text-[#c3c5d9]">
                &ldquo;Move all threads from Amazon to Finances and snooze for 2
                days.&rdquo; Execution at the speed of thought.
              </p>
              <div className="mt-8 rounded-lg border border-[#434656]/20 bg-[#0d0e12] p-4 font-mono text-xs font-medium uppercase tracking-[0.05em]">
                <span className="text-[#b6c4ff]">&gt;</span>{" "}
                <TypingText text="rescheduling meetings..." />
              </div>
            </div>

            {/* Feature 3: Visual Flow */}
            <div className="glass-card group flex flex-col items-center gap-12 rounded-2xl p-8 md:col-span-12 md:flex-row">
              <div className="md:w-1/2">
                <div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-[#b6c4ff]/10">
                  <Sparkles className="size-6 text-[#b6c4ff]" />
                </div>
                <h3 className="mb-3 text-[32px] font-semibold leading-10 tracking-tight">
                  Visual Flow Automation
                </h3>
                <p className="text-sm leading-5 text-[#c3c5d9]">
                  Design complex communication logic with a canvas-based flow
                  builder. No code, just intent. Bridge the gap between your
                  apps seamlessly.
                </p>
              </div>
              <div className="relative flex h-40 w-full items-center justify-center md:w-1/2">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#b6c4ff]/40 to-transparent" />
                </div>
                <div className="relative z-10 flex gap-12">
                  <div className="flex size-16 items-center justify-center rounded-xl border border-[#434656] bg-[#1e1f23] shadow-2xl">
                    <Mail className="size-8 text-[#b6c4ff]" />
                  </div>
                  <div className="flex size-16 items-center justify-center rounded-xl bg-[#0055ff] shadow-2xl shadow-[#0055ff]/20">
                    <Sparkles className="size-8 text-white" />
                  </div>
                  <div className="flex size-16 items-center justify-center rounded-xl border border-[#434656] bg-[#1e1f23] shadow-2xl">
                    <Calendar className="size-8 text-[#b6c4ff]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Advantage */}
        <section className="bg-[#0d0e12] py-32">
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-20 px-4 md:grid-cols-2 md:px-10">
            <div className="order-2 md:order-1">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-[#434656]/30 bg-[#121317] p-8">
                <div className="absolute inset-0 bg-[#b6c4ff]/5" />
                <div className="absolute bottom-8 left-8 right-8 flex h-32 items-end gap-2">
                  <div className="h-[40%] flex-1 rounded-t-lg bg-[#b6c4ff]/20" />
                  <div className="h-[60%] flex-1 rounded-t-lg bg-[#b6c4ff]/20" />
                  <div className="h-[45%] flex-1 rounded-t-lg bg-[#b6c4ff]/20" />
                  <div className="h-[95%] flex-1 rounded-t-lg bg-[#b6c4ff]" />
                  <div className="h-[50%] flex-1 rounded-t-lg bg-[#b6c4ff]/20" />
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <span className="mb-4 block font-mono text-xs font-medium uppercase tracking-[0.2em] text-[#b6c4ff]">
                The AI Advantage
              </span>
              <h2 className="mb-6 text-[32px] font-semibold leading-10 tracking-tighter md:text-5xl">
                Quantifiable Performance Gains.
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-[#c3c5d9]">
                Triage isn&apos;t just a wrapper; it&apos;s a re-engineered
                kernel for productivity. Our early adopters report a 40%
                reduction in time spent on reactive communication and a 2x
                increase in calendar availability.
              </p>
              <ul className="space-y-4">
                {[
                  {
                    title: "Predictive Scheduling",
                    desc: "AI predicts meeting outcomes and pre-blocks prep time.",
                  },
                  {
                    title: "Context Switching Mitigation",
                    desc: "Batch similar tasks automatically to maintain deep focus.",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <CheckCheck className="mt-1 size-5 text-[#b6c4ff]" />
                    <div>
                      <h4 className="text-[20px] font-medium leading-7">
                        {item.title}
                      </h4>
                      <p className="text-sm leading-5 text-[#c3c5d9]">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 py-40">
          <div className="glass-card relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] p-12 text-center md:p-24">
            <div className="absolute -right-24 -top-24 size-64 rounded-full bg-[#b6c4ff]/10 blur-[100px]" />
            <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-[#b6c4ff]/5 blur-[100px]" />
            <h2 className="mb-8 text-[32px] font-semibold leading-10 tracking-tighter md:text-6xl">
              Ready to operate at full capacity?
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-lg text-[#c3c5d9]">
              Join the 10,000+ high-performance professionals currently in the
              private beta. Your new inbox is waiting.
            </p>
            <div className="mx-auto max-w-md">
              <form className="flex flex-col gap-3 sm:flex-row">
                <Input
                  type="email"
                  placeholder="work@company.com"
                  className="flex-1 rounded-xl border-[#434656] bg-[#1a1b1f] px-6 py-5 text-sm leading-5"
                />
                <Button className="rounded-xl bg-[#0055ff] px-8 py-5 text-base font-bold text-[#002780] hover:opacity-90">
                  Join Waitlist
                </Button>
              </form>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-[#c3c5d9]/60">
                No credit card required &bull; Instant access for selected teams
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#434656]/30 bg-[#0d0e12] py-12">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-8 px-10 md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#c3c5d9]">
              Triage
            </span>
            <p className="font-mono text-[11px] text-[#c3c5d9]/50">
              &copy; 2024 Triage AI Productivity. All rights reserved.
            </p>
          </div>
          <div className="flex gap-8">
            {["Privacy Policy", "Terms of Service", "Security", "Status"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="font-mono text-xs font-medium uppercase tracking-[0.05em] text-[#c3c5d9] transition-colors hover:text-[#b6c4ff]"
                >
                  {item}
                </a>
              ),
            )}
          </div>
          <a
            href="#"
            className="flex size-8 items-center justify-center rounded-full border border-[#434656] text-[#c3c5d9] transition-colors hover:bg-white/5"
          >
            <svg className="size-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </footer>
    </>
  )
}
