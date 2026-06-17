"use client"

interface EmailMessageData {
  id?: string
  from?: string
  to?: string
  date?: string
  bodyHtml?: string
  bodyText?: string | null
  snippet?: string
}

interface EmailMessageProps {
  message: EmailMessageData
  variant: "original" | "reply"
}

export function EmailMessage({ message, variant }: EmailMessageProps) {
  if (variant === "original") {
    return (
      <div>
        <div className="mb-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full bg-[#343539] text-[10px] font-bold text-[#c3c5d9]">
                {message.from?.charAt(0) ?? "?"}
              </div>
              <div className="text-xs font-medium text-[#e3e2e7]">
                {message.from}
              </div>
              <span className="text-[10px] text-[#8d90a2]">
                to {message.to}
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#8d90a2]">
              {message.date}
            </span>
          </div>
        </div>

        {message.bodyHtml ? (
          <iframe
            className="w-full rounded bg-white"
            style={{ minHeight: "calc(100vh - 220px)", backgroundColor: "white", color: "black", border: "1px solid #e3e2e7" }}
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
          <div className="whitespace-pre-line rounded border border-[#e3e2e7] bg-white p-4 text-base leading-relaxed text-black">
            {message.bodyText ?? message.snippet}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="ml-6">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex size-5 items-center justify-center rounded-full bg-[#343539] text-[8px] font-bold text-[#c3c5d9]">
          {message.from?.charAt(0) ?? "?"}
        </div>
        <span className="truncate text-[11px] text-[#c3c5d9]">
          {message.from?.split("<")[0]?.trim() ?? message.from}
        </span>
        <span className="font-mono text-[9px] text-[#8d90a2]">
          {message.date}
        </span>
      </div>

      {message.bodyHtml ? (
        <iframe
          className="w-full rounded bg-white"
          style={{ minHeight: "200px", backgroundColor: "white", color: "black", border: "1px solid #e3e2e7" }}
          sandbox="allow-popups allow-popups-to-escape-sandbox"
          title="email content"
          srcDoc={`<html>
            <head>
            <meta charset="utf-8">
            <style>
              body{
                margin:0;
                padding:1rem;
                padding-bottom:2rem;
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
        <div className="whitespace-pre-line rounded border border-[#e3e2e7] bg-white p-3 text-sm leading-relaxed text-black">
          {message.bodyText ?? message.snippet}
        </div>
      )}
    </div>
  )
}
