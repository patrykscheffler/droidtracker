import type { NextApiRequest, NextApiResponse } from "next";
import { type Channel } from "@mattermost/types/lib/channels";
import { Client4 } from "@mattermost/client";

import { env } from "~/env.mjs";
import { getUsersToClockIn, getUsersToClockOut } from "~/server/timecard/clock";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Check apiKey
  // const apiKey = req.headers.authorization || req.query.apiKey;

  if (req.method !== "GET") {
    res.status(405).json({ message: "Invalid method" });
    return;
  }

  const botClient = new Client4();
  botClient.setUrl(env.MATTERMOST_URL);
  botClient.setToken(env.MATTERMOST_BOT_TOKEN);

  const usersToClockIn = await getUsersToClockIn();
  for (const user of usersToClockIn) {
    const mattermostUser = user.accounts.find((account) => account.provider === "mattermost");
    if (!mattermostUser) continue;

    const message = `Hey! Don't forget to clock in!`;
    const users = [
      env.MATTERMOST_BOT_ID,
      mattermostUser.providerAccountId,
    ];

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const channel: Channel = await botClient.createDirectChannel(users);
      await botClient.createPost({
        channel_id: channel.id,
        message,
        props: {
          attachments: [
            {
              // text: message,
              actions: [
                {
                  integration: {
                    url: `${env.NEXT_PUBLIC_WEBAPP_URL}/api/mattermost/clockAction`,
                    context: {
                      type: "in"
                    }
                  },
                  name: "Clock In",
                }
              ]
            }
          ]
        }
      })
    } catch (error) {
      console.error(error);
    }
  }

  const usersToClockOut = await getUsersToClockOut();
  for (const user of usersToClockOut) {
    const mattermostUser = user.accounts.find((account) => account.provider === "mattermost");
    if (!mattermostUser) continue;

    const message = `Hey! Don't forget to clock out!`;
    const users = [
      env.MATTERMOST_BOT_ID,
      mattermostUser.providerAccountId,
    ];

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const channel: Channel = await botClient.createDirectChannel(users);
      await botClient.createPost({
        channel_id: channel.id,
        message,
        props: {
          attachments: [
            {
              // text: message,
              actions: [
                {
                  integration: {
                    url: `${env.NEXT_PUBLIC_WEBAPP_URL}/api/mattermost/clockAction`,
                    context: {
                      type: "out"
                    }
                  },
                  name: "Clock Out",
                }
              ]
            }
          ]
        }
      })
    } catch (error) {
      console.error(error);
    }
  }

  res.json({ status: "ok" });
}