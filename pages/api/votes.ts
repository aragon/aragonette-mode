import { type IProposalVote } from "@/features/proposals";
import { buildVotesResponse } from "@/features/proposals/providers/utils/votes-builder";
import { checkParam, parseStageParam } from "@/utils/api-utils";
import { type IError, type IPaginatedResponse } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IPaginatedResponse<IProposalVote> | IError>
) {
  const { proposalId, stageId } = req.query;

  try {
    const parsedProposalId = checkParam(proposalId, "proposalId");
    const parsedStage = checkParam(stageId, "stage");
    const stageEnum = parseStageParam(parsedStage);

    const votes = await buildVotesResponse(parsedProposalId, stageEnum);

    res.status(200).json({ data: votes, pagination: { total: votes.length } });
  } catch (error: any) {
    // TODO: Handle error cases
    res.status(400).json({ error: { message: error.message } });
  }
}
