import type { NextApiRequest, NextApiResponse } from "next";
import { stringify } from "csv-stringify";
import archiver from "archiver";
import { z } from "zod";

import { formatDuration } from "~/lib/utils";
import { prisma } from "~/server/db";

const getQuerySchema = z.object({
  start: z.string(),
  end: z.string(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { start, end } = getQuerySchema.parse(req.query);

  const users = await prisma.user.findMany({
    include: {
      timeCards: {
        where: {
          start: {
            gte: new Date(start),
            lte: new Date(end),
          },
        },
        orderBy: {
          start: "asc",
        },
      },
      timeLogs: {
        where: {
          start: {
            gte: new Date(start),
            lte: new Date(end),
          },
          billable: true,
        },
        orderBy: {
          start: "asc",
        },
      },
    },
    where: {
      blocked: false,
    },
  });

  const usersData = users.map((user) => {
    const dayReports: Record<
      string,
      { workDuration: number; projectDuration: number }
    > = {};
    const projectReports: Record<string, number> = {};

    user.timeCards.forEach((timeCard) => {
      const date = timeCard.start.toISOString().split("T")[0];
      if (!date) return;

      dayReports[date] = dayReports[date] || {
        workDuration: 0,
        projectDuration: 0,
      };
      const dayReport = dayReports[date];
      if (!dayReport) return;

      dayReport.workDuration += timeCard.duration || 0;
    });

    user.timeLogs.forEach((timeLog) => {
      const date = timeLog.start.toISOString().split("T")[0];
      if (!date) return;

      dayReports[date] = dayReports[date] || {
        workDuration: 0,
        projectDuration: 0,
      };
      const dayReport = dayReports[date];
      if (!dayReport) return;

      dayReport.projectDuration += timeLog.duration || 0;
    });

    user.timeLogs.forEach((timeLog) => {
      if (!timeLog.projectId) return;
      projectReports[timeLog.projectId] =
        (projectReports[timeLog.projectId] || 0) + (timeLog.duration || 0);
    });

    return {
      id: user.id,
      name: user.name,
      dayReports,
      projectReports,
    };
  });

  const usersReport = usersData.map((user) => {
    const durations = Object.values(user.dayReports).reduce(
      (acc, dayReport) => ({
        work: acc.work + dayReport.workDuration,
        project: acc.project + dayReport.projectDuration,
      }),
      { work: 0, project: 0 }
    );

    return {
      name: user.name,
      work: formatDuration(durations.work),
      project: formatDuration(durations.project),
    };
  });

  const usersDayReport = usersData
    .map((user) =>
      Object.entries(user.dayReports).map(([date, dayReport]) => ({
        date,
        name: user.name,
        work: formatDuration(dayReport.workDuration),
        project: formatDuration(dayReport.projectDuration),
      }))
    )
    .flat();

  const projects = await prisma.project.findMany();
  const projectsObj: Record<string, string> = projects.reduce(
    (acc, project) => ({
      ...acc,
      [project.id]: project.name,
    }),
    {}
  );

  const usersProjectReport = usersData
    .map((user) =>
      Object.entries(user.projectReports).map(([projectId, projectReport]) => ({
        name: user.name,
        project: projectsObj[projectId] || "",
        duration: formatDuration(projectReport),
      }))
    )
    .flat();

  const archive = archiver("zip");
  archive.append(stringify(usersReport, { header: true }), {
    name: "users.csv",
  });
  archive.append(stringify(usersDayReport, { header: true }), {
    name: "users-day.csv",
  });
  archive.append(stringify(usersProjectReport, { header: true }), {
    name: "users-project.csv",
  });

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="users-report.zip"'
  );

  archive.pipe(res);

  await archive.finalize();
}

export default handler;
