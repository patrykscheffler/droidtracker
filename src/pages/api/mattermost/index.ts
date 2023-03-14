import type { NextApiRequest, NextApiResponse } from "next";
import { type AppManifest } from "@mattermost/types/lib/apps";

import { env } from "~/env.mjs";

const manifest = {
  app_id: "time-tracker",
  display_name: env.NEXT_PUBLIC_APP_NAME,
  homepage_url: env.NEXT_PUBLIC_WEBAPP_URL,
  icon: "logo.png",
  bindings: {
    path: "/api/mattermost/bindings",
  },
  requested_permissions: ["act_as_bot"],
  requested_locations: ["/channel_header", "/command"],
  http: {
    root_url: env.NEXT_PUBLIC_WEBAPP_URL,
  },
} as AppManifest;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(manifest);
}
