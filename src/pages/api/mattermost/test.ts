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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const botClient = new Client4();
  botClient.setUrl(env.MATTERMOST_URL);
  botClient.setToken(env.MATTERMOST_TOKEN);

  console.log(req.body);

  const message = `Hey, check our demo app [TimeTracker](https://timetracker.uniqsoft.pl)`;

  const users = [
    "own74pprmfy39jxbtj3bzedx7y",
    "uof3y74pti848p8u8oe8753mjy",
  ] as string[];

  let channel: Channel;
  try {
    channel = await botClient.createDirectChannel(users);
  } catch (error) {
    let message;
    if (error instanceof Error) message = error.message;
    else message = String(error);

    res.json({
      type: "error",
      error: `Failed to create/fetch DM channel: ${message}`,
    });
    return;
  }

  const post: Partial<Post> = {
    channel_id: channel.id,
    message,
    props: {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "New request"
          }
        },
      ],
      attachments: [{
        actions: [{
          name: "Clock out",
          integration: {
            url: `${env.NEXT_PUBLIC_WEBAPP_URL}/api/mattermost/test`
          }
        }]
      }]
    }
  };

  try {
    if (req.body.post_id) {
      const prevPost = await botClient.getPost(req.body.post_id);
      console.log(prevPost);
      await botClient.updatePost({
        ...prevPost,
        props: {
          attachments: [{
            text: "Clocked out successfully"
          }]
        }
      })
    } else {
      await botClient.createPost(post);
    }
  } catch (error) {
    let message;
    if (error instanceof Error) message = error.message;
    else message = String(error);

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
