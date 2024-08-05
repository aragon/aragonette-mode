import { logger } from "@/services/logger";
import type { NextApiRequest, NextApiResponse } from "next";
import Cache from "@/services/cache/VercelCache";
import { AUTH_API_TOKEN } from "@/constants";

// TODO: Delete for production
export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const authHeader = req.body.auth;
  if (!AUTH_API_TOKEN || authHeader !== `Bearer ${AUTH_API_TOKEN}`) {
    logger.error(`Unauthorized request to clean cache`);
    return res.status(401).json({ success: false });
  }

  try {
    const cache = new Cache();
    cache.clear();

    res.status(200).json({ success: true });
  } catch (error) {
    // TODO: Handle error cases
    if (error instanceof Error) logger.error(error.message);
    else logger.error(JSON.stringify(error));
    res.status(500).json({ error: { message: "Internal server error" } });
  }
}
