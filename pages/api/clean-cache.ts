import { logger } from "@/services/logger";
import type { NextApiRequest, NextApiResponse } from "next";
import Cache from "@/services/cache/VercelCache";

// TODO: Delete for production
export default async function handler(_: NextApiRequest, res: NextApiResponse<any>) {
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
