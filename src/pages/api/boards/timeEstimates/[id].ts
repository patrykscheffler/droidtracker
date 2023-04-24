import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "~/server/db";

import { getUserId } from "~/server/mattermost/user";
import { withCors } from "~/utils/middleware";

async function deleteTimeEstimate(userId: string, id: string, req: NextApiRequest, res: NextApiResponse) {
  // TODO: check if user is allowed to delete this time estimate
  await prisma.timeEstimate.delete({ where: { id: +id } });

  return res.status(200).json({});
}

const bodySchema = z.object({
  userId: z.string().optional(),
  duration: z.number().optional(),
  description: z.string().optional()
});

async function updateTimeEstimate(userId: string, id: string, req: NextApiRequest, res: NextApiResponse) {
  const { duration, description, userId: mattermostUserId } = bodySchema.parse(req.body);

  // TODO: check if user is allowed to update this time estimate
  const timeEstimate = await prisma.timeEstimate.findUnique({ where: { id: +id } });

  if (!timeEstimate) {
    return res.status(400).json({ message: "TimeEstimateDoesNotExist" });
  }

  let timeEstimateUserId = timeEstimate.userId ?? userId;
  if (mattermostUserId) {
    const newUserId = await getUserId(mattermostUserId);
    if (!newUserId) {
      return res.status(400).json({ message: "UserDoesNotExist" });
    }
    timeEstimateUserId = newUserId;
  }

  const updatedTimeEstimate = await prisma.timeEstimate.update({
    where: {
      id: timeEstimate.id
    },
    data: {
      duration,
      description,
      userId: timeEstimateUserId
    }
  });

  return res.status(200).json(updatedTimeEstimate);
}

const querySchema = z.object({
  id: z.string(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = querySchema.parse(req.query);
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

  if (req.method === "DELETE") {
    return deleteTimeEstimate(userId, id, req, res);
  }

  if (req.method === "PATCH") {
    return updateTimeEstimate(userId, id, req, res);
  }

  res.status(400).json({});
}

export default withCors(handler);
