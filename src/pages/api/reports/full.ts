import type { NextApiRequest, NextApiResponse } from "next";
import { stringify } from "csv-stringify";
import { z } from "zod";

import { formatDuration } from "~/lib/utils";
import { prisma } from "~/server/db";

const getQuerySchema = z.object({
  start: z.string(),
  end: z.string(),
});

interface GroupedTimeLog {
  task: string;
  project: string;
  user: string;
  duration: number;
  description: string[];
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { start, end } = getQuerySchema.parse(req.query);

  const timeLogs = await prisma.timeLog.findMany({
    include: {
      project: true,
      user: true,
      task: true,
    },
    where: {
      start: {
        gte: new Date(start),
        lte: new Date(end),
      },
      billable: true,
    },
    orderBy: [
      {
        projectId: "asc",
      },
      {
        start: "asc",
      },
      {
        userId: "asc",
      },
    ],
  });

  // const report = timeLogs.map((timeLog) => {
  //   const date = timeLog.start.toISOString().split("T")[0];

  //   return {
  //     project: timeLog.project?.name || "",
  //     date,
  //     user: timeLog.user?.name || "",
  //     task: timeLog.task?.name || "",
  //     description: timeLog.description || "",
  //     duration: formatDuration(timeLog.duration || 0),
  //   };
  // });

  // const result = await prisma.$queryRaw`
  //   SELECT
  //     t.name as task_name,
  //     p.name as project_name,
  //     u.name as user_name,
  //     SUM(tl.duration) as total_duration,
  //     string_agg(COALESCE(tl.description, ''), ', ') AS concatenated_description
  //   FROM
  //     "TimeLog" tl

  //   LEFT JOIN
  //     "Task" t ON t.id = tl."taskId"
  //   LEFT JOIN
  //     "Project" p ON p.id = tl."projectId"
  //   LEFT JOIN
  //     "User" u ON u.id = tl."userId"
  //   WHERE
  //     tl.start BETWEEN '2023-04-01' AND '2023-04-30'
  //   GROUP BY
  //     p.name, t.name, u.name
  //   ORDER BY
  //     p.name, t.name, u.name;
  // `;

  // // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  // const report = result.map((row) => ({
  //   project: row.project_name,
  //   task: row.task_name,
  //   user: row.user_name,
  //   duration: formatDuration(parseInt(row.total_duration)),
  //   description: row.concatenated_description,
  // }));

  // const timeLogs = await prisma.timeLog.groupBy({
  //   by: ['taskId', 'projectId', 'userId'],
  //   _sum: {
  //     duration: true,
  //   },
  // });

  // Group time logs by task name, project name, and user name
  const groupedTimeLogs: Record<string, GroupedTimeLog> = timeLogs.reduce(
    (acc: Record<string, GroupedTimeLog>, timeLog) => {
      const { task, project, user, duration, description } = timeLog;
      const key = `${task?.name || ""}_${project?.name || ""}_${
        user?.name || ""
      }`;

      acc[key] = acc[key] ?? {
        project: project?.name || "",
        task: task?.name || "",
        user: user?.name || "",
        duration: duration || 0,
        description: description ? [description] : [],
      };

      if (duration) acc[key]!.duration += duration;
      if (description) acc[key]!.description.push(description);

      return acc;
    },
    {}
  );

  // Calculate duration for each time log
  const report = Object.values(groupedTimeLogs).map(
    (groupedTimeLog) => ({
      ...groupedTimeLog,
      duration: formatDuration(groupedTimeLog.duration),
      description: groupedTimeLog.description.join(", "),
    })
  );

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="report.csv"');

  const readable = stringify(report, { header: true });
  readable.pipe(res);
}

export default handler;
