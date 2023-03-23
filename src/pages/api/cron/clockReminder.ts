import type { NextApiRequest, NextApiResponse } from "next";
import { add, sub } from "date-fns";
import { type Channel } from "@mattermost/types/lib/channels";
import { Client4 } from "@mattermost/client";

import { prisma } from "~/server/db";
import { env } from "~/env.mjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Check apiKey
  const apiKey = req.headers.authorization || req.query.apiKey;

  if (req.method !== "GET") {
    res.status(405).json({ message: "Invalid method" });
    return;
  }

  const weekDay = (new Date().getDay() + 6) % 7;
  // const currentDate = add(new Date(), { hours: 1 });
  const currentDate = new Date(new Date().setUTCHours(7, 50, 0, 0));

  const botClient = new Client4();
  botClient.setUrl(env.MATTERMOST_URL);
  botClient.setToken(env.MATTERMOST_BOT_TOKEN);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      accounts: {
        select: {
          provider: true,
          providerAccountId: true,
        },
        where: {
          provider: "mattermost",
        }
      },
      availabilities: {
        where: {
          weekDay,
        }
      },
    },
    where: {
      availabilities: {
        every: {
          start: {
            lte: currentDate,
            gt: sub(currentDate, { hours: 1 }),
          }
        }
      },
      timeCards: {
        every: {
          NOT: {
            end: null
          }
        }
      }
    }
  });

  for (const user of users) {
    const mattermostUser = user.accounts.find((account) => account.provider === "mattermost");
    if (!mattermostUser) continue;

    const message = `Hey! Don't forget to clock in!`;
    const users = [
      env.MATTERMOST_BOT_ID,
      mattermostUser.providerAccountId,
    ] as string[];

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

  res.json({ status: "ok" });
}