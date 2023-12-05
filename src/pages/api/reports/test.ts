import type { NextApiRequest, NextApiResponse } from "next";
import { Client4 } from "@mattermost/client";

import { prisma } from "~/server/db";
import { env } from "~/env.mjs";
import { type Card } from "~/server/mattermost/boards";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const botClient = new Client4();

  botClient.setUrl(env.MATTERMOST_URL);
  botClient.setToken(env.MATTERMOST_BOT_TOKEN);

  const options = botClient.getOptions({});
  const boardsRoute = botClient.getBoardsRoute();

  const tasks = await prisma.task.findMany({
    include: {
      timeLogs: true,
    },
    where: {
      timeLogs: {
        some: {},
      },
    },
  });

  for (const task of tasks) {
    if (!task.externalId) continue;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const card: Card = await fetch(
      `${boardsRoute}/cards/${task.externalId}`,
      options
    ).then((res) => res.json());

    if (!card || card.error) {
      // TODO: handle error, maybe delete task?

      await prisma.timeLog.updateMany({
        where: {
          taskId: task.id,
        },
        data: {
          billable: false,
        },
      });

      continue;
    }

    if (task.name === card.title) continue;

    await prisma.task.update({
      where: {
        id: task.id,
      },
      data: {
        name: card.title,
      },
    });
  }

  res.status(200).json({});
}

export default handler;
