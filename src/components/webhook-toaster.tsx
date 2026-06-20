"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNotificationStore } from "~/lib/notification-store";

interface WebhookMessage {
  type: "messageReceived" | "messageDeleted" | "messageLabelChanged"
  historyId: string
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
            toast.info("New email received", {
              description: "Check your inbox",
              duration: 4000,
            })
          }
        } else if (data.type === "messageDeleted") {
          toast.info("Email deleted", { duration: 3000 });
        } else if (data.type === "messageLabelChanged") {
          toast.info("Email labels changed", { duration: 3000 });
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
