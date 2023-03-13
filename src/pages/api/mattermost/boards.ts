import { Client4 } from "@mattermost/client";
import {
  AppBinding,
  AppCallRequest,
  AppCallResponse,
  AppForm,
  AppManifest,
} from "@mattermost/types/lib/apps";
import { Post } from "@mattermost/types/lib/posts";
import { Channel } from "@mattermost/types/lib/channels";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const botClient = new Client4();

  botClient.setUrl("https://kamino.uniqsoft.pl");

  const teamId = "kfeo6o8atbrmifyq9up91tm7rh";

  const options = botClient.getOptions({});
  const boardsRoute = botClient.getBoardsRoute()
  const response = await fetch(`${boardsRoute}/teams/${teamId}/boards`, options);
  // const response = await fetch(`https://kamino.uniqsoft.pl/api/v4/teams/${teamId}/boards`, options);
  // const response = await fetch(`${boardsRoute}/boards/bdyeek9ddmt8w8mpk8bsrc7faya/members`, options);

  // const boards = await response.json();
  const cookie = botClient.getCSRFFromCookie();

  const members = await botClient.getChannelMembers("hd85b76h3fr35ny5mzk9rmx8ba")

  // const teams = await botClient.getTeams();

  res.status(200).send({
    // boards,
    members
  })
}
