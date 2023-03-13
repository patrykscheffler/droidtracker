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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const call = req.body as AppCallRequest;
  // console.log(call);

  // const botClient = new Client4();
  // botClient.setUrl(call.context.mattermost_site_url);
  // botClient.setToken(call.context.bot_access_token);

  // const message = "Hello, world!";

  // const users = [
  //   call.context.bot_user_id,
  //   call.context.acting_user.id,
  // ] as string[];

  // let channel: Channel;
  // try {
  //   channel = await botClient.createDirectChannel(users);
  // } catch (e: any) {
  //   res.json({
  //     type: "error",
  //     error: "Failed to create/fetch DM channel: " + e.message,
  //   });
  //   return;
  // }

  // const post = {
  //   channel_id: channel.id,
  //   message,
  //   props: {
  //     attachments: [
  //       {
  //         fallback: "Attachment",
  //         title: "Attachment",
  //         image_url: "https://example.com/image.png",
  //         author_name: "Bot",
  //       },
  //     ],
  //   },
  // } as Post;

  // try {
  //   await botClient.createPost(post);
  // } catch (e: any) {
  //   res.json({
  //     type: "error",
  //     error: "Failed to create post in DM channel: " + e.message,
  //   });
  //   return;
  // }

  const callResponse: AppCallResponse = {
    type: "ok",
    text: `| Left-Aligned  | Center Aligned  | Right Aligned |
    | :------------ |:---------------:| -----:|
    | Left column 1 | this text       |  $100 |
    | Left column 2 | is              |   $10 |
    | Left column 3 | centered        |    $1 |`,
  };

  res.json(callResponse);
}
