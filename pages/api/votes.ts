import { type IProposalVote } from "@/features/proposals";
import proposalRepository from "@/server/models/proposals";
import { buildVotesResponse } from "@/server/services/builders/votes-builder";
import { checkParam, parseStageParam } from "@/server/utils";
import { logger } from "@/services/logger";
import { type IError, type IPaginatedResponse } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IPaginatedResponse<IProposalVote> | IError>
) {
  const { proposalId, stage } = req.query;

  try {
    const parsedProposalId = checkParam(proposalId, "proposalId");
    const parsedStage = checkParam(stage, "stage");
    const stageEnum = parseStageParam(parsedStage);

    const proposal = await proposalRepository.getProposalById(parsedProposalId);

    if (!proposal) {
      return res.status(404).json({ error: { message: "Proposal not found" } });
    }

    const proposalStage = proposal.stages.find((s) => s.id === `${proposal.id}-${stageEnum}`);

    if (!proposalStage) {
      return res.status(404).json({ error: { message: "Stage not found" } });
    }

    //TODO: Check if active after fixing dates/statuses [new Date(stage.voting.endDate) < new Date()]?
    if (!proposalStage.voting) {
      return res.status(404).json({ error: { message: "Voting not found" } });
    }

    const votes = await buildVotesResponse(proposalStage.voting.providerId, stageEnum);
    res.status(200).json({ data: votes, pagination: { page: 1, limit: 100, total: votes.length, pages: 1 } });
  } catch (error: any) {
    // TODO: Handle error cases
    logger.error(error.message);
    res.status(500).json({ error: { message: "Internal server error" } });
  }
}
