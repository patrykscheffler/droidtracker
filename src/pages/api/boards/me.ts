import type { NextApiRequest, NextApiResponse } from "next";
import { startOfToday, startOfTomorrow } from "date-fns";

import { getUserId } from "~/server/mattermost/user";
import { withCors } from "~/utils/middleware";
import { prisma } from "~/server/db";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
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

  const user = await prisma.user.findUnique({
    select: { role: true },
    where: { id: userId },
  });

  const timeCardRunning = await prisma.timeCard.findFirst({
    where: {
      userId,
      end: null,
    },
  });

  const { _sum: { duration: clockedTodayDuration } } = await prisma.timeCard.aggregate({
    _sum: {
      duration: true
    },
    where: {
      userId,
      start: {
        gte: startOfToday(),
        lt:  startOfTomorrow(),
      }
    }
  });

  res.status(200).json({
    id: userId,
    role: user?.role,
    clockedIn: !!timeCardRunning,
    clockedInAt: timeCardRunning?.start,
    clockedTodayDuration,
  });
}

export default withCors(handler);