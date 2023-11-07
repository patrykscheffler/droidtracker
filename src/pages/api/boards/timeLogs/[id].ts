import { add } from "date-fns";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "~/server/db";

import { getUserId } from "~/server/mattermost/user";
import { withCors } from "~/utils/middleware";

async function deleteTimeLog(userId: string, id: string, req: NextApiRequest, res: NextApiResponse) {
  // TODO: check if user is allowed to delete this time log
  await prisma.timeLog.delete({ where: { id: +id } });

  return res.status(200).json({});
}

const bodySchema = z.object({
  userId: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  duration: z.number().optional(),
  description: z.string().optional(),
  billable: z.boolean().optional(),
});

async function updateTimeLog(userId: string, id: string, req: NextApiRequest, res: NextApiResponse) {
  const { start, end, duration, description, billable, userId: mattermostUserId } = bodySchema.parse(req.body);

  // TODO: check if user is allowed to update this time log
  const timeLog = await prisma.timeLog.findUnique({ where: { id: +id } });

  if (!timeLog) {
    return res.status(400).json({ message: "TimeLogDoesNotExist" });
  }

  let timeLogUserId = timeLog.userId ?? userId;
  if (mattermostUserId) {
    const newUserId = await getUserId(mattermostUserId);
    if (!newUserId) {
      return res.status(400).json({ message: "UserDoesNotExist" });
    }
    timeLogUserId = newUserId;
  }

  let timeLogEnd = end ?? timeLog.end;
  if (start) {
    timeLogEnd = add(new Date(start), { seconds: timeLog.duration ?? 0 })
  } else if (duration) {
    timeLogEnd = add(new Date(timeLog.start), { seconds: duration })
  }

  const updatedTimeLog = await prisma.timeLog.update({
    where: {
      id: timeLog.id
    },
    data: {
      start,
      duration,
      billable,
      description,
      end: timeLogEnd,
      userId: timeLogUserId
    }
  });

  return updatedTimeLog;
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
    return deleteTimeLog(userId, id, req, res);
  }

  if (req.method === "PATCH") {
    const idsArray = id.split(",");
    for (const id of idsArray) {
      await updateTimeLog(userId, id, req, res);
    }

    return res.status(204).json({});
  }

  res.status(400).json({});
}

export default withCors(handler);
