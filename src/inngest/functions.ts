import { inngest } from "./client";

export const onGmailMessageProcessed = inngest.createFunction(
  { id: "gmail-message-processed", triggers: { event: "gmail/message.processed" }, retries: 3 },
  async () => {
    // TODO: handle processed Gmail messages
  },
);

export const renewGmailWatch = inngest.createFunction(
  { id: "gmail-watch-renewal", triggers: { cron: "0 0 */6 * *" }, retries: 3 },
  async () => {
    // TODO: query all tenants with Gmail connected, renew users.watch
  },
);

export const functions = [onGmailMessageProcessed, renewGmailWatch];
