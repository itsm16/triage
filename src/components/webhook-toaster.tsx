"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface WebhookMessage {
  type: "messageReceived" | "messageDeleted" | "messageLabelChanged"
}

export function WebhookToaster() {
  useEffect(() => {
    const eventSource = new EventSource("/api/sse");

    eventSource.addEventListener("gmail:messageChanged", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data as string) as WebhookMessage;
        if (data.type === "messageReceived") {
          toast.info("New email received");
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
  }, []);

  return null;
}
