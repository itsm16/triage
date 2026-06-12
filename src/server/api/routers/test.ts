import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

// server/api/routers/corsair.ts
export const testRouter = createTRPCRouter({
  test: publicProcedure.query(async () => {
    return { success: true };
  }),
});