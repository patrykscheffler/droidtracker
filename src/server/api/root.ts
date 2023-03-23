import { createTRPCRouter } from "~/server/api/trpc";

import { userRouter } from "~/server/api/routers/user";
import { scheduleRouter } from "./routers/schedule";
import { projectRouter } from "./routers/project";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  project: projectRouter,
  schedule: scheduleRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
