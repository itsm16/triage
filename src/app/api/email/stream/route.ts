import { type NextRequest } from "next/server";
import { auth } from "~/server/better-auth";
import { getTenantFromUser } from "~/server/corsair-tenant";

function extractHeader(
  msg: { payload?: { headers?: Array<{ name?: string; value?: string }> } },
  name: string,
): string | undefined {
  return msg.payload?.headers?.find((h) => h.name === name)?.value;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    let body: { pageToken?: string; labelIds?: string[]; q?: string };
    try {
      const rawText = await req.text();
      const parsed: unknown = JSON.parse(rawText);
      body = parsed as { pageToken?: string; labelIds?: string[]; q?: string };
    } catch {
      return new Response("Bad Request: invalid JSON body", { status: 400 });
    }

    const tenant = getTenantFromUser(session.user.id);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let closed = false;

        const send = (data: unknown) => {
          if (closed) return;
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch {
            // stream cancelled by client
          }
        };

        const close = () => {
          if (closed) return;
          closed = true;
          try {
            controller.close();
          } catch {
            // already closed
          }
        };

        try {
          const listRes = await tenant.gmail.api.messages.list({
            maxResults: 6,
            pageToken: body.pageToken,
            labelIds: body.labelIds,
            q: body.q,
          });

          const messages = listRes.messages ?? [];
          const ids = messages.map((m: { id?: string }) => m.id!);
          const nextPageToken = listRes.nextPageToken ?? null;

          send({ type: "ids", ids, nextPageToken });

          if (ids.length === 0) {
            close();
            return;
          }

          for (let i = 0; i < ids.length; i++) {
            const id = ids[i]!;
            const m = await tenant.gmail.api.messages.get({
              id,
              format: "metadata",
            });

            const msg = {
              id: m.id,
              threadId: m.threadId,
              snippet: m.snippet ?? "",
              subject: extractHeader(m, "Subject") ?? "(no subject)",
              from: extractHeader(m, "From") ?? "",
              date: extractHeader(m, "Date") ?? "",
              labelIds: m.labelIds ?? [],
            };

            send({ type: "message", index: i, total: ids.length, message: msg });

            if (i < ids.length - 1) {
              await sleep(30);
            }
          }

          send({ type: "done" });
        } catch (err) {
          send({ type: "error", message: err instanceof Error ? err.message : "Unknown error" });
        } finally {
          close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("email stream handler error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
