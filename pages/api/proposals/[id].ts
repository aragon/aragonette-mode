import { type IProposal, StageOrder, StageStatus, ProposalStages } from "@/features/proposals";
import { buildProposalResponse, buildVotingResponse } from "@/features/proposals/providers";
import proposalRepository from "@/features/proposals/repository/proposal";
import { logger } from "@/services/logger";
import { checkParam } from "@/utils/api-utils";
import { type IError } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse<IProposal | IError>) {
  const { id } = req.query;
  const parsedId = checkParam(id, "proposalId");

  try {
    let proposal = await proposalRepository.getProposalById(parsedId);

    if (!proposal) {
      return res.status(404).json({ error: { message: "Proposal not found" } });
    }

    proposal.stages.sort((a, b) => {
      return StageOrder[a.type] - StageOrder[b.type];
    });

    logger.info(`Building fresh proposal: ${parsedId}`);
    proposal = await buildProposalResponse(proposal);

    // for (const [index, stage] of proposal.stages.entries()) {
    //   //TODO: Check if active after fixing dates/statuses [new Date(stage.voting.endDate) < new Date()]?
    //   const res = await buildVotingResponse(stage);
    //   if (res) {
    //     const [voting, status, overallStatus] = res;
    //     // TODO: Update stage and proposal statuses in the database
    //     stage.voting = voting;
    //     stage.status = status;
    //     proposal.status = overallStatus;
    //     if (
    //       status === StageStatus.APPROVED &&
    //       stage.type != ProposalStages.COUNCIL_CONFIRMATION &&
    //       !proposal.isEmergency &&
    //       index === proposal.stages.length - 1
    //     ) {
    //       try {
    //         logger.info("Building fresh proposal");
    //         const freshProposal = await buildProposalResponse(proposal);
    //         await proposalRepository.upsertProposal(freshProposal);
    //         proposal = freshProposal;
    //         logger.info("Saving fresh proposal");
    //       } catch (error) {
    //         logger.error("Failed to update proposal", error);
    //       }
    //     }
    //   }
    // }

    res.status(200).json(proposal);
  } catch (error) {
    res.status(500).json({ error: { message: "Server error" } });
  }
}
