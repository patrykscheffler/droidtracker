import { startOfToday, startOfTomorrow } from "date-fns";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { clockIn, clockOut } from "~/server/timecard/clock";

export const userRouter = createTRPCRouter({
  // eslint-disable-next-line @typescript-eslint/require-await
  me: protectedProcedure.query(async ({ ctx }) => {
    const timeCardRunning = await ctx.prisma.timeCard.findFirst({
      where: {
        userId: ctx.session.user.id,
        end: null,
      },
    });

    const { _sum: { duration: clockedTodayDuration } } = await ctx.prisma.timeCard.aggregate({
      _sum: {
        duration: true
      },
      where: {
        userId: ctx.session.user.id,
        start: {
          gte: startOfToday(),
          lt:  startOfTomorrow(),
        }
      }
    });

    return {
      ...ctx.session.user,
      clockedIn: !!timeCardRunning,
      clockedInAt: timeCardRunning?.start,
      clockedTodayDuration,
    };
  }),
  updateProfile: protectedProcedure.input(z.object({
    name: z.string().optional(),
    email: z.string().optional()
  })).mutation(async ({ input, ctx }) => {
    return ctx.prisma.user.update({
      where: {
        id: ctx.session.user.id
      },
      data: {
        name: input.name,
        email: input.email,
      }
    })
  }),
  users: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        timeCards: {
          take: 1,
          orderBy: {
            start: "desc"
          }
        }
      }
    });

    return users;
  }),
  clockIn: protectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx.session;

    const timeCard = await clockIn(user.id);

    return timeCard;
  }),
  clockOut: protectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx.session;

    const timeCard = await clockOut(user.id);

    return timeCard;
  }),
});
