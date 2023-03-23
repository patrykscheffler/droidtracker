import { Client4 } from "@mattermost/client";

import { env } from "~/env.mjs";

export const getUserProfileImage = async (profileId: string) => {
  const botClient = new Client4();

  botClient.setUrl(env.MATTERMOST_URL);
  botClient.setToken(env.MATTERMOST_BOT_TOKEN);

  const options = botClient.getOptions({});
  const response = await fetch(`${env.MATTERMOST_URL}/api/v4/users/${profileId}/image`, options)

  const buffer = Buffer.from(await response.arrayBuffer());
  const base64 = buffer.toString('base64');

  // TODO: resize, mime check

  return `data:image/png;base64,${base64}`;
}