"use client"

import { X, Mail } from "lucide-react"
import { useEmailPreviewStore } from "~/lib/email-preview-store"
import { api } from "~/trpc/react"

export function EmailPreviewPanel() {
  const { email, close } = useEmailPreviewStore()

  const hasId = !!email?.id
  const { data: message, isLoading } = api.corsair.getMessage.useQuery(
    { id: email?.id ?? "" },
    { enabled: hasId },
  )

  if (!email) return null

  const showSnippetFallback = !hasId || (!isLoading && !message?.bodyText && !message?.bodyHtml)

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        className="pointer-events-auto absolute w-[480px] rounded-t-xl border border-[#434656]/20 bg-[#121317] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200"
        style={{ bottom: 16, right: 16 }}
      >
        <div className="flex items-center justify-between rounded-t-xl border-b border-[#434656]/10 bg-[#0d0e12] px-4 py-2.5">
          <span className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.1em] text-[#e3e2e7]">
            <Mail className="size-3.5" />
            Email
          </span>
          <button
            onClick={close}
            className="rounded p-1 text-[#8d90a2] transition-colors hover:bg-[#292a2e] hover:text-[#c3c5d9]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-4">
          {isLoading && hasId ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 w-3/4 rounded bg-[#292a2e]" />
              <div className="h-3 w-1/2 rounded bg-[#292a2e]" />
              <div className="h-24 w-full rounded bg-[#292a2e]" />
            </div>
          ) : (
            <>
              <div className="mb-4 space-y-1.5">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-medium text-[#e3e2e7] break-words">
                    {email.subject}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#b6c4ff]">
                    {email.from}
                  </p>
                  {message?.to && (
                    <p className="font-mono text-[10px] text-[#8d90a2]">
                      To: {message.to}
                    </p>
                  )}
                  {message?.date && (
                    <p className="font-mono text-[10px] text-[#8d90a2]">
                      {new Date(message.date).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto rounded-lg border border-[#434656]/10 overflow-hidden">
                {showSnippetFallback ? (
                  <div className="bg-white p-4">
                    <p className="text-sm leading-relaxed text-black whitespace-pre-line">
                      {email.snippet ?? (hasId ? (message?.snippet ?? "No content") : "No content")}
                    </p>
                  </div>
                ) : message?.bodyHtml ? (
                  <iframe
                    className="w-full bg-white"
                    style={{ minHeight: "400px", backgroundColor: "white", color: "black" }}
                    sandbox="allow-popups allow-popups-to-escape-sandbox"
                    title="email content"
                    srcDoc={`<html>
                      <head>
                      <meta charset="utf-8">
                      <style>
                        body{
                          margin:0;
                          padding:1rem;
                          padding-bottom:4rem;
                          font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
                          background:white;
                          color:black;
                        }
                        img{
                          max-width:100%;
                          height:auto;
                        }
                      </style>
                      </head>
                      <body>
                        ${message.bodyHtml}
                      </body>
                    </html>`}
                  />
                ) : (
                  <div className="bg-white p-4">
                    <p className="text-sm leading-relaxed text-black whitespace-pre-line">
                      {message?.bodyText ?? message?.snippet}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
