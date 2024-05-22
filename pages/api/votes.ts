import { type IProposalVote } from "@/features/proposals";
import { buildVotesResponse } from "@/features/proposals/providers/utils/votes-builder";
import { checkParam, parseStageParam } from "@/utils/api-utils";
import { type IError, type IPaginatedResponse } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { logger } from "@/services/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IPaginatedResponse<IProposalVote> | IError>
) {
  const { proposalId, stage } = req.query;

  try {
    const parsedProposalId = checkParam(proposalId, "proposalId");
    const parsedStage = checkParam(stage, "stage");
    const stageEnum = parseStageParam(parsedStage);

    const votes = await buildVotesResponse(parsedProposalId, stageEnum);

    res.status(200).json({ data: votes, pagination: { page: 1, limit: 100, total: votes.length, pages: 1 } });
  } catch (error: any) {
    // TODO: Handle error cases
    logger.error(error.message);
    res.status(500).json({ error: { message: "Internal server error" } });
  }
}
