import { buildProposalsResponse } from "@/server/services/builders/proposal-builder";
import proposalRepository from "@/server/models/proposals";
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
    // await Promise.all(
    //   proposals.map(async (proposal) => {
    //     logger.info(`Upserting proposal ${proposal.id}...`);
    //     return await proposalRepository.upsertProposal({ ...proposal });
    //   })
    // );
    for (const proposal of proposals) {
      logger.info(`Upserting proposal ${proposal.id}...`);
      await proposalRepository.upsertProposal({ ...proposal });
    }
    // for (const proposal of proposals) {
    //   await proposalRepository.upsertProposal({
    //     ...proposal,
    //   });
    //   for (const stage of proposal.stages) {
    //     if (!stage.voting) {
    //       continue;
    //     }
    //     if (stage.status === StageStatus.ACTIVE) {
    //       continue;
    //     }
    // TODO: Save to database
    // TODO: Get from DB if it exists or update
    // const votes = await buildVotesResponse(stage.voting.providerId, stage.type);
    // const stageParam = printStageParam(stage.type);
    //   }
    // }

    res.status(200).json({ success: true });
  } catch (error) {
    // TODO: Handle error cases
    if (error instanceof Error) logger.error(error.message);
    else logger.error(JSON.stringify(error));
    res.status(500).json({ error: { message: "Internal server error" } });
  }
}
