import proposalRepository from "@/server/models/proposals";
import Cache from "@/services/cache/VercelCache";
import { logger } from "@/services/logger";
import { type IError } from "@/utils/types";
import { waitUntil } from "@vercel/functions";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_: NextApiRequest, res: NextApiResponse<number | IError>) {
  try {
    const cacheKey = "proposals-count";
    const cache = new Cache();

    const cachedProposalsCount: any = await cache.get(cacheKey);

    if (cachedProposalsCount) {
      return res.status(200).json(cachedProposalsCount);
    }

    const proposals = await proposalRepository.countProposals();

    waitUntil(cache.set(cacheKey, proposals, 60 * 60)); // 1 hour

    res.status(200).json(proposals);
  } catch (error) {
    // TODO: Add error handling
    logger.error("Error fetching proposals:", error);
    res.status(500).json({ error: { message: "Error fetching proposals count" } });
  }
}
