import { add, differenceInSeconds } from "date-fns";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const timeCardRouter = createTRPCRouter({
  get: protectedProcedure.input(z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  })).query(async ({ input, ctx }) => {
    const timeCards = await ctx.prisma.timeCard.findMany({
      where: {
        userId: ctx.session.user.id,
        start: {
          gte: input.from,
          lte: input.to,
        },
        end: {
          not: null,
        }
      },
      orderBy: { start: "desc" },
    });

    return timeCards;
  }),
  update: protectedProcedure.input(z.object({
    id: z.number(),
    start: z.date().optional(),
    end: z.date().optional(),
    duration: z.number().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { start, end, duration, id } = input;

    const timeCard = await ctx.prisma.timeCard.findUnique({ where: { id } });

    if (!timeCard) {
      throw new Error("TimeCardDoesNotExist");
    }

    let timeCardDuration = duration ?? timeCard.duration;
    let timeCardEnd = end ?? timeCard.end;

    if (start && end) {
      timeCardDuration = differenceInSeconds(end, start);
    } else if (start) {
      timeCardDuration = timeCard.end ? differenceInSeconds(timeCard.end, start) : 0;
    } else if (end) {
      timeCardDuration = differenceInSeconds(end, timeCard.start);
    } else if (duration) {
      timeCardEnd = add(new Date(timeCard.start), { seconds: duration })
    }

    const updatedTimeCard = await ctx.prisma.timeCard.update({
      where: {
        id: timeCard.id
      },
      data: {
        start,
        end: timeCardEnd,
        duration: timeCardDuration,
      }
    });

    return updatedTimeCard;
  }),
});
