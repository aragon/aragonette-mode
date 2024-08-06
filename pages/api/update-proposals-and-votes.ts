import { type IProposal } from "@/features/proposals";
import proposalRepository from "@/server/models/proposals";
import { buildProposalsResponse } from "@/server/services/builders/proposal-builder";
import Cache from "@/services/cache/VercelCache";
import { logger } from "@/services/logger";
import type { NextApiRequest, NextApiResponse } from "next";

// This function can run for a maximum of 5 min
export const config = {
  maxDuration: 300,
};

export default async function handler(_: NextApiRequest, res: NextApiResponse<any>) {
  // TODO: Enable authentication for cron job
  /*
  const authHeader = req.headers.get('authorization');
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return response.status(401).json({ success: false });
  }
  */

  try {
    const proposals = await buildProposalsResponse();

    const uniqueProposals: IProposal[] = [];
    const duplicatedProposals: IProposal[] = [];

    // Filter duplicated proposals
    for (const proposal of proposals) {
      const existingProposal = uniqueProposals.find((p) => p.id === proposal.id);
      if (existingProposal) {
        duplicatedProposals.push(proposal);
      } else {
        uniqueProposals.push(proposal);
      }
    }

    logger.info(`Upserting ${uniqueProposals.length} proposals...`);
    logger.error(
      `Duplicated proposals: ${duplicatedProposals.length}. Ids: ${duplicatedProposals.map((p) => p.id).join(", ")}`
    );

    await Promise.all(
      uniqueProposals.map(async (proposal) => {
        logger.info(`Upserting proposal ${proposal.id}...`);
        return await proposalRepository.upsertProposal({ ...proposal });
      })
    );

    logger.info(`Upserted ${uniqueProposals.length} proposals successfully`);

    const cache = new Cache();
    const removed = await cache.remove("proposals-*");

    logger.info("Cache cleared successfully. Removed ", removed, " keys");

    await cache.set("proposals-count", uniqueProposals.length);

    logger.info("Proposals count updated to", uniqueProposals.length);

    res.status(200).json({ success: true });
  } catch (error) {
    // TODO: Handle error cases
    if (error instanceof Error) logger.error(error.message);
    else logger.error(JSON.stringify(error));
    res.status(500).json({ error: { message: "Internal server error" } });
  }
}
