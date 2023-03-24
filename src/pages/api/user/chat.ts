import { Client4 } from "@mattermost/client";
import { type UserProfile } from "@mattermost/types/lib/users";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { env } from "~/env.mjs";

import { prisma } from "~/server/db";

const querySchema = z.object({
  username: z.string(),
});

async function getIdentityData(req: NextApiRequest) {
  const { username } = querySchema.parse(req.query);
  if (!username) return null;

  const user = await prisma.user.findUnique({
    where: { id: username },
    select: {
      accounts: {
        select: {
          provider: true,
          providerAccountId: true,
        },
      },
    },
  });

  return user;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const identity = await getIdentityData(req);
  const accountId = identity?.accounts[0]?.providerAccountId;

  if (!accountId) {
    return res.status(404).json({ error: "User not found" });
  }

  const botClient = new Client4();
  botClient.setUrl(env.MATTERMOST_URL);
  botClient.setToken(env.MATTERMOST_BOT_TOKEN);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const user: UserProfile = await botClient.getUser(accountId);

  res.redirect(`${env.MATTERMOST_URL}/uniqsoft/messages/@${user.username}`);
}
