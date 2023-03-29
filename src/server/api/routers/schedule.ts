import { getDay } from "date-fns";
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
      await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          availabilities: {
            deleteMany: {},
            createMany: {
              data: input.availability,
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
});
