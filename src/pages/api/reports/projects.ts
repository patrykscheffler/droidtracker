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

  const projects = await prisma.project.findMany({
    include: {
      timeLogs: {
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
    },
    where: {
      timeLogs: {
        some: {}
      }
    }
  });

  const projectsData = projects.map((project) => {
    const dayReports: Record<
      string,
      { logs: []; duration: number }
    > = {};

    project.timeLogs.forEach((timeLog) => {
      const date = timeLog.start.toISOString().split("T")[0];
      if (!date) return;

      dayReports[date] = dayReports[date] || {
        logs: [],
        duration: 0,
      };
      const dayReport = dayReports[date];
      if (!dayReport) return;

      dayReport.duration += timeLog.duration || 0;
    });

    return {
      id: project.id,
      name: project.name,
      dayReports,
    };
  });

  const projectsReport = projectsData.map((project) => {
    const duration = Object.values(project.dayReports).reduce(
      (acc, dayReport) => acc + dayReport.duration,
      0
    );

    return {
      name: project.name,
      duration: formatDuration(duration),
    };
  });

  const projectsDayReport = projectsData
    .map((project) =>
      Object.entries(project.dayReports).map(([date, dayReport]) => ({
        date,
        name: project.name,
        duration: formatDuration(dayReport.duration),
      }))
    )
    .flat();

  const archive = archiver("zip");
  archive.append(stringify(projectsReport, { header: true }), { name: "projects.csv" });
  archive.append(stringify(projectsDayReport, { header: true }), { name: "projects-day.csv" });

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", 'attachment; filename="projects-report.zip"');

  archive.pipe(res);

  await archive.finalize();
}

export default handler;
