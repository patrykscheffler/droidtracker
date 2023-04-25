import type { NextApiRequest, NextApiResponse } from "next";
import { stringify } from "csv-stringify";
import { z } from "zod";

import { formatDuration } from "~/lib/utils";
import { prisma } from "~/server/db";

const getQuerySchema = z.object({
  start: z.string(),
  end: z.string(),
});

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
      }
    ]
  });
  
  const report = timeLogs.map((timeLog) => {
    const date = timeLog.start.toISOString().split("T")[0];
    
    return {
      project: timeLog.project?.name || "",
      date,
      user: timeLog.user?.name || "",
      task: timeLog.task?.name || "",
      description: timeLog.description || "",
      duration: formatDuration(timeLog.duration || 0),
    };
  });


  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="report.csv"');

  const readable = stringify(report, { header: true });
  readable.pipe(res);
}

export default handler;
