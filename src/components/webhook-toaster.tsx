"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useNotificationStore } from "~/lib/notification-store";

interface WebhookMessage {
  type: "messageReceived" | "messageDeleted" | "messageLabelChanged"
}

export function WebhookToaster() {
  const increment = useNotificationStore((s) => s.increment)

  useEffect(() => {
    const eventSource = new EventSource("/api/sse");

    eventSource.addEventListener("gmail:messageChanged", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data as string) as WebhookMessage;
        if (data.type === "messageReceived") {
          increment()
          toast.info("New email received", {
            description: "Check your inbox",
            duration: 4000,
          })
        } else if (data.type === "messageDeleted") {
          toast.info("Email deleted");
        } else if (data.type === "messageLabelChanged") {
          toast.info("Email labels changed");
        }
      } catch {
        // ignore parse errors
      }
    });

    return () => eventSource.close();
  }, [increment]);

  return null;
}
