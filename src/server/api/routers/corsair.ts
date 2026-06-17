import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import React from "react";
import { render } from "@react-email/render";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { chatLogs, corsairAccounts, corsairIntegrations } from "~/server/db/schema";
import { InviteEmail } from "~/emails/invite-email";
import {
  buildAgentTools,
  runStep,
  executeToolCall,
  appendToolResult,
  buildConversation,
  SYSTEM_PROMPT,
  SYSTEM_PROMPT_REVIEW,
} from "~/server/agent-loop";

interface MessagePart {
  mimeType?: string;
  body?: { data?: string };
  parts?: MessagePart[];
  filename?: string;
}

const sentInvites = new Map<string, { title: string; start: string; end: string }>();

export const corsairRouter = createTRPCRouter({
  getConnectedPlugins: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({ name: corsairIntegrations.name })
      .from(corsairAccounts)
      .innerJoin(
        corsairIntegrations,
        eq(corsairAccounts.integrationId, corsairIntegrations.id),
      )
      .where(eq(corsairAccounts.tenantId, ctx.session.user.id));

    return rows.map((r) => r.name);
  }),

  listImportantMessages: protectedProcedure.query(async ({ ctx }) => {
    const res = await ctx.tenant.gmail.api.messages.list({
      maxResults: 5,
      q: "is:important is:unread",
    });
    const messages = res.messages ?? [];

    const full = await Promise.all(
      messages.map((m) =>
        ctx.tenant.gmail.api.messages.get({ id: m.id!, format: "full" })
      )
    );

    return full.map((m) => ({
      id: m.id,
      threadId: m.threadId,
      snippet: m.snippet,
      subject: extractHeader(m, "Subject") ?? "(no subject)",
      from: extractHeader(m, "From") ?? "",
      date: extractHeader(m, "Date") ?? "",
    }));
  }),

  listMessages: protectedProcedure
    .input(z.object({
      pageToken: z.string().optional(),
      labelIds: z.array(z.string()).optional(),
      q: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const res = await ctx.tenant.gmail.api.messages.list({
        maxResults: 20,
        pageToken: input?.pageToken,
        labelIds: input?.labelIds,
        q: input?.q,
      });
      const messages = res.messages ?? [];

      const full = await Promise.all(
        messages.map((m) =>
          ctx.tenant.gmail.api.messages.get({ id: m.id!, format: "full" })
        )
      );

      return {
        messages: full.map((m) => ({
          id: m.id,
          threadId: m.threadId,
          snippet: m.snippet,
          subject: extractHeader(m, "Subject") ?? "(no subject)",
          from: extractHeader(m, "From") ?? "",
          date: extractHeader(m, "Date") ?? "",
          labelIds: m.labelIds ?? [],
        })),
        nextPageToken: res.nextPageToken ?? null,
      };
    }),

  getMessage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const m = await ctx.tenant.gmail.api.messages.get({
        id: input.id,
        format: "full",
      });
      return parseMessage(m as Parameters<typeof parseMessage>[0]);
    }),

  getThread: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const thread = await ctx.tenant.gmail.api.threads.get({
        id: input.id,
        format: "full",
      });
      const messages = thread.messages ?? [];
      return await Promise.all(messages.map((m) => parseMessage(m as Parameters<typeof parseMessage>[0])));
    }),

  modifyMessage: protectedProcedure
    .input(z.object({
      id: z.string(),
      addLabelIds: z.array(z.string()).optional(),
      removeLabelIds: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.tenant.gmail.api.messages.modify({
        id: input.id,
        addLabelIds: input.addLabelIds,
        removeLabelIds: input.removeLabelIds,
      });
      return { success: true };
    }),

  listLabels: protectedProcedure.query(async ({ ctx }) => {
    const res = await ctx.tenant.gmail.api.labels.list({});
    return (res.labels ?? []).map((l: { id?: string; name?: string; type?: string; messagesTotal?: number; messagesUnread?: number; color?: Record<string, unknown> }) => ({
      id: l.id,
      name: l.name,
      type: l.type,
      messagesTotal: l.messagesTotal,
      messagesUnread: l.messagesUnread,
      color: l.color,
    }));
  }),

  sync: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const googleAccount = await ctx.db.query.account.findFirst({
      where: (account, { and, eq }) =>
        and(
          eq(account.userId, userId),
          eq(account.providerId, "google"),
        ),
    });

    if (!googleAccount?.accessToken) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Google account not connected",
      });
    }

    await ctx.tenant.gmail.keys.set_access_token(
      googleAccount.accessToken,
    );

    if (googleAccount.refreshToken) {
      await ctx.tenant.gmail.keys.set_refresh_token(
        googleAccount.refreshToken,
      );
    }

    if (googleAccount.accessTokenExpiresAt) {
      await ctx.tenant.gmail.keys.set_expires_at(
        googleAccount.accessTokenExpiresAt.toISOString(),
      );
    }

    return { success: true };
  }),

  createId: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [existing] = await ctx.db
      .select({ id: corsairAccounts.id })
      .from(corsairAccounts)
      .where(eq(corsairAccounts.tenantId, userId));

    if (!existing) {
      const integrationIds = await ctx.db
        .select({ id: corsairIntegrations.id })
        .from(corsairIntegrations);

      for (const ele of integrationIds) {
        await ctx.db.insert(corsairAccounts).values({
          tenantId: userId,
          integrationId: ele.id,
        });
      }
    }
  }),

  listEvents: protectedProcedure
    .input(z.object({ timeMin: z.string(), timeMax: z.string() }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.tenant.googlecalendar.api.events.getMany({
        calendarId: "primary",
        timeMin: input.timeMin,
        timeMax: input.timeMax,
        singleEvents: true,
        orderBy: "startTime",
      });
      return (res.items ?? []).map((e: { id?: string; summary?: string; start?: { dateTime?: string; date?: string }; end?: { dateTime?: string; date?: string }; description?: string }) => ({
        id: e.id,
        title: e.summary ?? "(no title)",
        start: e.start?.dateTime ?? e.start?.date,
        end: e.end?.dateTime ?? e.end?.date,
        allDay: !!e.start?.date,
        description: e.description,
      }));
    }),

  createEvent: protectedProcedure
    .input(z.object({
      summary: z.string(),
      start: z.object({ dateTime: z.string(), timeZone: z.string().optional() }),
      end: z.object({ dateTime: z.string(), timeZone: z.string().optional() }),
      description: z.string().optional(),
      attendees: z.array(z.string().email()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.tenant.googlecalendar.api.events.create({
        calendarId: "primary",
        event: {
          summary: input.summary,
          description: input.description,
          start: input.start,
          end: input.end,
          attendees: input.attendees?.map((email) => ({ email })),
        },
      });
      return res;
    }),

  checkAvailability: protectedProcedure
    .input(z.object({
      timeMin: z.string(),
      timeMax: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.tenant.googlecalendar.api.calendar.getAvailability({
        timeMin: input.timeMin,
        timeMax: input.timeMax,
        items: [{ id: "primary" }],
      });
      console.log("res", res)
      const busy = res.calendars?.primary?.busy ?? [];
      return { hasConflict: busy.length > 0, busySlots: busy };
    }),

  updateEvent: protectedProcedure
    .input(z.object({
      id: z.string(),
      summary: z.string().optional(),
      start: z.object({ dateTime: z.string(), timeZone: z.string().optional() }).optional(),
      end: z.object({ dateTime: z.string(), timeZone: z.string().optional() }).optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const event: { summary?: string; start?: { dateTime: string; timeZone?: string }; end?: { dateTime: string; timeZone?: string }; description?: string } = {};
      if (input.summary !== undefined) event.summary = input.summary;
      if (input.start !== undefined) event.start = input.start;
      if (input.end !== undefined) event.end = input.end;
      if (input.description !== undefined) event.description = input.description;

      const res = await ctx.tenant.googlecalendar.api.events.update({
        id: input.id,
        calendarId: "primary",
        event,
      });
      return res;
    }),

  deleteEvent: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.tenant.googlecalendar.api.events.delete({
        id: input.id,
        calendarId: "primary",
      });
      return { success: true };
    }),

  sendMessage: protectedProcedure
    .input(z.object({
      to: z.string().email(),
      subject: z.string().min(1),
      body: z.string().optional(),
      threadId: z.string().optional(),
      inviteTitle: z.string().optional(),
      inviteStart: z.string().optional(),
      inviteEnd: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const raw = buildRawEmail(input.to, input.subject, input.body ?? "", {
        title: input.inviteTitle,
        start: input.inviteStart,
        end: input.inviteEnd,
      });
      const encoded = Buffer.from(await raw).toString("base64url");
      const sent = await ctx.tenant.gmail.api.messages.send({
        raw: encoded,
        threadId: input.threadId,
      });
      if (sent.id) {
        if (input.inviteTitle) {
          sentInvites.set(sent.id, {
            title: input.inviteTitle,
            start: input.inviteStart ?? "",
            end: input.inviteEnd ?? "",
          });
        }
      }
      return { success: true };
    }),

  saveDraft: protectedProcedure
    .input(z.object({
      to: z.string().email(),
      subject: z.string().min(1),
      body: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const raw = buildRawEmail(input.to, input.subject, input.body ?? "");
      const encoded = Buffer.from(await raw).toString("base64url");
      console.log(ctx.tenant)
      await ctx.tenant.gmail.api.drafts.create({ draft: { message: { raw: encoded } } });
      return { success: true };
    }),

  deleteMessage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.tenant.gmail.api.messages.delete({ id: input.id });
      return { success: true };
    }),

  saveLog: protectedProcedure
    .input(z.object({
      id: z.string().optional(),
      label: z.string(),
      detail: z.string().default(""),
      status: z.string().default("INFO"),
      operation: z.string().default("system"),
      time: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(chatLogs).values({
        userId: ctx.session.user.id,
        label: input.label,
        detail: input.detail,
        status: input.status,
        operation: input.operation,
        time: input.time,
        ...(input.id ? { id: input.id } : {}),
      });
      return { success: true };
    }),

  updateLog: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.string().optional(),
      detail: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const updates: Record<string, string> = {};
      if (input.status !== undefined) updates.status = input.status;
      if (input.detail !== undefined) updates.detail = input.detail;
      await ctx.db.update(chatLogs).set(updates).where(eq(chatLogs.id, input.id));
      return { success: true };
    }),

  getRecentLogs: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const logs = await ctx.db
        .select()
        .from(chatLogs)
        .where(eq(chatLogs.userId, ctx.session.user.id))
        .orderBy(chatLogs.createdAt)
        .limit(input.limit);
      return logs;
    }),

  chat: {
    processMessage: protectedProcedure
      .input(
        z.object({
          message: z.string(),
          reviewMode: z.boolean().default(false),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const tenantCorsair = ctx.tenant;
        const agentTools = await buildAgentTools(tenantCorsair);
        const system = input.reviewMode ? SYSTEM_PROMPT_REVIEW : SYSTEM_PROMPT;
        let conversation = buildConversation(system, [
          { role: "user", content: input.message },
        ]);

        for (let step = 0; step < 15; step++) {
          const result = await runStep(conversation, agentTools);

          if (result.type === "text") {
            return { type: "text" as const, content: result.content };
          }

          if (input.reviewMode) {
            return {
              type: "tool_call" as const,
              toolCall: { name: result.name, args: result.args },
              conversation,
            };
          }

          const toolResult = await executeToolCall(
            agentTools,
            result.name,
            result.args,
          );
          conversation = appendToolResult(
            conversation,
            result.name,
            result.args,
            toolResult,
          );
        }

        return {
          type: "text" as const,
          content: "Reached maximum iterations.",
        };
      }),

    executeAction: protectedProcedure
      .input(
        z.object({
          toolName: z.string(),
          toolArgs: z.unknown(),
          conversation: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const tenantCorsair = ctx.tenant;
        const agentTools = await buildAgentTools(tenantCorsair);

        const toolResult = await executeToolCall(
          agentTools,
          input.toolName,
          input.toolArgs,
        );
        let conversation = appendToolResult(
          input.conversation,
          input.toolName,
          input.toolArgs,
          toolResult,
        );

        for (let step = 0; step < 15; step++) {
          const result = await runStep(conversation, agentTools);

          if (result.type === "text") {
            return { type: "text" as const, content: result.content };
          }

          const nextResult = await executeToolCall(
            agentTools,
            result.name,
            result.args,
          );
          conversation = appendToolResult(
            conversation,
            result.name,
            result.args,
            nextResult,
          );
        }

        return {
          type: "text" as const,
          content: "Reached maximum iterations.",
        };
      }),
  },

});

