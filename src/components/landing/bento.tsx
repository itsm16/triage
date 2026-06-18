import {
  Calendar,
  Check,
  Filter,
  Mail,
  Sparkles,
  Terminal,
} from "lucide-react"
import { TypingText } from "~/components/typing-text"

const Bento = () => {
  return (
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
  )
}

export default Bento