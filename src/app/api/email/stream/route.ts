import { type NextRequest } from "next/server";
import { auth } from "~/server/better-auth";
import { getTenantFromUser } from "~/server/corsair-tenant";
import { formatInternalDate, parseFromHeader } from "~/lib/utils";

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

          const ids = (listRes.messages ?? []).map((m: { id?: string }) => m.id!).filter(Boolean);
          const nextPageToken = listRes.nextPageToken ?? null;

          const dbEntities = ids.length > 0
            ? await tenant.gmail.db.messages.findManyByEntityIds(ids)
            : [];
          const cache = new Map(dbEntities.map((e: { entity_id: string; data: any }) => [e.entity_id, e.data]));

          send({ type: "ids", ids, nextPageToken });

          if (ids.length === 0) {
            close();
            return;
          }

          for (let i = 0; i < ids.length; i++) {
            const id = ids[i]!;
            const cached = cache.get(id);

            let from: string;
            let subject: string;
            let snippet: string;
            let labelIds: string[];
            let internalDate: string | null | undefined;
            let threadId: string | undefined;

            if (cached?.from) {
              from = cached.from;
              subject = cached.subject ?? "(no subject)";
              snippet = cached.snippet ?? "";
              labelIds = cached.labelIds ?? [];
              internalDate = cached.internalDate;
              threadId = cached.threadId;
            } else {
              const m = await tenant.gmail.api.messages.get({
                id,
                format: "metadata",
              });
              from = extractHeader(m, "From") ?? "";
              subject = extractHeader(m, "Subject") ?? "(no subject)";
              snippet = m.snippet ?? "";
              labelIds = m.labelIds ?? [];
              internalDate = m.internalDate;
              threadId = m.threadId;
            }

            const msg = {
              id,
              threadId,
              snippet,
              subject,
              from: parseFromHeader(from),
              date: formatInternalDate(internalDate),
              labelIds,
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
