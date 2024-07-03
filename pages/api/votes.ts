import { type IProposalVote } from "@/features/proposals";
import { buildVotesResponse } from "@/server/services/builders/votes-builder";
import { checkParam, checkNullableParam, parseStageParam } from "@/server/utils";
import { type IError, type IPaginatedResponse } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { logger } from "@/services/logger";
import proposalRepository from "@/server/models/proposals";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IPaginatedResponse<IProposalVote> | IError>
) {
  try {
    const { proposalId, stage, page, limit } = req.query;

    const parsedPage = checkNullableParam(page, "page");
    const parsedLimit = checkNullableParam(limit, "limit");
    const parsedProposalId = checkParam(proposalId, "proposalId");
    const parsedStage = checkParam(stage, "stage");
    const stageEnum = parseStageParam(parsedStage);

    let pageInt = parseInt(parsedPage ?? "1", 10);
    let limitInt = parseInt(parsedLimit ?? "10", 10);

    if (isNaN(limitInt) || limitInt < 1 || limitInt > 100) {
      limitInt = 10;
    }

    if (isNaN(pageInt) || pageInt < 1) {
      pageInt = 1;
    }

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

    const votes = await buildVotesResponse(proposalStage.voting, stageEnum, pageInt, limitInt);

    res.status(200).json(votes);
  } catch (error: any) {
    // TODO: Handle error cases
    logger.error(error.message);
    res.status(500).json({ error: { message: "Internal server error" } });
  }
}
