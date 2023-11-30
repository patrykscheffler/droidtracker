import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "~/server/db";
import { getTask } from "~/server/mattermost/boards";

import { getUserId } from "~/server/mattermost/user";
import { startTask, stopTask } from "~/server/timelog/log";
import { withCors } from "~/utils/middleware";

const getQuerySchema = z.object({
  boardId: z.string(),
  cardId: z.string(),
});

async function getTimeLog(
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { boardId, cardId } = getQuerySchema.parse(req.query);
  // const boardId = "bdsqa87wzotdz7qyjdaexm3oxnh";
  // const cardId = "ckcmfofao67gpbkyyyq8sbwg1kw";

  const task = await getTask(boardId, cardId);

  if (!task) {
    res.status(400).json({ message: "TaskDoesNotExist" });
    return;
  }

  const timeLog = await prisma.timeLog.findFirst({
    where: {
      userId,
      end: null,
      taskId: task.id,
    },
  });

  return res.status(200).json(timeLog);
}

const bodySchema = z.object({
  boardId: z.string(),
  cardId: z.string(),
  action: z.union([z.literal("start"), z.literal("stop")]),
});

async function addTimeLog(
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { action, boardId, cardId } = bodySchema.parse(req.body);
  // const boardId = "bdsqa87wzotdz7qyjdaexm3oxnh";
  // const cardId = "ckcmfofao67gpbkyyyq8sbwg1kw";

  const task = await getTask(boardId, cardId);

  if (!task) {
    res.status(400).json({ message: "TaskDoesNotExist" });
    return;
  }

  if (action === "start") {
    const timeLog = await startTask(task.id, userId);

    return res.status(200).json(timeLog);
  }

  const timeLog = await stopTask(task.id, userId);

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
    return getTimeLog(userId, req, res);
  }

  if (req.method === "POST") {
    return addTimeLog(userId, req, res);
  }

  res.status(400).json({});
}

export default withCors(handler);
