import { add, differenceInSeconds } from "date-fns";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const timeLogRouter = createTRPCRouter({
  get: protectedProcedure.input(z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  })).query(async ({ input, ctx }) => {
    const timeLogs = await ctx.prisma.timeLog.findMany({
      where: {
        start: {
          gte: input.from,
          lte: input.to,
        },
        end: {
          not: null,
        }
      },
      include: {
        project: true,
        task: true,
      },
      orderBy: { start: "desc" },
    });

    return timeLogs;
  }),
  update: protectedProcedure.input(z.object({
    id: z.number(),
    start: z.date().optional(),
    end: z.date().optional(),
    duration: z.number().optional(),
    description: z.string().optional(),
    billable: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { start, end, duration, description, billable, id } = input;

    const timeLog = await ctx.prisma.timeLog.findUnique({ where: { id } });

    if (!timeLog) {
      throw new Error("TimeLogDoesNotExist");
    }

    let timeLogDuration = duration ?? timeLog.duration;
    let timeLogEnd = end ?? timeLog.end;

    if (start && end) {
      timeLogDuration = differenceInSeconds(end, start);
    } else if (start) {
      timeLogDuration = timeLog.end ? differenceInSeconds(timeLog.end, start) : 0;
    } else if (end) {
      timeLogDuration = differenceInSeconds(end, timeLog.start);
    } else if (duration) {
      timeLogEnd = add(new Date(timeLog.start), { seconds: duration })
    }

    const updatedTimeLog = await ctx.prisma.timeLog.update({
      where: {
        id: timeLog.id
      },
      data: {
        start,
        billable,
        description,
        end: timeLogEnd,
        duration: timeLogDuration,
      }
    });

    return updatedTimeLog;
  }),

  projectTimeLogs: protectedProcedure.input(z.object({
    projectId: z.string(),
    from: z.date().optional(),
    to: z.date().optional(),
  })).query(async ({ input, ctx }) => {
    const timeLogs = await ctx.prisma.timeLog.findMany({
      where: {
        projectId: input.projectId,
        start: {
          gte: input.from,
          lte: input.to,
        },
        end: {
          not: null,
        }
      },
      include: {
        project: true,
        task: true,
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { start: "desc" },
    });

    return timeLogs;
  }),

  projectDuration: protectedProcedure.input(z.object({
    projectId: z.string(),
    from: z.date().optional(),
    to: z.date().optional(),
  })).query(async ({ input, ctx }) => {
    const duration = await ctx.prisma.timeLog.groupBy({
      by: ["projectId", "billable"],
      where: {
        projectId: input.projectId,
        start: {
          gte: input.from,
          lte: input.to,
        },
        end: {
          not: null,
        },
      },
      _sum: {
        duration: true,
      },
    });

    const billableDuration = duration.find((d) => d.billable)?._sum.duration ?? 0;
    const nonbillableDuration = duration.find((d) => !d.billable)?._sum.duration ?? 0;

    return {
      billable: billableDuration,
      nonbillable: nonbillableDuration,
      total: billableDuration + nonbillableDuration,
    };
  }),
});
