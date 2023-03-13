import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  // eslint-disable-next-line @typescript-eslint/require-await
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session.user;
  }),
});
