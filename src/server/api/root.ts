import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { corsair } from "../corsair";
import { corsairRouter } from "./routers/corsair";
import { testRouter } from "./routers/test";
import { workflowRouter } from "./routers/workflow";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  corsair: corsairRouter,
  test: testRouter,
  workflow: workflowRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
