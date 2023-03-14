/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Client4 } from "@mattermost/client";
import {
  type AppCallRequestExtended,
  type AppCallResponse,
} from "@mattermost/types/lib/apps";
import { type Post } from "@mattermost/types/lib/posts";
import { type Channel } from "@mattermost/types/lib/channels";
import type { NextApiRequest, NextApiResponse } from "next";

import { env } from "~/env.mjs";

declare module "@mattermost/types/lib/apps" {
  interface AppCallRequestExtended extends AppCallRequest {
    context: {
      bot_user_id: string;
      acting_user: {
        id: string;
      };
    } & AppCallRequest["context"];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const call = req.body as AppCallRequestExtended;

  const botClient = new Client4();
  botClient.setUrl(env.MATTERMOST_URL);
  botClient.setToken(env.MATTERMOST_TOKEN);

  const message = "Hello, world!";

  const users = [
    call.context?.bot_user_id,
    call.context?.acting_user.id,
  ] as string[];

  let channel: Channel;
  try {
    channel = await botClient.createDirectChannel(users);
  } catch (error) {
    let message
    if (error instanceof Error) message = error.message
    else message = String(error)

    res.json({
      type: "error",
      error: `Failed to create/fetch DM channel: ${message}`,
    });
    return;
  }

  const post: Partial<Post> = {
    channel_id: channel.id,
    message,
  };

  try {
    await botClient.createPost(post);
  } catch (error) {
    let message
    if (error instanceof Error) message = error.message
    else message = String(error)

    res.json({
      type: "error",
      error: `Failed to create post in DM channel: ${message}`,
    });
    return;
  }

  const callResponse: AppCallResponse = {
    type: "ok",
    text: message,
  };

  res.json(callResponse);
}
