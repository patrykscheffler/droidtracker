/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Client4 } from "@mattermost/client";
import { type Team } from "@mattermost/types/lib/teams";

import { env } from "~/env.mjs";

type Board = {
  id: string;
  teamId: string;
  title: string;
  icon: string;
  description: string;
  showDescription: boolean;
};

export const getMattermostBoards = async (): Promise<Board[]> => {
  const botClient = new Client4();

  botClient.setUrl(env.MATTERMOST_URL);
  botClient.setToken(env.MATTERMOST_TOKEN);

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

type Card = {
  id: string;
  boardId: string;
  title: string;
  icon: string;
};

export const getMattermostCards = async (boardId: string): Promise<Card[]> => {
  const botClient = new Client4();

  botClient.setUrl(env.MATTERMOST_URL);
  botClient.setToken(env.MATTERMOST_TOKEN);

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
