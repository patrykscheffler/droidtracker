import {
  type NextApiHandler,
  type NextApiRequest,
  type NextApiResponse,
} from "next";
import Cors from "cors";

const corsMiddleware = Cors({
  methods: ["GET", "OPTIONS", "HEAD", "DELETE", "PATCH", "POST"],
});

const runMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  // eslint-disable-next-line @typescript-eslint/ban-types
  fn: Function
) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
};

export const withCors =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    await runMiddleware(req, res, corsMiddleware);

    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    return handler(req, res);
  };
