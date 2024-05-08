import { type IProposalVote } from "@/features/proposals";
import { buildVotesResponse } from "@/features/proposals/providers/utils/votes-builder";
import { checkParam, parseStageParam } from "@/utils/api-utils";
import { type IPaginatedResponse, type IError } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IPaginatedResponse<IProposalVote> | IError>
) {
  const { proposal_id: proposalId, stage } = req.query;

  try {
    const parsedProposalId = checkParam(proposalId, "proposalId");
    const parsedStage = checkParam(stage, "stage");

    const votes = await buildVotesResponse(parsedProposalId, parseStageParam(parsedStage));

    res.status(200).json({ data: votes, pagination: { total: votes.length } });
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message } });
  }
}
