import { startOfToday, startOfTomorrow } from "date-fns";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getUserProfileImage } from "~/server/mattermost/image";
import { clockIn, clockOut } from "~/server/timecard/clock";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const timeCardRunning = await ctx.prisma.timeCard.findFirst({
      where: {
        userId: ctx.session.user.id,
        end: null,
      },
    });

    const userAvailability = await ctx.prisma.availability.findFirst({
      where: {
        userId: ctx.session.user.id,
        date: null,
      },
    });

    const {
      _sum: { duration: clockedTodayDuration },
    } = await ctx.prisma.timeCard.aggregate({
      _sum: {
        duration: true,
      },
      where: {
        userId: ctx.session.user.id,
        start: {
          gte: startOfToday(),
          lt: startOfTomorrow(),
        },
      },
    });

    return {
      ...ctx.session.user,
      clockedIn: !!timeCardRunning,
      clockedInAt: timeCardRunning?.start,
      clockedTodayDuration,
      userAvailability: !!userAvailability,
    };
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          name: input.name,
          email: input.email,
        },
      });
    }),
  getUserById: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.userId,
        },
      });

      return user;
    }),
  users: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
        timeCards: {
          take: 1,
          orderBy: {
            start: "desc",
          },
        },
      },
      where: {
        blocked: false,
      },
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
  blockUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = input;

      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const user = await ctx.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          blocked: true,
        },
      });

      return user;
    }),

  refreshPhoto: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = input;

      const user = await ctx.prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          accounts: true,
        },
      });

      const mattermostAccount = user?.accounts.find(
        (account) => account.provider === "mattermost"
      );
      if (!mattermostAccount) {
        throw new Error("Mattermost account not found");
      }

      const image = await getUserProfileImage(
        mattermostAccount.providerAccountId
      );

      await ctx.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          image,
        },
      });
    }),
});
