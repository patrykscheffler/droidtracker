import { getDay, startOfDay } from "date-fns";
import { z } from "zod";

import { type TimeRange } from "~/components/settings/Schedule";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const scheduleRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const availabilities = await ctx.prisma.availability.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        weekDay: "asc",
      },
    });

    const data: (TimeRange | null)[] = [];
    availabilities.forEach((availability) => {
      if (availability.weekDay === null) return;

      data[availability.weekDay] = {
        start: availability.start,
        end: availability.end,
        weekDay: availability.weekDay,
      };
    });

    return data;
  }),
  create: protectedProcedure
    .input(
      z.object({
        availability: z.array(
          z.object({
            weekDay: z.number().min(0).max(6).optional(),
            start: z.date(),
            end: z.date(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const datesOverrides = await ctx.prisma.availability.findMany({
        where: {
          userId: ctx.session.user.id,
          weekDay: null,
          date: {
            gte: startOfDay(new Date()),
          },
          NOT: {
            date: null
          }
        },
      });

      await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          availabilities: {
            deleteMany: {},
            createMany: {
              data: [
                ...input.availability,
                ...datesOverrides.map((override) => ({
                  start: override.start,
                  end: override.end,
                  date: override.date,
                })),
              ]
            },
          },
        },
      });
    }),
  getAvailabilityByDate: protectedProcedure.input(z.object({
    date: z.date()
  })).query(async ({ input, ctx }) => {
    const weekDay = (getDay(input.date) + 6) % 7;

    // TODO: Include overriden dates when they will be implemented

    const users = await ctx.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        availabilities: {
          where: {
            weekDay
          }
        }
      },
    });

    return users;
  }),
  getOverrides: protectedProcedure.query(async ({ ctx }) => {
    const overrides = await ctx.prisma.availability.findMany({
      where: {
        userId: ctx.session.user.id,
        weekDay: null,
        date: {
          gte: startOfDay(new Date()),
        },
        NOT: {
          date: null
        }
      },
    });

    return overrides;
  }),
  addOverride: protectedProcedure.input(z.object({
    date: z.date(),
    start: z.date(),
    end: z.date(),
  })).mutation(async ({ input, ctx }) => {
    await ctx.prisma.availability.create({
      data: {
        start: input.start,
        end: input.end,
        date: input.date,
        user: {
          connect: {
            id: ctx.session.user.id,
          },
        },
      },
    });
  }),
  updateOverride: protectedProcedure.input(z.object({
    id: z.number(),
    date: z.date(),
    start: z.date(),
    end: z.date(),
  })).mutation(async ({ input, ctx }) => {
    await ctx.prisma.availability.update({
      where: {
        id: input.id,
      },
      data: {
        date: input.date,
        start: input.start,
        end: input.end,
      },
    });
  }),
  deleteOverride: protectedProcedure.input(z.object({
    id: z.number(),
  })).mutation(async ({ input, ctx }) => {
    await ctx.prisma.availability.delete({
      where: {
        id: input.id,
      },
    });
  }),
});
