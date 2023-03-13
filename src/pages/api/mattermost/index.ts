import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

const manifest = {
  app_id: 'node-example',
  display_name: "Hello World",
  description: "Example TypeScript app for Mattermost",
  homepage_url: 'https://github.com/mattermost/mattermost-app-examples/typescript/hello-world',
  icon: 'logo.png',
  bindings: {
    path: '/api/mattermost/bindings'
  },
  requested_permissions: [
      'act_as_bot',
  ],
  requested_locations: [
      '/channel_header',
      '/command',
  ],
  http: {
		root_url: "https://776e-83-0-116-162.eu.ngrok.io"
	}
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json(manifest)
}
