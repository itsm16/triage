import Image from 'next/image'
import React from 'react'
import { LandingChatDemo } from './landing-chat-demo'

{/* Chat UI Demo */}
const ChatMockup = () => {
  return (
          <div className="relative z-10 mt-8 mb-24 w-full max-w-[1200px] animate-in fade-in slide-in-from-bottom-8 duration-700 flex">
            <div className="group relative w-full">
              <div className="absolute -inset-4 rounded-full bg-black/20 opacity-50 blur-[10px] transition-opacity duration-500 group-hover:opacity-70" />
              <div className="glass-card relative overflow-hidden rounded-2xl border border-[#434656]/20 shadow-2xl">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
                <div className="bg-black/1 p-2 backdrop-blur-sm md:p-4">
                  <div className="mb-2 flex gap-1.5 px-2 md:mb-4">
                    <div className="size-2.5 rounded-full bg-[#ffb4ab]/40" />
                    <div className="size-2.5 rounded-full bg-[#c8c6c5]/40" />
                    <div className="size-2.5 rounded-full bg-[#b6c4ff]/40" />
                  </div>
                  <div className="flex h-[360px] overflow-hidden rounded-lg border border-[#434656]/10 shadow-2xl sm:h-[460px] md:h-[560px]">
                    {/* Chat Sidebar */}
                    <div className="hidden w-56 shrink-0 border-r border-[#434656]/10 bg-[#121317] p-3 md:block">
                      <div className="flex items-center gap-3 px-2 py-2">
                        <Image src="/logo.svg" alt="Triage" width={28} height={28} className="size-7 shrink-0" />
                        <span className="text-base font-medium tracking-tight text-[#b6c4ff]">Triage</span>
                      </div>
                      <button className="mt-3 flex w-full items-center gap-3 rounded bg-[#0055ff] px-3 py-2 text-[#e3e6ff] transition-opacity hover:opacity-90">
                        <svg className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.05em]">Compose</span>
                      </button>
                      <nav className="mt-6 space-y-1">
                        {[
                          { label: "Dashboard" },
                          { label: "Chat", active: true },
                          { label: "Calendar" },
                          { label: "Automation" },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.05em] transition-colors ${
                              item.active
                                ? "bg-[#b6c4ff]/10 text-[#b6c4ff]"
                                : "text-[#8d90a2] hover:bg-[#b6c4ff]/5 hover:text-[#c3c5d9]"
                            }`}
                          >
                            {item.label}
                          </div>
                        ))}
                      </nav>
                      <div className="mt-6 space-y-1 border-t border-[#434656]/10 pt-4">
                        {["Templates", "Settings"].map((item) => (
                          <div
                            key={item}
                            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-[#8d90a2] transition-colors hover:bg-[#b6c4ff]/5 hover:text-[#c3c5d9]"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                      <div className="mt-auto flex items-center gap-3 border-t border-[#434656]/10 px-2 pt-3">
                        <div className="flex size-7 items-center justify-center rounded-full bg-[#292a2e] text-[10px] text-[#c3c5d9]">U</div>
                        <div className="text-[11px] text-[#c3c5d9]">User</div>
                      </div>
                    </div>
                    <LandingChatDemo />
                  </div>
                </div>
              </div>
            </div>
          </div>
  )
}

export default ChatMockup