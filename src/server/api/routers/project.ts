import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getMattermostBoards } from "~/server/mattermost/boards";

export const projectRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.prisma.project.findMany({
      orderBy: { name: "asc" },
    });
    return projects;
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
