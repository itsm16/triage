"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNotificationStore } from "~/lib/notification-store";

interface WebhookMessage {
  type: "messageReceived"
  historyId: string
  action?: "received" | "delete" | "trash" | "updated"
}

export function WebhookToaster() {
  const increment = useNotificationStore((s) => s.increment)

  const lastToastRef = useRef(0)
  const seenHistoryRef = useRef(new Set<string>())

  useEffect(() => {
    const eventSource = new EventSource("/api/sse");

    eventSource.addEventListener("open", () => {
      console.log("[webhook-toaster] SSE connected");
    });

    eventSource.addEventListener("error", () => {
      console.error("[webhook-toaster] SSE connection failed (check auth/cookies)");
    });

    eventSource.addEventListener("gmail:messageChanged", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data as string) as WebhookMessage;

        if (data.historyId && seenHistoryRef.current.has(data.historyId)) return;
        if (data.historyId) {
          seenHistoryRef.current.add(data.historyId);
          if (seenHistoryRef.current.size > 100) {
            seenHistoryRef.current.clear();
          }
        }

        if (data.type === "messageReceived") {
          increment()
          const now = Date.now();
          if (now - lastToastRef.current > 2000) {
            lastToastRef.current = now;
            switch (data.action) {
              case "delete":
                toast.warning("Email moved to trash", {
                  description: "A message was sent to the Trash folder",
                  duration: 4000,
                })
                break;
              case "trash":
                toast.warning("Email permanently deleted", {
                  description: "A message was permanently removed",
                  duration: 4000,
                })
                break;
              case "updated":
                toast.info("Email updated", {
                  description: "Labels changed in your inbox",
                  duration: 4000,
                })
                break;
              default:
            toast.info("Check new updates", {
              description: "Something changed in your inbox",
              duration: 4000,
            })
            }
          }
        }
      } catch {
        console.error("[webhook-toaster] failed to parse event", e.data);
      }
    });

    return () => {
      console.log("[webhook-toaster] closing SSE");
      eventSource.close();
    };
  }, [increment]);

  return null;
}
