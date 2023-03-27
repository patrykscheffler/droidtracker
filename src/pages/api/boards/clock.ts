import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { getUserId } from "~/server/mattermost/user";
import { withCors } from "~/utils/middleware";
import { clockIn, clockOut } from "~/server/timecard/clock";

const bodySchema = z.object({
  type: z.union([z.literal("in"), z.literal("out")]),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { type } = bodySchema.parse(req.body);
  const userId = await getUserId(token);

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (type === "in") {
    await clockIn(userId);
  } else if (type === "out") {
    await clockOut(userId);
  }

  res.status(200).json({});
}

export default withCors(handler);
