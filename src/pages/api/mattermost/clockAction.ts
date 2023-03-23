/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Client4 } from "@mattermost/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";
import { getUserId } from "~/server/mattermost/user";

import { clockIn, clockOut } from "~/server/timecard/clock";

interface AppCallRequest {
  user_id: string;
  post_id: string;
  channel_id: string;
  context: {
    type: "in" | "out";
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const call = req.body as AppCallRequest;

  const mattermostUserId = call.user_id;
  const type = call.context?.type;

  if (!type || !mattermostUserId) {
    return res.json({ type: "error" });
  }

  const userId = await getUserId(mattermostUserId);

  if (!userId) {
    return res.json({
      type: "ok",
      text: "You need to login [here](https://timetracker.uniqsoft.pl) first before using this app",
    });
  }

  const botClient = new Client4();
  botClient.setUrl(env.MATTERMOST_URL);
  botClient.setToken(env.MATTERMOST_BOT_TOKEN);

  const post = await botClient.getPost(call.post_id);

  if (type === "in") {
    await clockIn(userId);
    await botClient.updatePost({
      ...post,
      props: {
        attachments: [
          {
            actions: [
              {
                disabled: true,
                name: "Clocked In",
              },
            ],
          },
        ],
      },
    });
  }

  if (type === "out") {
    await clockOut(userId);
    await botClient.updatePost({
      ...post,
      props: {
        attachments: [
          {
            actions: [
              {
                disabled: true,
                name: "Clocked Out",
              },
            ],
          },
        ],
      },
    });
  }

  res.json({ type: "ok" });
}
