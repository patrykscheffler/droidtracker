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

async function getTimeEstimates(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const { boardId, cardId } = getQuerySchema.parse(req.query);
  // const boardId = "bdsqa87wzotdz7qyjdaexm3oxnh";
  // const cardId = "ckcmfofao67gpbkyyyq8sbwg1kw";

  const task = await getTask(boardId, cardId);

  if (!task) {
    res.status(400).json({ message: "TaskDoesNotExist" });
    return;
  }

  const timeEstimates = await prisma.timeEstimate.findMany({
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
    }
  });

  const timeEstimatesMattermost = timeEstimates.map((timeEstimate) => ({
    ...timeEstimate,
    description: timeEstimate.description || "",
    userId: timeEstimate.user?.accounts[0]?.providerAccountId,
  }));

  return res.status(200).json(timeEstimatesMattermost);
}

const bodySchema = z.object({
  boardId: z.string(),
  cardId: z.string(),
  userId: z.string(),
  duration: z.number().optional(),
});

async function addTimeEstimate(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const { duration, boardId, cardId } = bodySchema.parse(req.body);
  // const boardId = "bdsqa87wzotdz7qyjdaexm3oxnh";
  // const cardId = "ckcmfofao67gpbkyyyq8sbwg1kw";

  const task = await getTask(boardId, cardId);

  if (!task) {
    res.status(400).json({ message: "TaskDoesNotExist" });
    return;
  }

  const timeEstimate = await prisma.timeEstimate.create({
    data: {
      userId,
      duration,
      taskId: task.id
    }
  });

  return res.status(200).json(timeEstimate);
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
    return getTimeEstimates(userId, req, res);
  }

  if (req.method === "POST") {
    return addTimeEstimate(userId, req, res);
  }

  res.status(400).json({});
}

export default withCors(handler);
