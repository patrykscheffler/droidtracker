/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Client4 } from "@mattermost/client";
import { type AppCallRequest } from "@mattermost/types/lib/apps";
import type { NextApiRequest, NextApiResponse } from "next";
import { getUserId } from "~/server/mattermost/user";

interface AppCallRequestExtended extends AppCallRequest {
  state: {
    type: "in" | "out" | "status";
  };
  context: {
    acting_user: {
      id: string;
    };
    mattermost_site_url: string;
    bot_access_token: string;
    bot_user_id: string;
  } & AppCallRequest["context"];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const call = req.body as AppCallRequestExtended;
  const mattermostUserId = call.context?.acting_user?.id;
  const type = call.state?.type;

  if (!type || !mattermostUserId) {
    return res.json({ type: "error" });
  }

  const userId = await getUserId(mattermostUserId);

  if (!userId) {
    return res.json({
      type: "ok",
      text: "You need to login [here](https://timetracker.uniqsoft.pl) first before using this app",
    });
  }

  const botClient = new Client4();
  botClient.setUrl(call.context.mattermost_site_url);
  botClient.setToken(call.context.bot_access_token);

  if (type === "status") {}

  res.json({ type: "ok" });
}