async function buildRawEmail(
  to: string,
  subject: string,
  body: string,
  invite?: { title?: string; start?: string; end?: string },
): Promise<string> {
  if (invite?.title && invite?.start && invite?.end) {
    const boundary = "boundary_abc123";
    const uid = `${Date.now()}-triage`;
    const fmt = (d: string) =>
      new Date(d).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Triage//EN",
      "METHOD:REQUEST",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTART:${fmt(invite.start)}`,
      `DTEND:${fmt(invite.end)}`,
      `SUMMARY:${invite.title}`,
      `DESCRIPTION:${body.replace(/\n/g, "\\n")}`,
      `ORGANIZER;CN=me:mailto:me`,
      `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${to}`,
      "SEQUENCE:0",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const html = await render(
      React.createElement(InviteEmail, {
        title: invite.title,
        start: invite.start,
        end: invite.end,
        body,
        to,
      }),
    );

    const plainText = `${invite.title}\n${new Date(invite.start).toLocaleString()} – ${new Date(invite.end).toLocaleString()}\n\n${body}`;

    return [
      `From: me`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/plain; charset="UTF-8"`,
      ``,
      plainText,
      `--${boundary}`,
      `Content-Type: text/html; charset="UTF-8"`,
      `Content-Transfer-Encoding: base64`,
      ``,
      Buffer.from(html).toString("base64"),
      `--${boundary}`,
      `Content-Type: text/calendar; charset="UTF-8"; method=REQUEST`,
      ``,
      ics,
      `--${boundary}--`,
    ].join("\r\n");
  }

  return [
    `From: me`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    body,
  ].join("\r\n");
}

