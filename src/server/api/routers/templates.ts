import { z } from "zod";
import { eq } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { templates } from "~/server/db/schema";

export const templateRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(templates)
      .where(eq(templates.userId, ctx.session.user.id))
      .orderBy(templates.createdAt);
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [tmpl] = await ctx.db
        .select()
        .from(templates)
        .where(eq(templates.id, input.id));
      if (!tmpl) throw new Error("Template not found");
      return tmpl;
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      subject: z.string().optional().default(""),
      body: z.string().optional().default(""),
    }))
    .mutation(async ({ ctx, input }) => {
      const [tmpl] = await ctx.db
        .insert(templates)
        .values({
          name: input.name,
          subject: input.subject,
          body: input.body,
          userId: ctx.session.user.id,
        })
        .returning();
      return tmpl;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      subject: z.string().optional(),
      body: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const [tmpl] = await ctx.db
        .update(templates)
        .set(updates)
        .where(eq(templates.id, id))
        .returning();
      return tmpl;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(templates).where(eq(templates.id, input.id));
      return { success: true };
    }),
});
