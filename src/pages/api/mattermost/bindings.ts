import { type AppBinding } from "@mattermost/types/lib/apps";
import type { NextApiRequest, NextApiResponse } from "next";

const commandBindings = {
  location: "/command",
  bindings: [
    {
      icon: "logo.png",
      label: "time",
      description: "Available commands: clock, team",
      hint: "[command]",
      bindings: [
        {
          location: "clock",
          description: "Available commands: in, out, status, test",
          hint: "[command]",
          bindings: [
            {
              location: "in",
              description: "Clock in",
              submit: {
                path: "/api/mattermost/clock",
                state: {
                  type: "in"
                },
                expand: {
                  acting_user: "id",
                }
              }
            },
            {
              location: "out",
              description: "Clock out",
              submit: {
                path: "/api/mattermost/clock",
                state: {
                  type: "out"
                },
                expand: {
                  acting_user: "id",
                }
              }
            },
            {
              location: "status",
              description: "Clock status",
              submit: {
                path: "/api/mattermost/clock",
                state: {
                  type: "status"
                },
                expand: {
                  acting_user: "id",
                }
              }
            }
          ]
        },
      ],
    },
  ],
} as AppBinding;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    type: "ok",
    data: [commandBindings],
  });
}
