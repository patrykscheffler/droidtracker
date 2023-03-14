import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { z } from "zod";

import { prisma } from "~/server/db";

export const defaultAvatarSrc = function ({
  email,
  md5,
}: {
  md5?: string;
  email?: string;
}) {
  if (!email && !md5) return "";

  if (email && !md5) {
    md5 = crypto.createHash("md5").update(email).digest("hex");
  }

  return `https://www.gravatar.com/avatar/${md5 ?? ""}?s=160&d=mp&r=PG`;
};

const querySchema = z.object({
  username: z.string(),
});

async function getIdentityData(req: NextApiRequest) {
  const { username } = querySchema.parse(req.query);

  if (username) {
    const user = await prisma.user.findUnique({
      where: { id: username },
      select: { image: true, email: true },
    });
    return {
      name: username,
      email: user?.email,
      image: user?.image,
    };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const identity = await getIdentityData(req);
  const image = identity?.image;

  if (!image) {
    res.writeHead(302, {
      Location: defaultAvatarSrc({
        md5: crypto
          .createHash("md5")
          .update(identity?.email ?? "example@example.com")
          .digest("hex"),
      }),
    });
    return res.end();
  }

  if (!image.includes("data:image")) {
    res.writeHead(302, { Location: image });
    return res.end();
  }

  const decoded = image
    .toString()
    .replace("data:image/png;base64,", "")
    .replace("data:image/jpeg;base64,", "");
  const imageResp = Buffer.from(decoded, "base64");
  res.writeHead(200, {
    "Content-Type": "image/png",
    "Content-Length": imageResp.length,
  });
  res.end(imageResp);
}
