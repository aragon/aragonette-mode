import { type IProposalVote } from "@/features/proposals";
import { checkParam, parseStageParam, printStageParam } from "@/utils/api-utils";
import { type IPaginatedResponse, type IError } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";
import VercelCache from "@/services/cache/VercelCache";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IPaginatedResponse<IProposalVote> | IError>
) {
  const { proposal_id: proposalId, stage } = req.query;

  try {
    const parsedProposalId = checkParam(proposalId, "proposalId");
    const parsedStage = checkParam(stage, "stage");

    const cache = new VercelCache();

    const stageEnum = printStageParam(parseStageParam(parsedStage));

    const votes = (await cache.get<IProposalVote[]>(`votes-PIP-${parsedProposalId}-${stageEnum}`)) ?? [];

    res.status(200).json({ data: votes, pagination: { total: votes.length } });
  } catch (error: any) {
    // TODO: Handle error cases
    res.status(400).json({ error: { message: error.message } });
  }
}
