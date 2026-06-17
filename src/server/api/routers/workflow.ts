import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { workflows, workflowNodes } from "~/server/db/schema";

const nodeConfigSchema = z.object({}).passthrough();

export const workflowRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(workflows)
      .where(eq(workflows.userId, ctx.session.user.id))
      .orderBy(workflows.createdAt);
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [wf] = await ctx.db
        .select()
        .from(workflows)
        .where(eq(workflows.id, input.id));
      if (!wf) throw new TRPCError({ code: "NOT_FOUND" });
      const nodes = await ctx.db
        .select()
        .from(workflowNodes)
        .where(eq(workflowNodes.workflowId, input.id))
        .orderBy(workflowNodes.createdAt);
      return { ...wf, nodes };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [wf] = await ctx.db
        .insert(workflows)
        .values({ name: input.name, userId: ctx.session.user.id })
        .returning();
      return wf;
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1).optional() }))
    .mutation(async ({ ctx, input }) => {
      const [wf] = await ctx.db
        .update(workflows)
        .set({ name: input.name })
        .where(eq(workflows.id, input.id))
        .returning();
      return wf;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(workflows).where(eq(workflows.id, input.id));
      return { success: true };
    }),

  saveNodes: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      nodes: z.array(z.object({
        id: z.string(),
        type: z.string(),
        label: z.string(),
        positionX: z.number(),
        positionY: z.number(),
        config: nodeConfigSchema,
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(workflowNodes).where(eq(workflowNodes.workflowId, input.workflowId));
      if (input.nodes.length > 0) {
        await ctx.db.insert(workflowNodes).values(
          input.nodes.map((n) => ({
            ...n,
            workflowId: input.workflowId,
          }))
        );
      }
      return { success: true };
    }),

  execute: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const nodes = await ctx.db
        .select()
        .from(workflowNodes)
        .where(eq(workflowNodes.workflowId, input.workflowId))
        .orderBy(workflowNodes.createdAt);

      return await executeNodes(ctx, nodes as { id: string; type: string; config: Record<string, unknown> }[]);
    }),

  executeOnce: protectedProcedure
    .input(z.object({
      nodes: z.array(z.object({
        id: z.string(),
        type: z.string(),
        config: nodeConfigSchema,
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      return await executeNodes(ctx, input.nodes);
    }),
});

async function executeNodes(
  ctx: { tenant: unknown },
  nodes: { id: string; type: string; config: Record<string, unknown> }[],
): Promise<{ success: boolean; error?: string; nodeResults: { nodeId: string; status: string }[] }> {
  if (nodes.length === 0) {
    return { success: false, error: "No nodes", nodeResults: [] };
  }

  const t = ctx.tenant as {
    gmail: {
      api: {
        messages: {
          send: (params: { raw: string; threadId?: string }) => Promise<unknown>;
          list: (params: { maxResults: number; q: string }) => Promise<{ messages?: { id?: string }[] }>;
          get: (params: { id: string; format: string }) => Promise<{ payload?: { headers?: { name: string; value: string }[] }; threadId?: string }>;
        };
        drafts: { create: (params: { draft: { message: { raw: string } } }) => Promise<unknown> };
      };
    };
  };
  const flowCtx: Record<string, string> = {};
  const visited = new Set<string>();
  const queue = [nodes[0]];
  const nodeResults: { nodeId: string; status: string }[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    if (visited.has(node.id)) continue;
    visited.add(node.id);

    let nodeOk = true;

    switch (node.type) {
      case "variables": {
        const vars = (node.config?.variables as Array<{ key: string; value: string }>) ?? [];
        for (const v of vars) {
          flowCtx[v.key] = v.value;
        }
        break;
      }
      case "template": {
        let body = (node.config?.body as string) ?? "";
        for (const [k, v] of Object.entries(flowCtx)) {
          body = body.replaceAll(`{${k}}`, v);
        }
        flowCtx._template = body;
        break;
      }
      case "email": {
        let to = (node.config?.to as string) ?? "";
        let subject = (node.config?.subject as string) ?? "";
        let body = (node.config?.body as string) ?? flowCtx._template ?? "";
        for (const [k, v] of Object.entries(flowCtx)) {
          to = to.replaceAll(`{${k}}`, v);
          subject = subject.replaceAll(`{${k}}`, v);
          body = body.replaceAll(`{${k}}`, v);
        }
        if (!to) {
          nodeResults.push({ nodeId: node.id, status: "error" });
          nodeOk = false;
          break;
        }
        if (!body) {
          nodeResults.push({ nodeId: node.id, status: "error" });
          nodeOk = false;
          break;
        }
        try {
          const raw = buildSimpleEmail(to, subject, body);
          await t.gmail.api.messages.send({
            raw: Buffer.from(raw).toString("base64url"),
          });
        } catch {
          nodeResults.push({ nodeId: node.id, status: "error" });
          nodeOk = false;
        }
        break;
      }
      case "draft": {
        let to = (node.config?.to as string) ?? "";
        let subject = (node.config?.subject as string) ?? "";
        let body = (node.config?.body as string) ?? flowCtx._template ?? "";
        for (const [k, v] of Object.entries(flowCtx)) {
          to = to.replaceAll(`{${k}}`, v);
          subject = subject.replaceAll(`{${k}}`, v);
          body = body.replaceAll(`{${k}}`, v);
        }
        if (!to) {
          nodeResults.push({ nodeId: node.id, status: "error" });
          nodeOk = false;
          break;
        }
        if (!body) {
          nodeResults.push({ nodeId: node.id, status: "error" });
          nodeOk = false;
          break;
        }
        try {
          const raw = buildSimpleEmail(to, subject, body);
          await t.gmail.api.drafts.create({
            draft: { message: { raw: Buffer.from(raw).toString("base64url") } },
          });
        } catch {
          nodeResults.push({ nodeId: node.id, status: "error" });
          nodeOk = false;
        }
        break;
      }
      case "listener": {
        try {
          const filter = node.config?.filter as string | undefined;
          const res = await t.gmail.api.messages.list({
            maxResults: 1,
            q: filter ? `is:unread ${filter}` : "is:unread",
          });
          const firstMsg = res.messages?.[0];
          if (firstMsg?.id) {
            const full = await t.gmail.api.messages.get({ id: firstMsg.id, format: "full" });
            const headers = full.payload?.headers ?? [];
            const from = headers.find((h: { name: string; value: string }) => h.name === "From")?.value ?? "";
            const subject = headers.find((h: { name: string; value: string }) => h.name === "Subject")?.value ?? "";
            flowCtx._listenedFrom = from;
            flowCtx._listenedSubject = subject;
            flowCtx._listenedId = firstMsg.id;
          }
        } catch {
          nodeResults.push({ nodeId: node.id, status: "error" });
          nodeOk = false;
        }
        break;
      }
      case "reply": {
        const listenedId = flowCtx._listenedId;
        if (!listenedId) {
          nodeResults.push({ nodeId: node.id, status: "error" });
          nodeOk = false;
          break;
        }
        let body = (node.config?.body as string) ?? flowCtx._template ?? "";
        for (const [k, v] of Object.entries(flowCtx)) {
          body = body.replaceAll(`{${k}}`, v);
        }
        try {
          const full = await t.gmail.api.messages.get({ id: listenedId, format: "full" });
          const headers = full.payload?.headers ?? [];
          const subject = headers.find((h: { name: string; value: string }) => h.name === "Subject")?.value ?? "";
          const threadId = full.threadId;
          const raw = [
            `From: me`,
            `To: ${flowCtx._listenedFrom}`,
            `Subject: Re: ${subject}`,
            `In-Reply-To: ${listenedId}`,
            `References: ${listenedId}`,
            `Content-Type: text/plain; charset="UTF-8"`,
            "",
            body,
          ].join("\r\n");
          await t.gmail.api.messages.send({
            raw: Buffer.from(raw).toString("base64url"),
            threadId,
          });
        } catch {
          nodeResults.push({ nodeId: node.id, status: "error" });
          nodeOk = false;
        }
        break;
      }
      default: {
        break;
      }
    }

    if (nodeOk) {
      nodeResults.push({ nodeId: node.id, status: "completed" });
    } else {
      break;
    }

    const next = nodes.find(
      (n) => n.id !== node.id && nodes.indexOf(n) > nodes.indexOf(node)
    );
    if (next) queue.push(next);
  }

  const hasError = nodeResults.some((r) => r.status === "error");
  return { success: !hasError, error: hasError ? "Some nodes failed" : undefined, nodeResults };
}

function buildSimpleEmail(to: string, subject: string, body: string): string {
  return [
    `From: me`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    body,
  ].join("\r\n");
}
