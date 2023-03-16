import { differenceInSeconds, startOfToday, startOfTomorrow } from "date-fns";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

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

    let timeCard = await ctx.prisma.timeCard.findFirst({
      where: {
        userId: user.id,
        end: null,
      },
    });

    if (timeCard) return timeCard;

    timeCard = await ctx.prisma.timeCard.create({
      data: {
        userId: user.id,
        start: new Date(),
        end: null,
      },
    });

    return timeCard;
  }),
  clockOut: protectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx.session;

    let timeCard = await ctx.prisma.timeCard.findFirst({
      where: {
        userId: user.id,
        end: null,
      },
    });

    if (!timeCard) return;

    const end = new Date();
    const duration = differenceInSeconds(end, timeCard.start);

    timeCard = await ctx.prisma.timeCard.update({
      where: { id: timeCard.id },
      data: {
        end,
        duration
      },
    });

    return timeCard;
  }),
});
