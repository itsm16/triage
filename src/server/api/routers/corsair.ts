import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { corsair } from "~/server/corsair";
import { corsairAccounts, corsairEntities, corsairIntegrations } from "~/server/db/schema";

// server/api/routers/corsair.ts
export const corsairRouter = createTRPCRouter({
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

    const tenant = corsair.withTenant(userId);

    await tenant.gmail.keys.set_access_token(
      googleAccount.accessToken,
    );

    if (googleAccount.refreshToken) {
      await tenant.gmail.keys.set_refresh_token(
        googleAccount.refreshToken,
      );
    }

    if (googleAccount.accessTokenExpiresAt) {
      await tenant.gmail.keys.set_expires_at(
        googleAccount.accessTokenExpiresAt.toISOString(),
      );
    }

    return { success: true };
  }),
  createId: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    if (!userId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User not found",
      });
    }

    const [tenant] = await ctx.db.select({ id: corsairAccounts.id }).from(corsairAccounts).where(eq(corsairAccounts.tenantId, userId));

    if (!tenant) {
      const integrationIds = await ctx.db.select({ id: corsairIntegrations.id }).from(corsairIntegrations);
      console.log(integrationIds);

      integrationIds.forEach(async (ele) => {
        const create = await ctx.db.insert(corsairAccounts)
          .values({
            tenantId: userId,
            integrationId: ele?.id || "",
          })
          .returning({
            id: corsairAccounts.id,
          });
      })
    }

  }),
});