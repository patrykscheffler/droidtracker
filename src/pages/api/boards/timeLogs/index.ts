import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "~/server/db";
import { getTask } from "~/server/mattermost/boards";

import { getUserId } from "~/server/mattermost/user";
import { withCors } from "~/utils/middleware";

const getQuerySchema = z.object({
  boardId: z.string(),
  cardId: z.string(),
});

async function getTimeLogs(userId: string, req: NextApiRequest, res: NextApiResponse) {
  // const { boardId, cardId } = getQuerySchema.parse(req.query);
  const boardId = "bdyeek9ddmt8w8mpk8bsrc7faya";
  const cardId = "cq4mgge1kntyzx8hjhg91p1pidr";

  const task = await getTask(boardId, cardId);

  if (!task) {
    res.status(400).json({ message: "TaskDoesNotExist" });
    return;
  }

  const timeLogs = await prisma.timeLog.findMany({
    include: {
      user: {
        select: {
          accounts: {
            select: {
              provider: true,
              providerAccountId: true,
            }
          }
        }
      }
    },
    where: {
      taskId: task.id,
    },
    orderBy: {
      start: "asc",
    },
  });

  const timeLogsMattermost = timeLogs.map((timeLog) => ({
    ...timeLog,
    userId: timeLog.user?.accounts[0]?.providerAccountId,
  }));

  return res.status(200).json(timeLogsMattermost);
}

const bodySchema = z.object({
  boardId: z.string(),
  cardId: z.string(),
  userId: z.string(),
  start: z.string(),
  end: z.string().optional(),
  duration: z.number().optional(),
});

async function addTimeLog(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const { start, end, duration } = bodySchema.parse(req.body);
  const boardId = "bdyeek9ddmt8w8mpk8bsrc7faya";
  const cardId = "cq4mgge1kntyzx8hjhg91p1pidr";

  const task = await getTask(boardId, cardId);

  if (!task) {
    res.status(400).json({ message: "TaskDoesNotExist" });
    return;
  }

  const timeLog = await prisma.timeLog.create({
    data: {
      end,
      start,
      userId,
      duration,
      taskId: task.id,
      projectId: task.projectId,
    }
  });

  return res.status(200).json(timeLog);
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const userId = await getUserId(token);

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (req.method === "GET") {
    return getTimeLogs(userId, req, res);
  }

  if (req.method === "POST") {
    return addTimeLog(userId, req, res);
  }

  res.status(400).json({});
}

export default withCors(handler);
