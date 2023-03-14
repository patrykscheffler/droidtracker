/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "~/server/db";
import {
  getMattermostBoards,
  getMattermostCards,
} from "~/server/mattermost/boards";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const boards = await getMattermostBoards();

  for (const board of boards) {
    const cards = await getMattermostCards(board.id);

    const project = await prisma.project.upsert({
      where: { externalId: board.id },
      update: { name: board.title },
      create: { name: board.title, externalId: board.id },
    });

    for (const card of cards) {
      await prisma.task.upsert({
        where: { externalId: card.id },
        update: { name: card.title },
        create: {
          name: card.title,
          externalId: card.id,
          projectId: project.id,
        },
      });
    }
  }

  res.status(200).send({});
}
