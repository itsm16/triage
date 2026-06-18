import Image from 'next/image'
import React from 'react'

{/* Product Screenshot - Dashboard UI Mockup */}
const DashboardMockup = () => {
  return (
        <section className="relative mx-auto my-24 max-w-[1200px] px-4 md:px-10">
          <div className="group relative">
            <div className="absolute -inset-4 rounded-full bg-[#b6c4ff]/20 opacity-50 blur-[100px] transition-opacity duration-500 group-hover:opacity-70" />
            <div className="glass-card relative overflow-hidden rounded-2xl border border-[#434656]/20 shadow-2xl">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
              <div className="bg-[#0d0e12]/50 p-2 backdrop-blur-md md:p-4">
                <div className="mb-2 flex gap-1.5 px-2 md:mb-4">
                  <div className="size-2.5 rounded-full bg-[#ffb4ab]/40" />
                  <div className="size-2.5 rounded-full bg-[#c8c6c5]/40" />
                  <div className="size-2.5 rounded-full bg-[#b6c4ff]/40" />
                </div>
                <div className="flex overflow-hidden rounded-lg border border-[#434656]/10 shadow-2xl">
                  {/* Sidebar */}
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
                        { label: "Dashboard", active: true },
                        { label: "Email" },
                        { label: "Calendar" },
                        { label: "Chat" },
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
                  {/* Main Content */}
                  <div className="flex-1 bg-[#121317] p-4 md:p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-semibold text-[#e3e2e7]">Hey, Alex</h2>
                        <p className="text-xs text-[#8d90a2]">Here&apos;s your overview</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      {/* Card 1: Important & Unread */}
                      <div className="rounded-xl border border-[#434656]/10 bg-[#1a1b1f] p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="size-3 rounded bg-[#b6c4ff]/20 p-1.5 flex items-center justify-center">
                              <svg className="size-2 text-[#b6c4ff]" fill="currentColor" viewBox="0 0 24 24"><path d="M22 10.5V20a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h10.5" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                            <h3 className="text-xs font-semibold text-[#e3e2e7]">Important & Unread</h3>
                          </div>
                          <span className="text-[10px] text-[#b6c4ff]">View all</span>
                        </div>
                        <div className="space-y-1.5">
                          {[
                            { from: "AWS Notifications", subject: "Invoice Available - April 2026", snippet: "Your AWS invoice for April 2026 is now available..." },
                            { from: "Sarah Chen", subject: "Q2 Budget Review", snippet: "Hi, I wanted to schedule a time to go over the Q2 budget..." },
                            { from: "GitHub", subject: "[org/platform] 3 new PRs", snippet: "New pull requests awaiting your review: #892, #893..." },
                          ].map((email) => (
                            <div key={email.subject} className="cursor-pointer rounded-lg border border-[#434656]/10 bg-[#121317] px-3 py-2 transition-colors hover:border-[#b6c4ff]/20">
                              <p className="truncate text-[11px] font-medium text-[#e3e2e7]">{email.from}</p>
                              <p className="truncate text-[11px] font-semibold text-[#c3c5d9]">{email.subject}</p>
                              <p className="mt-0.5 line-clamp-1 text-[10px] text-[#8d90a2]">{email.snippet}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Card 2: Events */}
                      <div className="rounded-xl border border-[#434656]/10 bg-[#1a1b1f] p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="size-3 rounded bg-[#b6c4ff]/20 p-1.5 flex items-center justify-center">
                              <svg className="size-2 text-[#b6c4ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            </div>
                            <h3 className="text-xs font-semibold text-[#e3e2e7]">Events</h3>
                          </div>
                          <span className="text-[10px] text-[#b6c4ff]">View all</span>
                        </div>
                        <div className="space-y-1">
                          {[
                            { label: "Today's", count: 2, events: [
                              { title: "Sprint Planning", time: "10:00 AM - 11:00 AM" },
                              { title: "Design Review", time: "2:00 PM - 3:00 PM" },
                            ]},
                            { label: "Upcoming", count: 1, events: [
                              { title: "Q2 Budget Meeting", time: "Tomorrow, 11:00 AM" },
                            ]},
                          ].map((group) => (
                            <div key={group.label}>
                              <div className="flex cursor-pointer items-center justify-between px-1 py-1.5">
                                <span className="text-xs text-[#c3c5d9]">{group.label} <span className="text-[10px] text-[#8d90a2]">({group.count})</span></span>
                                <svg className="size-3 text-[#8d90a2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                              </div>
                              <div className="space-y-1 pb-1">
                                {group.events.map((ev) => (
                                  <div key={ev.title} className="cursor-pointer rounded-lg border border-[#434656]/10 bg-[#121317] px-3 py-2 transition-colors hover:border-[#b6c4ff]/20">
                                    <p className="truncate text-[11px] font-medium text-[#e3e2e7]">{ev.title}</p>
                                    <p className="text-[10px] text-[#8d90a2]">{ev.time}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Card 3: Recent Activity */}
                      <div className="rounded-xl border border-[#434656]/10 bg-[#1a1b1f] p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <div className="size-3 rounded bg-[#b6c4ff]/20 p-1.5 flex items-center justify-center">
                            <svg className="size-2 text-[#b6c4ff]" fill="currentColor" viewBox="0 0 24 24"><path d="M22 10.5V20a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h10.5" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                          <h3 className="text-xs font-semibold text-[#e3e2e7]">Recent Activity</h3>
                        </div>
                        <div className="space-y-0">
                          {[
                            { status: "SUCCESS", time: "2m ago", label: "List AWS invoices", detail: "Fetched 12 invoices from AWS billing" },
                            { status: "SUCCESS", time: "5m ago", label: "Send a mail to Sarah Chen", detail: "Follow-up on Q2 Budget Review" },
                            { status: "RUNNING", time: "1m ago", label: "Sync Google Calendar", detail: "Fetching upcoming events for next 7 days" },
                            { status: "SUCCESS", time: "12m ago", label: "Archive processed invoices", detail: "Moved 8 threads to Finances folder" },
                            { status: "SUCCESS", time: "18m ago", label: "Draft response to GitHub PR #892", detail: "Auto-generated review summary" },
                          ].map((log) => (
                            <div key={log.label} className="relative pb-4 last:pb-0">
                              <div className="absolute left-[3px] top-[14px] h-full w-[2px] bg-[#434656]/40 last:hidden" />
                              <div className="flex items-start gap-2.5">
                                <div className={`mt-[5px] size-2 shrink-0 rounded-full border border-[#0d0e12] ${
                                  log.status === "SUCCESS" || log.status === "RUNNING"
                                    ? "bg-[#b6c4ff]"
                                    : "bg-[#434656]"
                                }`} />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-mono text-[8px] uppercase ${
                                      log.status === "SUCCESS" || log.status === "RUNNING"
                                        ? "text-[#b6c4ff]"
                                        : "text-[#8d90a2]"
                                    }`}>{log.status}</span>
                                    <span className="font-mono text-[8px] text-[#8d90a2]">{log.time}</span>
                                  </div>
                                  <p className="mt-0.5 truncate text-[11px] font-medium text-[#e3e2e7]">{log.label}</p>
                                  <p className="mt-0.5 truncate font-mono text-[8px] text-[#c3c5d9]/70">{log.detail}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
  )
}

export default DashboardMockup