async function parseMessage(m: { id: string; threadId: string; snippet: string; labelIds: string[]; payload?: { headers?: Array<{ name: string; value: string }>; mimeType?: string; body?: { data?: string }; filename?: string; parts?: MessagePart[] } }) {
  const headers = m.payload?.headers ?? [];
  const getHeader = (name: string) => headers.find((h) => h.name === name)?.value ?? "";

  const bodyHtml = sanitizeHtml(extractPart(m.payload, "text/html") ?? "");
  const bodyText = extractPart(m.payload, "text/plain");

  let inviteTitle: string | undefined;
  let inviteStart: string | undefined;
  let inviteEnd: string | undefined;

  const stored = sentInvites.get(m.id);
  if (stored) {
    inviteTitle = stored.title;
    inviteStart = stored.start;
    inviteEnd = stored.end;
  }

  if (!inviteTitle) {
    const icalData = extractPart(m.payload, "text/calendar") ?? extractPart(m.payload, "application/ics") ?? extractPart(m.payload, "", ".ics");
    const toIso = (raw: string) => {
      const s = raw.endsWith("Z") ? raw.slice(0, -1) : raw;
      if (s.length === 8) {
        return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T00:00:00`;
      }
      return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(9, 11)}:${s.slice(11, 13)}:${s.slice(13, 15)}`;
    };
    if (icalData) {
      const summaryMatch = /^SUMMARY(?:(?!:).)*:(.+)$/m.exec(icalData);
      inviteTitle = summaryMatch?.[1]?.trim();
      const startMatch = /^DTSTART(?:;.*)?:(.+)$/m.exec(icalData);
      const endMatch = /^DTEND(?:;.*)?:(.+)$/m.exec(icalData);
      if (startMatch) inviteStart = toIso(startMatch[1]!.trim());
      if (endMatch) inviteEnd = toIso(endMatch[1]!.trim());
    }
  }

  if (!inviteTitle && /calendar|invite|invitation/i.exec(bodyHtml)) {
    inviteTitle = /<h2[^>]*>([^<]+)/i.exec(bodyHtml)?.[1]?.trim()
      ?? /<span[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)/i.exec(bodyHtml)?.[1]?.trim()
      ?? "(Calendar)";
  }

  const subject = getHeader("Subject");
  const from = getHeader("From");
  const to = getHeader("To");
  const date = getHeader("Date");

  return {
    id: m.id,
    threadId: m.threadId,
    snippet: m.snippet,
    subject,
    from,
    to,
    date,
    bodyHtml: bodyHtml ?? "",
    bodyText: bodyText ?? "",
    labelIds: m.labelIds ?? [],
    inviteTitle,
    inviteStart,
    inviteEnd,
  };
}

function extractHeader(
  msg: { payload?: { headers?: Array<{ name?: string; value?: string }> } },
  name: string,
): string | undefined {
  return msg.payload?.headers?.find((h) => h.name === name)?.value;
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<link[^>]*>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
}

function decodeBase64(data: string): string {
  if (!data) return "";
  try {
    return Buffer.from(data, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

function extractPart(
  part: { mimeType?: string; body?: { data?: string }; parts?: MessagePart[]; filename?: string } | undefined,
  targetMime: string,
  targetFilename?: string,
): string | null {
  if (!part) return null;
  if ((!targetMime || part.mimeType === targetMime) && part.body?.data) {
    if (!targetFilename || part.filename?.endsWith(targetFilename)) {
      return decodeBase64(part.body.data);
    }
  }
  if (part.parts) {
    for (const sub of part.parts) {
      const result = extractPart(sub, targetMime, targetFilename);
      if (result) return result;
    }
  }
  return null;
}
