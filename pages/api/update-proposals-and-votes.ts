import type { NextApiRequest, NextApiResponse } from "next";
import VercelCache from "@/services/cache/VercelCache";
import { buildProposalResponse } from "@/features/proposals/providers/utils/proposal-builder";
import { buildVotesResponse } from "@/features/proposals/providers/utils/votes-builder";
import { printStageParam } from "@/utils/api-utils";
import proposalRepository from "@/features/proposals/repository/proposal";
import { logger } from "@/services/logger";

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

  const cache = new VercelCache();

  try {
    const proposals = await buildProposalResponse();

    for (const proposal of proposals) {
      await proposalRepository.upsertProposal({
        ...proposal,
      });
      for (const stage of proposal.stages) {
        if (!stage.voting) {
          continue;
        }
        if (stage.status === "active") {
          continue;
        }
        const votes = await buildVotesResponse(stage.voting.providerId, stage.type);

        const stageParam = printStageParam(stage.type);

        // TODO: Move to database
        await cache.set(`votes-${proposal.id}-${stageParam}`, votes);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    // TODO: Handle error cases
    if (error instanceof Error) logger.error(error.message);
    else logger.error(JSON.stringify(error));
    res.status(500).json({ error: { message: "Internal server error" } });
  }
}
