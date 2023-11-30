import type { Project } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getMattermostBoards } from "~/server/mattermost/boards";

type ProjectWithDuration = Project & { duration: number };

export const projectRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const projectsWithDurations: ProjectWithDuration[] = await ctx.prisma
      .$queryRaw`
      SELECT
        "Project"."id",
        "Project"."name",
        "Project"."externalId",
        CAST(COALESCE(SUM("TimeLog"."duration"), 0) AS INTEGER) AS "duration"
      FROM
        "Project"
      LEFT JOIN
        "TimeLog" ON "Project"."id" = "TimeLog"."projectId"
        AND "TimeLog"."userId" IN (SELECT "id" FROM "User" WHERE "blocked" = false)
      GROUP BY
        "Project"."id", "Project"."name", "Project"."externalId"
      ORDER BY
        "Project"."name" ASC;
    `;

    return projectsWithDurations;
  }),
  get: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const project = await ctx.prisma.project.findUnique({
      where: { id: input },
    });

    return project;
  }),
  sync: protectedProcedure.mutation(async ({ ctx }) => {
    const boards = await getMattermostBoards();

    for (const board of boards) {
      await ctx.prisma.project.upsert({
        where: { externalId: board.id },
        update: { name: board.title },
        create: { name: board.title, externalId: board.id },
      });
    }
  }),
});
