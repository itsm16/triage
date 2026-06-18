import Image from "next/image"
import { Button } from "~/components/ui/button"
import { DropletField } from "~/components/droplet-field"
import Link from "next/link"
import ChatMockup from "~/components/landing/chat-mockup"
import Bento from "~/components/landing/bento"
import { Zap } from "lucide-react"

export default function Home() {
  return (
    <>
      <nav className="fixed top-4 left-1/2 z-50 w-[90%] max-w-5xl -translate-x-1/2 rounded-full bg-black/30 px-6 py-2.5 backdrop-blur-sm transition-all duration-300 border border-[#b6c4ff]/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.svg" alt="Triage" width={28} height={28} className="size-7" />
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
        <section className="relative flex min-h-[80vh] flex-col items-center overflow-visible px-4 pt-32 md:px-10 md:pt-40">
          <DropletField />

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b6c4ff]/20 bg-[#b6c4ff]/5 px-3 py-1 hover:scale-110 transition-transform duration-300">
              <Zap className="size-3.5 fill-[#b6c4ff] text-[#b6c4ff]" />
              <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[#b6c4ff] cursor-pointer">
                Your inbox. Under command.
              </span>
            </div>

            <h1 className="gradient-text mb-4 text-[clamp(32px,6vw,56px)] font-bold leading-[1.1] tracking-tighter">
              Your communication, automated.
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#c3c5d9] md:text-xl">
              AI-native control system for professionals who live in
              their inbox and calendar. Command your workflow with precision.
            </p>
          </div>

          <ChatMockup/>
        </section>

        
        {/* Features Bento Grid */}
        <Bento/>

        {/* <DashboardMockup /> */}
        {/* <DashboardMockup/> */}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#434656]/30 bg-[#0d0e12] py-12">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-8 px-10 md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#c3c5d9]">
              Triage
            </span>
          </div>
          <div className="flex gap-8">
            {["Privacy Policy", "Terms of Service"].map(
              (item) => (
                <Link
                  key={item}
                  href={`/legal#${item.toLowerCase().replace(" ", "-")}`}
                  className="font-mono text-xs font-medium uppercase tracking-[0.05em] text-[#c3c5d9] transition-colors hover:text-[#b6c4ff]"
                >
                  {item}
                </Link>
              ),
            )}
          </div>
        </div>
      </footer>
    </>
  )
}
