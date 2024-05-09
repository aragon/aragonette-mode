import { type IProposalVote, type IProposal } from "@/features/proposals";
import { checkParam, parseStageParam, printStageParam } from "@/utils/api-utils";
import { type IPaginatedResponse, type IError } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { getCachedVotes } from "@/features/proposals/providers/utils/votes-builder";
import VercelCache from "@/services/cache/VercelCache";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IPaginatedResponse<IProposalVote> | IError>
) {
  const { proposal_id: proposalId, stage: stageId } = req.query;

  try {
    const parsedProposalId = checkParam(proposalId, "proposalId");
    const parsedStage = checkParam(stageId, "stage");
    const stageEnum = parseStageParam(parsedStage);

    const votes = await getCachedVotes(parsedProposalId, stageEnum);

    res.status(200).json({ data: votes, pagination: { total: votes.length } });
  } catch (error: any) {
    // TODO: Handle error cases
    res.status(400).json({ error: { message: error.message } });
  }
}
