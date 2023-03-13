import type { NextApiRequest, NextApiResponse } from "next";

const commandBindings = {
  location: "/command",
  bindings: [
    {
      icon: "logo.png",
      label: "example",
      hint: "[send]",
      bindings: [
        {
          location: "send",
          label: "send",
          submit: {
            path: "/api/mattermost/send",
            expand: {
              app: "all",
              channel: "summary",
              user: "summary",
              acting_user: "summary",
              post: "summary"
            }
          },
        },
      ],
    },
  ],
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    type: "ok",
    data: [commandBindings],
  });
}
