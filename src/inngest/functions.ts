import { inngest } from "./client";

type GmailMessageProcessedEvent = {
  data: {
    tenantId: string;
    emailAddress: string;
    eventType: string;
    historyId: string;
  };
};

export const onGmailMessageProcessed = inngest.createFunction(
  { id: "gmail-message-processed", triggers: { event: "gmail/message.processed" }, retries: 3 },
  async ({ event }) => {
    const { tenantId, emailAddress, eventType } = (event as unknown as GmailMessageProcessedEvent).data;
  },
);

export const renewGmailWatch = inngest.createFunction(
  { id: "gmail-watch-renewal", triggers: { cron: "0 0 */6 * *" }, retries: 3 },
  async () => {
    // TODO: query all tenants with Gmail connected, renew users.watch
  },
);

export const functions = [onGmailMessageProcessed, renewGmailWatch];
