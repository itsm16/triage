import type { NextRequest } from "next/server";
import { auth } from "~/server/better-auth";
import { addClient, removeClient } from "~/lib/sse";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  let controller: ReadableStreamDefaultController | null = null;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
      addClient(userId, c);
      c.enqueue(new TextEncoder().encode("event: connected\ndata: {}\n\n"));
    },
    cancel() {
      if (controller) removeClient(userId, controller);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
