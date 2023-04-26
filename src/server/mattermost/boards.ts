/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Client4 } from "@mattermost/client";
import { type Team } from "@mattermost/types/lib/teams";

import { env } from "~/env.mjs";
import { prisma } from "../db";

export type Board = {
  id: string;
  teamId: string;
  title: string;
  icon: string;
  description: string;
  showDescription: boolean;
  error?: string;
};

export const getMattermostBoards = async (): Promise<Board[]> => {
  const botClient = new Client4();

  botClient.setUrl(env.MATTERMOST_URL);
  botClient.setToken(env.MATTERMOST_BOT_TOKEN);

  const options = botClient.getOptions({});
  const boardsRoute = botClient.getBoardsRoute();

  // Currently only one team exists
  const teams = await botClient.getMyTeams();
  if (!teams || teams.length === 0) return [];
  const team = teams[0] as Team;

  const boards: Board[] | { error: string; errorCode: number } = await fetch(
    `${boardsRoute}/teams/${team.id}/boards`,
    options
  ).then((res) => res.json());

  if (!Array.isArray(boards) && boards.error) return [];

  return boards as Board[];
};

export type Card = {
  id: string;
  boardId: string;
  title: string;
  icon: string;
  error?: string;
};

export const getMattermostCards = async (boardId: string): Promise<Card[]> => {
  const botClient = new Client4();

  botClient.setUrl(env.MATTERMOST_URL);
  botClient.setToken(env.MATTERMOST_BOT_TOKEN);

  const options = botClient.getOptions({});
  const boardsRoute = botClient.getBoardsRoute();

  // TODO: handle pagination
  const cards: Card[] | { error: string; errorCode: number } = await fetch(
    `${boardsRoute}/boards/${boardId}/cards`,
    options
  ).then((res) => res.json());

  if (!Array.isArray(cards) && cards.error) return [];

  return cards as Card[];
};

export const getTask = async (boardId: string, cardId: string) => {
  const botClient = new Client4();

  botClient.setUrl(env.MATTERMOST_URL);
  botClient.setToken(env.MATTERMOST_BOT_TOKEN);

  const options = botClient.getOptions({});
  const boardsRoute = botClient.getBoardsRoute();

  let project = await prisma.project.findUnique({ where: { externalId: boardId } });
  if (!project) {
    const board: Board  = await fetch(`${boardsRoute}/boards/${boardId}`, options)
      .then((res) => res.json());
    if (!board || board.error) return null;

    project = await prisma.project.create({
      data: {
        name: board.title,
        externalId: board.id,
      },
    });
  }

  let task = await prisma.task.findUnique({ where: { externalId: cardId } });
  if (!task) {
    const card: Card = await fetch(`${boardsRoute}/cards/${cardId}`, options)
      .then((res) => res.json());

    if (!card || card.error) return null;

    task = await prisma.task.create({
      data: {
        name: card.title,
        externalId: card.id,
        projectId: project.id,
      },
    });
  }

  return task;
}
